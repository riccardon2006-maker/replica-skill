// Local-first store. Everything lives in memory and is written to
// localStorage on every change, so a reload or a dead connection never loses
// a set. Phase 2 sync (Supabase) subscribes to the same change events.
import { useSyncExternalStore } from 'react';
import { LIBRARY } from './library';
import type {
  ActiveWorkout,
  DbState,
  Exercise,
  LoggedSet,
  Measurement,
  Routine,
  RoutineExercise,
  Settings,
  Workout,
  WorkoutExercise,
} from './types';

const KEY = 'barline:v1';

export const DEFAULT_SETTINGS: Settings = { units: 'kg', defaultRestS: 90, rpeEnabled: false };

const empty = (): DbState => ({
  exercises: [],
  routines: [],
  workouts: [],
  measurements: [],
  settings: { ...DEFAULT_SETTINGS },
  active: null,
});

function load(): DbState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<DbState>;
    return { ...empty(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch {
    return empty();
  }
}

let state: DbState = load();
const listeners = new Set<() => void>();

function commit(next: DbState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory, the UI still shows the data.
  }
  listeners.forEach((l) => l());
}

// Another tab changed the data: pick it up.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export const getState = () => state;
export function useDb(): DbState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function allExercises(s: DbState = state): Exercise[] {
  return [...LIBRARY, ...s.exercises].sort((a, b) => a.name.localeCompare(b.name));
}
export function exerciseById(id: string, s: DbState = state): Exercise | undefined {
  return LIBRARY.find((e) => e.id === id) ?? s.exercises.find((e) => e.id === id);
}

export const newSet = (partial: Partial<LoggedSet> = {}): LoggedSet => ({
  id: uid(),
  type: 'normal',
  weightKg: null,
  reps: null,
  durationS: null,
  rpe: null,
  done: false,
  ...partial,
});

// ---------- settings ----------
export function saveSettings(patch: Partial<Settings>) {
  commit({ ...state, settings: { ...state.settings, ...patch } });
}

// ---------- custom exercises ----------
export function saveExercise(e: Omit<Exercise, 'id' | 'custom'> & { id?: string }): Exercise {
  const name = e.name.trim();
  if (!name) throw new Error('Give the exercise a name.');
  const clash = allExercises().find((x) => x.name.toLowerCase() === name.toLowerCase() && x.id !== e.id);
  if (clash) throw new Error(`"${clash.name}" is already in the library.`);
  const ex: Exercise = { ...e, name, id: e.id ?? `cus-${uid()}`, custom: true };
  const others = state.exercises.filter((x) => x.id !== ex.id);
  commit({ ...state, exercises: [...others, ex] });
  return ex;
}

// ---------- routines ----------
export function saveRoutine(r: Routine) {
  const title = r.title.trim();
  if (!title) throw new Error('Give the routine a name.');
  const next = { ...r, title, folder: r.folder.trim(), updatedAt: Date.now() };
  const exists = state.routines.some((x) => x.id === r.id);
  commit({
    ...state,
    routines: exists ? state.routines.map((x) => (x.id === r.id ? next : x)) : [...state.routines, next],
  });
}
export function deleteRoutine(id: string) {
  commit({ ...state, routines: state.routines.filter((r) => r.id !== id) });
}
export function duplicateRoutine(id: string) {
  const r = state.routines.find((x) => x.id === id);
  if (!r) return;
  saveRoutine({
    ...structuredClone(r),
    id: uid(),
    title: `${r.title} (copy)`,
    exercises: r.exercises.map((e) => ({ ...e, id: uid(), sets: e.sets.map((s) => ({ ...s, id: uid() })) })),
  });
}

function routineFromExercises(exs: WorkoutExercise[]): RoutineExercise[] {
  return exs.map((e) => ({
    id: uid(),
    exerciseId: e.exerciseId,
    notes: e.notes,
    restS: e.restS,
    supersetGroup: e.supersetGroup,
    sets: e.sets.map((s) => ({ id: uid(), type: s.type, weightKg: s.weightKg, reps: s.reps })),
  }));
}

export function routineFromWorkout(w: Workout, title: string): Routine {
  const r: Routine = { id: uid(), title, notes: '', folder: '', exercises: routineFromExercises(w.exercises), updatedAt: Date.now() };
  saveRoutine(r);
  return r;
}

/** True when the logged workout no longer matches its routine's structure. */
export function routineDiffers(w: { routineId: string | null; exercises: WorkoutExercise[] }): boolean {
  const r = w.routineId ? state.routines.find((x) => x.id === w.routineId) : undefined;
  if (!r) return false;
  if (r.exercises.length !== w.exercises.length) return true;
  return r.exercises.some((re, i) => {
    const we = w.exercises[i];
    return (
      re.exerciseId !== we.exerciseId ||
      re.sets.length !== we.sets.length ||
      re.restS !== we.restS ||
      re.supersetGroup !== we.supersetGroup ||
      re.sets.some((s, j) => s.type !== we.sets[j].type)
    );
  });
}

export function updateRoutineFromWorkout(w: Workout) {
  const r = w.routineId ? state.routines.find((x) => x.id === w.routineId) : undefined;
  if (!r) return;
  saveRoutine({ ...r, exercises: routineFromExercises(w.exercises) });
}

// ---------- active workout ----------
export function startWorkout(routine?: Routine): ActiveWorkout {
  const a: ActiveWorkout = {
    id: uid(),
    title: routine?.title ?? '',
    startedAt: Date.now(),
    routineId: routine?.id ?? null,
    rest: null,
    editing: null,
    exercises: (routine?.exercises ?? []).map((re) => ({
      id: uid(),
      exerciseId: re.exerciseId,
      notes: re.notes,
      restS: re.restS,
      supersetGroup: re.supersetGroup,
      sets: re.sets.map((s) => newSet({ type: s.type, weightKg: s.weightKg, reps: s.reps })),
    })),
  };
  commit({ ...state, active: a });
  return a;
}

export function editWorkout(w: Workout) {
  const a: ActiveWorkout = {
    id: w.id,
    title: w.title,
    startedAt: w.startedAt,
    routineId: w.routineId,
    rest: null,
    editing: { workoutId: w.id, endedAt: w.endedAt, description: w.description },
    exercises: structuredClone(w.exercises),
  };
  commit({ ...state, active: a });
}

export function updateActive(fn: (a: ActiveWorkout) => ActiveWorkout) {
  if (!state.active) return;
  commit({ ...state, active: fn(state.active) });
}

export function discardActive() {
  commit({ ...state, active: null });
}

/** Drops unfinished sets and empty exercises. Returns the cleaned exercises. */
export function completedExercises(a: ActiveWorkout): WorkoutExercise[] {
  return a.exercises
    .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
    .filter((e) => e.sets.length > 0);
}

export function finishActive(opts: { title: string; description: string; updateRoutine: boolean }): Workout {
  const a = state.active;
  if (!a) throw new Error('No workout in progress.');
  const exercises = completedExercises(a);
  if (exercises.length === 0) throw new Error('Complete at least one set before saving.');
  const w: Workout = {
    id: a.editing?.workoutId ?? a.id,
    title: opts.title.trim() || 'Workout',
    description: opts.description.trim(),
    startedAt: a.startedAt,
    endedAt: a.editing ? a.editing.endedAt : Date.now(),
    routineId: a.routineId,
    exercises,
  };
  const exists = state.workouts.some((x) => x.id === w.id);
  commit({
    ...state,
    active: null,
    workouts: exists ? state.workouts.map((x) => (x.id === w.id ? w : x)) : [...state.workouts, w],
  });
  if (opts.updateRoutine) updateRoutineFromWorkout(w);
  return w;
}

export function deleteWorkout(id: string) {
  commit({ ...state, workouts: state.workouts.filter((w) => w.id !== id) });
}

// ---------- measurements ----------
export function saveMeasurement(m: Omit<Measurement, 'id'>) {
  if (!(m.bodyWeightKg > 0)) throw new Error('Enter a body weight above zero.');
  // One entry per day: a second entry the same day replaces the first.
  const others = state.measurements.filter((x) => x.date !== m.date);
  commit({ ...state, measurements: [...others, { ...m, id: uid() }] });
}
export function deleteMeasurement(id: string) {
  commit({ ...state, measurements: state.measurements.filter((m) => m.id !== id) });
}

// ---------- whole database ----------
export function deleteAllData() {
  commit(empty());
}
export function replaceAll(next: DbState) {
  commit(next);
}

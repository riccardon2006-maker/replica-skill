// Pure functions over workouts. No storage, no React: unit tested in stats.test.ts.
import type { LoggedSet, Units, Workout, WorkoutExercise } from './types';

export const LB_PER_KG = 2.2046226218;

export function toDisplay(kg: number | null, units: Units): number | null {
  if (kg == null) return null;
  const v = units === 'kg' ? kg : kg * LB_PER_KG;
  return Math.round(v * 10) / 10;
}

export function fromDisplay(v: number | null, units: Units): number | null {
  if (v == null || Number.isNaN(v)) return null;
  const kg = units === 'kg' ? v : v / LB_PER_KG;
  return Math.round(kg * 1000) / 1000;
}

const NUM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
export const fmtNum = (v: number) => NUM.format(v);

export function fmtWeight(kg: number | null, units: Units): string {
  const v = toDisplay(kg, units);
  return v == null ? '–' : `${fmtNum(v)} ${units}`;
}

/** Epley estimate. Only meaningful for 1 to 12 reps. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export const isWorkSet = (s: LoggedSet) => s.done && s.type !== 'warmup';

export function setVolume(s: LoggedSet): number {
  return (s.weightKg ?? 0) * (s.reps ?? 0);
}

export function exerciseVolume(e: WorkoutExercise): number {
  return e.sets.filter(isWorkSet).reduce((a, s) => a + setVolume(s), 0);
}

export function workoutVolume(w: { exercises: WorkoutExercise[] }): number {
  return w.exercises.reduce((a, e) => a + exerciseVolume(e), 0);
}

export function doneSetCount(w: { exercises: WorkoutExercise[] }): number {
  return w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
}

export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export function fmtClock(s: number): string {
  const v = Math.max(0, Math.ceil(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
}

export interface ExerciseBests {
  heaviestKg: number;
  best1RM: number;
  bestSetVolume: number;
  mostReps: number;
}

export function bestsFor(exerciseId: string, workouts: Workout[]): ExerciseBests {
  const b: ExerciseBests = { heaviestKg: 0, best1RM: 0, bestSetVolume: 0, mostReps: 0 };
  for (const w of workouts)
    for (const e of w.exercises) {
      if (e.exerciseId !== exerciseId) continue;
      for (const s of e.sets) {
        if (!isWorkSet(s)) continue;
        const kg = s.weightKg ?? 0;
        const reps = s.reps ?? 0;
        b.heaviestKg = Math.max(b.heaviestKg, kg);
        b.best1RM = Math.max(b.best1RM, estimate1RM(kg, reps));
        b.bestSetVolume = Math.max(b.bestSetVolume, kg * reps);
        b.mostReps = Math.max(b.mostReps, reps);
      }
    }
  return b;
}

export type RecordKind = 'heaviest' | 'e1rm' | 'volume' | 'reps';
export interface RecordHit {
  exerciseId: string;
  kind: RecordKind;
  value: number;
}

/**
 * Records set by `w` compared with every workout that started before it.
 * A first ever session for an exercise sets no records: nothing to beat.
 */
export function recordsIn(w: Workout, all: Workout[]): RecordHit[] {
  const before = all.filter((o) => o.id !== w.id && o.startedAt < w.startedAt);
  const hits: RecordHit[] = [];
  const seen = new Set<string>();
  for (const e of w.exercises) {
    if (seen.has(e.exerciseId)) continue;
    seen.add(e.exerciseId);
    const hadHistory = before.some((o) => o.exercises.some((x) => x.exerciseId === e.exerciseId && x.sets.some(isWorkSet)));
    if (!hadHistory) continue;
    const prev = bestsFor(e.exerciseId, before);
    const now = bestsFor(e.exerciseId, [w]);
    const weighted = now.heaviestKg > 0;
    if (weighted && now.heaviestKg > prev.heaviestKg) hits.push({ exerciseId: e.exerciseId, kind: 'heaviest', value: now.heaviestKg });
    if (weighted && now.best1RM > prev.best1RM + 1e-9) hits.push({ exerciseId: e.exerciseId, kind: 'e1rm', value: now.best1RM });
    if (weighted && now.bestSetVolume > prev.bestSetVolume) hits.push({ exerciseId: e.exerciseId, kind: 'volume', value: now.bestSetVolume });
    if (!weighted && now.mostReps > prev.mostReps) hits.push({ exerciseId: e.exerciseId, kind: 'reps', value: now.mostReps });
  }
  return hits;
}

/** The sets of the most recent earlier workout that had this exercise. */
export function previousSets(exerciseId: string, workouts: Workout[], beforeMs = Infinity, excludeId?: string): LoggedSet[] {
  let best: Workout | null = null;
  for (const w of workouts) {
    if (w.id === excludeId || w.startedAt >= beforeMs) continue;
    if (!w.exercises.some((e) => e.exerciseId === exerciseId)) continue;
    if (!best || w.startedAt > best.startedAt) best = w;
  }
  if (!best) return [];
  return best.exercises.find((e) => e.exerciseId === exerciseId)!.sets.filter((s) => s.done);
}

/** Monday 00:00 local time of the week containing `ms`. */
export function weekStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function weeklyCounts(workouts: Workout[], weeks: number, now = Date.now()) {
  const start = weekStart(now);
  const out: { week: number; workouts: number; volume: number; minutes: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - 7 * i);
    out.push({ week: d.getTime(), workouts: 0, volume: 0, minutes: 0 });
  }
  for (const w of workouts) {
    const ws = weekStart(w.startedAt);
    const slot = out.find((o) => o.week === ws);
    if (!slot) continue;
    slot.workouts += 1;
    slot.volume += workoutVolume(w);
    slot.minutes += (w.endedAt - w.startedAt) / 60000;
  }
  return out;
}

export function localDateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function defaultTitle(ms: number): string {
  const h = new Date(ms).getHours();
  if (h < 5) return 'Night session';
  if (h < 12) return 'Morning session';
  if (h < 17) return 'Afternoon session';
  return 'Evening session';
}

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function workoutsToCsv(workouts: Workout[], nameOf: (id: string) => string): string {
  const head = ['workout', 'started_at', 'ended_at', 'exercise', 'set', 'type', 'weight_kg', 'reps', 'duration_s', 'rpe', 'notes'];
  const rows = [head.join(',')];
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt))
    for (const e of w.exercises)
      e.sets.forEach((s, i) =>
        rows.push(
          [w.title, new Date(w.startedAt).toISOString(), new Date(w.endedAt).toISOString(), nameOf(e.exerciseId), i + 1, s.type, s.weightKg, s.reps, s.durationS, s.rpe, e.notes]
            .map(csvCell)
            .join(','),
        ),
      );
  return rows.join('\n') + '\n';
}

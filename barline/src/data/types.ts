// Shapes mirror replica/schema.sql so phase 2 sync maps one to one.
// Weights are always kilograms; the UI converts for display.

export type Units = 'kg' | 'lb';
export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';
export type ExerciseKind = 'weight_reps' | 'bodyweight_reps' | 'duration';
export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  muscle: string;
  kind: ExerciseKind;
  custom: boolean;
}

export interface LoggedSet {
  id: string;
  type: SetType;
  weightKg: number | null;
  reps: number | null;
  durationS: number | null;
  rpe: number | null;
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  notes: string;
  restS: number;
  supersetGroup: number | null;
  sets: LoggedSet[];
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  startedAt: number; // epoch ms, UTC
  endedAt: number;
  routineId: string | null;
  exercises: WorkoutExercise[];
}

export interface RestTimer {
  endsAt: number;
  totalS: number;
}

export interface ActiveWorkout {
  id: string;
  title: string;
  startedAt: number;
  routineId: string | null;
  exercises: WorkoutExercise[];
  rest: RestTimer | null;
  // Set when a saved workout is being edited instead of logged live.
  editing: { workoutId: string; endedAt: number; description: string } | null;
}

export interface RoutineSet {
  id: string;
  type: SetType;
  weightKg: number | null;
  reps: number | null;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  notes: string;
  restS: number;
  supersetGroup: number | null;
  sets: RoutineSet[];
}

export interface Routine {
  id: string;
  title: string;
  notes: string;
  folder: string;
  exercises: RoutineExercise[];
  updatedAt: number;
}

export interface Measurement {
  id: string;
  date: string; // YYYY-MM-DD
  bodyWeightKg: number;
}

export interface Settings {
  units: Units;
  defaultRestS: number;
  rpeEnabled: boolean;
}

export interface DbState {
  exercises: Exercise[]; // custom only; built-ins live in library.ts
  routines: Routine[];
  workouts: Workout[];
  measurements: Measurement[];
  settings: Settings;
  active: ActiveWorkout | null;
}

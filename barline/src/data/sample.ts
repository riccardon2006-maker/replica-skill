// Sample data so a new user (and the tests) can see every screen filled.
// Made-up training log for a made-up lifter. No real people.
import { getState, replaceAll, uid } from './store';
import type { Routine, Workout, WorkoutExercise } from './types';

type Plan = { title: string; lifts: [string, number, number, number][] }; // id, start kg, reps, sets

const PLANS: Plan[] = [
  {
    title: 'Push',
    lifts: [
      ['lib-barbell-bench-press', 60, 8, 3],
      ['lib-overhead-press', 35, 8, 3],
      ['lib-dumbbell-lateral-raise', 8, 12, 3],
      ['lib-triceps-pushdown', 20, 12, 3],
    ],
  },
  {
    title: 'Pull',
    lifts: [
      ['lib-barbell-deadlift', 100, 5, 3],
      ['lib-lat-pulldown', 50, 10, 3],
      ['lib-seated-cable-row', 45, 10, 3],
      ['lib-dumbbell-curl', 10, 12, 3],
    ],
  },
  {
    title: 'Legs',
    lifts: [
      ['lib-barbell-back-squat', 80, 6, 3],
      ['lib-romanian-deadlift', 60, 8, 3],
      ['lib-leg-press', 120, 10, 3],
      ['lib-standing-calf-raise', 40, 12, 3],
    ],
  },
];

export function loadSample(now = Date.now()) {
  const routines: Routine[] = PLANS.map((p) => ({
    id: uid(),
    title: p.title,
    notes: '',
    folder: 'Push Pull Legs',
    updatedAt: now,
    exercises: p.lifts.map(([exerciseId, kg, reps, sets]) => ({
      id: uid(),
      exerciseId,
      notes: '',
      restS: 120,
      supersetGroup: null,
      sets: Array.from({ length: sets }, () => ({ id: uid(), type: 'normal' as const, weightKg: kg, reps })),
    })),
  }));

  const workouts: Workout[] = [];
  const day = 86400000;
  // Three sessions a week for six weeks, slowly getting stronger.
  for (let i = 0; i < 18; i++) {
    const p = PLANS[i % 3];
    const daysAgo = 42 - Math.floor(i / 3) * 7 - (i % 3) * 2;
    const start = new Date(now - daysAgo * day);
    start.setHours(18, 0, 0, 0);
    const week = Math.floor(i / 3);
    // Each lift has its own pace (every week, every 2, 3, 4 weeks), so sessions beat a varying number of lifts.
    const exercises: WorkoutExercise[] = p.lifts.map(([exerciseId, kg, reps, sets], j) => ({
      id: uid(),
      exerciseId,
      notes: '',
      restS: 120,
      supersetGroup: null,
      sets: Array.from({ length: sets }, () => ({
        id: uid(),
        type: 'normal' as const,
        weightKg: kg + Math.floor(week / (j + 1)) * (kg >= 20 ? 2.5 : 0.5),
        reps,
        durationS: null,
        rpe: null,
        done: true,
      })),
    }));
    workouts.push({
      id: uid(),
      title: p.title,
      description: '',
      startedAt: start.getTime(),
      endedAt: start.getTime() + (55 + (i % 4) * 5) * 60000,
      routineId: routines[i % 3].id,
      exercises,
    });
  }

  const measurements = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (42 - i * 7) * day);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { id: uid(), date: key, bodyWeightKg: 82 - i * 0.3 };
  });

  const s = getState();
  replaceAll({ ...s, routines: [...s.routines, ...routines], workouts: [...s.workouts, ...workouts], measurements: [...s.measurements, ...measurements] });
}

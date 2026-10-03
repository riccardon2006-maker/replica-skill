import { describe, expect, it } from 'vitest';
import {
  estimate1RM,
  fmtClock,
  fmtDuration,
  fmtWeight,
  fromDisplay,
  previousSets,
  recordsIn,
  toDisplay,
  weekStart,
  weeklyCounts,
  workoutVolume,
  workoutsToCsv,
} from './stats';
import type { LoggedSet, Workout } from './types';

const set = (weightKg: number | null, reps: number | null, extra: Partial<LoggedSet> = {}): LoggedSet => ({
  id: Math.random().toString(36),
  type: 'normal',
  weightKg,
  reps,
  durationS: null,
  rpe: null,
  done: true,
  ...extra,
});

const workout = (id: string, startedAt: number, sets: LoggedSet[], exerciseId = 'bench'): Workout => ({
  id,
  title: id,
  description: '',
  startedAt,
  endedAt: startedAt + 3600000,
  routineId: null,
  exercises: [{ id: id + 'e', exerciseId, notes: '', restS: 90, supersetGroup: null, sets }],
});

describe('units', () => {
  it('round-trips pounds without drift', () => {
    for (const lb of [45, 95, 135, 225, 315, 2.5]) {
      expect(toDisplay(fromDisplay(lb, 'lb'), 'lb')).toBe(lb);
    }
  });
  it('formats', () => {
    expect(fmtWeight(100, 'kg')).toBe('100 kg');
    expect(fmtWeight(100, 'lb')).toBe('220.5 lb');
    expect(fmtWeight(null, 'kg')).toBe('–');
  });
});

describe('maths', () => {
  it('estimates 1RM with Epley', () => {
    expect(estimate1RM(100, 1)).toBe(100);
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
    expect(estimate1RM(0, 5)).toBe(0);
  });
  it('volume skips warm-ups and unfinished sets', () => {
    const w = workout('a', 0, [set(100, 5), set(50, 10, { type: 'warmup' }), set(100, 5, { done: false })]);
    expect(workoutVolume(w)).toBe(500);
  });
  it('formats clocks', () => {
    expect(fmtClock(90)).toBe('1:30');
    expect(fmtClock(-3)).toBe('0:00');
    expect(fmtDuration(3725000)).toBe('1h 2m');
    expect(fmtDuration(65000)).toBe('1m 05s');
  });
});

describe('records', () => {
  const day = 86400000;
  it('needs history to set a record', () => {
    const w1 = workout('w1', day, [set(100, 5)]);
    expect(recordsIn(w1, [w1])).toEqual([]);
  });
  it('finds a heavier set and a better estimate', () => {
    const w1 = workout('w1', day, [set(100, 5)]);
    const w2 = workout('w2', 2 * day, [set(105, 5)]);
    const kinds = recordsIn(w2, [w1, w2]).map((r) => r.kind).sort();
    expect(kinds).toEqual(['e1rm', 'heaviest', 'volume']);
  });
  it('ignores later workouts when judging an older one', () => {
    const w1 = workout('w1', day, [set(100, 5)]);
    const w2 = workout('w2', 2 * day, [set(90, 5)]);
    const w3 = workout('w3', 3 * day, [set(120, 5)]);
    expect(recordsIn(w2, [w1, w2, w3])).toEqual([]);
  });
  it('counts reps for bodyweight work', () => {
    const w1 = workout('w1', day, [set(null, 8)], 'pullup');
    const w2 = workout('w2', 2 * day, [set(null, 10)], 'pullup');
    expect(recordsIn(w2, [w1, w2])).toEqual([{ exerciseId: 'pullup', kind: 'reps', value: 10 }]);
  });
});

describe('history helpers', () => {
  it('previousSets returns the latest earlier session', () => {
    const w1 = workout('w1', 1, [set(80, 5)]);
    const w2 = workout('w2', 2, [set(90, 5)]);
    expect(previousSets('bench', [w1, w2])[0].weightKg).toBe(90);
    expect(previousSets('bench', [w1, w2], 2)[0].weightKg).toBe(80);
    expect(previousSets('squat', [w1, w2])).toEqual([]);
  });
  it('weeks start on Monday', () => {
    const wed = new Date(2026, 8, 30, 15).getTime(); // Wed 30 Sep 2026
    expect(new Date(weekStart(wed)).getDate()).toBe(28);
  });
  it('weekly counts bucket workouts', () => {
    const now = new Date(2026, 8, 30, 12).getTime();
    const w = workout('a', now - 3600000, [set(100, 5)]);
    const weeks = weeklyCounts([w], 4, now);
    expect(weeks).toHaveLength(4);
    expect(weeks[3].workouts).toBe(1);
    expect(weeks[3].volume).toBe(500);
  });
  it('exports CSV with quoting', () => {
    const w = { ...workout('a', 0, [set(100, 5)]), title: 'Push, heavy' };
    const csv = workoutsToCsv([w], () => 'Bench "flat"');
    expect(csv.split('\n')[1]).toContain('"Push, heavy"');
    expect(csv).toContain('"Bench ""flat"""');
  });
});

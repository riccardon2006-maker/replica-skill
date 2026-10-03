// S04 library, S09 exercise detail, S12 custom exercise.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, SearchX } from 'lucide-react';
import { exerciseById, saveExercise, useDb } from '../data/store';
import { EQUIPMENT, MUSCLES } from '../data/library';
import { bestsFor, estimate1RM, fmtWeight, isWorkSet } from '../data/stats';
import type { Equipment, ExerciseKind } from '../data/types';
import { ExerciseLibrary } from '../components/ExerciseList';
import { LineChart } from '../components/charts';
import { Empty, Stat, TopBar } from '../components/ui';
import { fmtDate } from '../components/WorkoutCard';

export function Exercises() {
  return (
    <>
      <TopBar
        title="Exercises"
        back
        actions={
          <Link className="btn ghost sm" to="/exercises/new">
            <Plus size={16} aria-hidden /> Create
          </Link>
        }
      />
      <main className="page">
        <ExerciseLibrary />
      </main>
    </>
  );
}

type Metric = 'e1rm' | 'heaviest' | 'volume' | 'reps';

export function ExerciseDetail() {
  const { id = '' } = useParams();
  const db = useDb();
  const ex = exerciseById(id, db);
  const [metric, setMetric] = useState<Metric>('e1rm');
  if (!ex)
    return (
      <>
        <TopBar title="Exercise" back />
        <main className="page">
          <Empty icon={<SearchX size={40} />} title="Exercise not found" />
        </main>
      </>
    );
  const units = db.settings.units;
  const sessions = db.workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === id && e.sets.some(isWorkSet)))
    .sort((a, b) => a.startedAt - b.startedAt);
  const bests = bestsFor(id, db.workouts);
  const weighted = bests.heaviestKg > 0;
  const toU = (kg: number) => (units === 'kg' ? kg : kg * 2.2046226218);
  const points = sessions.map((w) => {
    const sets = w.exercises.filter((e) => e.exerciseId === id).flatMap((e) => e.sets.filter(isWorkSet));
    const v =
      metric === 'e1rm'
        ? Math.max(...sets.map((s) => estimate1RM(s.weightKg ?? 0, s.reps ?? 0)))
        : metric === 'heaviest'
          ? Math.max(...sets.map((s) => s.weightKg ?? 0))
          : metric === 'volume'
            ? sets.reduce((a, s) => a + (s.weightKg ?? 0) * (s.reps ?? 0), 0)
            : Math.max(...sets.map((s) => s.reps ?? 0));
    return { x: w.startedAt, y: metric === 'reps' ? v : Math.round(toU(v) * 10) / 10, tag: new Date(w.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) };
  });
  const metrics: [Metric, string][] = weighted
    ? [
        ['e1rm', 'Est. 1RM'],
        ['heaviest', 'Heaviest'],
        ['volume', 'Volume'],
      ]
    : [['reps', 'Reps']];
  const shown = metrics.some(([m]) => m === metric) ? metric : metrics[0][0];

  return (
    <>
      <TopBar title={ex.name} back />
      <main className="page">
        <p className="muted" style={{ textTransform: 'capitalize' }}>
          {ex.muscle} · {ex.equipment}
          {ex.custom ? ' · your exercise' : ''}
        </p>
        {sessions.length === 0 ? (
          <Empty icon={<SearchX size={40} />} title="No history yet">
            <p>Log this exercise once and your progress shows up here.</p>
          </Empty>
        ) : (
          <>
            <div className="card">
              <div className="row between wrap">
                <h2 className="section-title">Progress, all time</h2>
                <div className="seg" role="group" aria-label="Chart metric">
                  {metrics.map(([m, label]) => (
                    <button key={m} aria-pressed={shown === m} onClick={() => setMetric(m)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <LineChart data={points} label={`${ex.name} ${metrics.find(([m]) => m === shown)?.[1]}`} unit={shown === 'reps' ? 'reps' : units} />
            </div>
            <div className="card">
              <h2 className="section-title">Records</h2>
              <div className="stats">
                {weighted ? (
                  <>
                    <Stat label="Heaviest" value={fmtWeight(bests.heaviestKg, units)} />
                    <Stat label="Est. 1RM" value={fmtWeight(Math.round(bests.best1RM * 10) / 10, units)} />
                    <Stat label="Best set" value={fmtWeight(bests.bestSetVolume, units)} />
                  </>
                ) : (
                  <Stat label="Most reps" value={bests.mostReps} />
                )}
              </div>
            </div>
            <h2 className="section-title">History</h2>
            <div className="list">
              {[...sessions].reverse().map((w) => (
                <Link key={w.id} className="list-item" to={`/workouts/${w.id}`}>
                  <span className="grow">
                    <span className="strong" style={{ display: 'block' }}>
                      {fmtDate(w.startedAt)}
                    </span>
                    <span className="t-sm muted">
                      {w.exercises
                        .filter((e) => e.exerciseId === id)
                        .flatMap((e) => e.sets.filter(isWorkSet))
                        .map((s) => (s.weightKg ? `${fmtWeight(s.weightKg, units)} × ${s.reps ?? 0}` : ex.kind === 'duration' ? `${s.durationS ?? 0}s` : `${s.reps ?? 0} reps`))
                        .join(', ')}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export function CustomExercise() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState<Equipment>('barbell');
  const [muscle, setMuscle] = useState('chest');
  const [kind, setKind] = useState<ExerciseKind>('weight_reps');
  const [error, setError] = useState('');
  const save = () => {
    try {
      const ex = saveExercise({ name, equipment, muscle, kind });
      nav(`/exercises/${ex.id}`, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <TopBar title="New exercise" back />
      <main className="page no-tabs">
        <p className="t-sm muted">Make as many as you need. There is no limit.</p>
        <label className="field">
          <span>Name</span>
          <input className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landmine Press" aria-invalid={!!error} />
        </label>
        <label className="field">
          <span>Equipment</span>
          <select className="select" value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)}>
            {EQUIPMENT.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Main muscle</span>
          <select className="select" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
            {MUSCLES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>What you log</span>
          <select className="select" value={kind} onChange={(e) => setKind(e.target.value as ExerciseKind)}>
            <option value="weight_reps">Weight and reps</option>
            <option value="bodyweight_reps">Bodyweight reps (extra weight optional)</option>
            <option value="duration">Time</option>
          </select>
        </label>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary lg block" onClick={save}>
          Save exercise
        </button>
      </main>
    </>
  );
}

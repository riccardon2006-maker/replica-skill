// S07: one saved workout.
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CopyPlus, Pencil, Trash2, Trophy } from 'lucide-react';
import { deleteWorkout, editWorkout, exerciseById, routineFromWorkout, useDb } from '../data/store';
import { doneSetCount, estimate1RM, fmtDuration, fmtWeight, recordsIn, workoutVolume, type RecordKind } from '../data/stats';
import { Confirm, Dialog, Empty, Stat, TopBar } from '../components/ui';
import { fmtDate } from '../components/WorkoutCard';

const KIND: Record<RecordKind, string> = { heaviest: 'Heaviest weight', e1rm: 'Best est. 1RM', volume: 'Best set volume', reps: 'Most reps' };

export default function WorkoutDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const db = useDb();
  const nav = useNavigate();
  const w = db.workouts.find((x) => x.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [asRoutine, setAsRoutine] = useState(false);
  const [routineName, setRoutineName] = useState(w?.title ?? '');
  const [busy, setBusy] = useState(false);
  if (!w)
    return (
      <>
        <TopBar title="Workout" back="/" />
        <main className="page">
          <Empty icon={<Trash2 size={40} />} title="This workout is gone">
            <p>It was deleted, or the link is wrong.</p>
            <Link className="btn secondary" to="/">
              Back to home
            </Link>
          </Empty>
        </main>
      </>
    );

  const units = db.settings.units;
  const records = recordsIn(w, db.workouts);
  // One line per exercise: four kinds of record on the same lift is one achievement, not four.
  const byExercise = [...new Set(records.map((r) => r.exerciseId))].map((id) => {
    const hits = records.filter((r) => r.exerciseId === id);
    return { id, hits, top: hits.find((r) => r.kind === 'heaviest') ?? hits[0] };
  });
  const editBlocked = !!db.active && db.active.editing?.workoutId !== w.id;

  return (
    <>
      <TopBar
        title={w.title}
        back="/"
        actions={
          <button
            className="icon-btn"
            aria-label="Edit workout"
            disabled={editBlocked}
            title={editBlocked ? 'Finish the workout in progress first' : undefined}
            onClick={() => {
              if (db.active?.editing?.workoutId !== w.id) editWorkout(w);
              nav('/active');
            }}
          >
            <Pencil size={20} />
          </button>
        }
      />
      <main className="page">
        {params.get('saved') && (
          <div className="card" role="status">
            <p className="h-lg">Saved. Nice work.</p>
            {byExercise.length > 0 ? (
              <p className="muted">
                New personal best on {byExercise.length} exercise{byExercise.length > 1 ? 's' : ''}.
              </p>
            ) : <p className="muted">Every set counts. See you next time.</p>}
          </div>
        )}
        <p className="muted">{fmtDate(w.startedAt)}</p>
        {w.description && <p>{w.description}</p>}
        <div className="stats card">
          <Stat label="Duration" value={fmtDuration(w.endedAt - w.startedAt)} />
          <Stat label="Volume" value={fmtWeight(workoutVolume(w), units)} />
          <Stat label="Sets" value={doneSetCount(w)} />
        </div>
        {records.length > 0 && (
          <section className="card" aria-label="Personal records">
            <h2 className="section-title">Personal records</h2>
            <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {byExercise.map(({ id, hits, top }) => (
                <li key={id} className="row" style={{ alignItems: 'flex-start' }}>
                  <Trophy size={16} aria-hidden style={{ color: 'var(--c-warning)', marginTop: 4 }} />
                  <span className="grow">
                    <span style={{ display: 'block' }}>{exerciseById(id, db)?.name}</span>
                    <span className="t-sm muted">{hits.map((r) => KIND[r.kind]).join(' · ')}</span>
                  </span>
                  <span className="strong">{top.kind === 'reps' ? `${top.value} reps` : fmtWeight(top.kind === 'e1rm' ? Math.round(top.value * 10) / 10 : top.value, units)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {w.exercises.map((e) => {
          const ex = exerciseById(e.exerciseId, db);
          let n = 0;
          return (
            <section key={e.id} className="card" aria-label={ex?.name}>
              <Link to={`/exercises/${e.exerciseId}`} className="strong" style={{ textDecoration: 'none' }}>
                {ex?.name ?? 'Unknown exercise'}
              </Link>
              {e.notes && <p className="t-sm muted">{e.notes}</p>}
              <table className="t-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="muted t-xs" style={{ textAlign: 'left' }}>
                    <th scope="col">Set</th>
                    <th scope="col">Weight × reps</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Est. 1RM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {e.sets.map((s) => {
                    const label = s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : s.type === 'failure' ? 'F' : String(++n);
                    return (
                      <tr key={s.id}>
                        <td style={{ padding: '4px 0', width: 40 }} className="strong">
                          {label}
                        </td>
                        <td>
                          {ex?.kind === 'duration'
                            ? `${s.durationS ?? 0} s`
                            : `${s.weightKg != null && s.weightKg > 0 ? fmtWeight(s.weightKg, units) + ' × ' : ''}${s.reps ?? 0} reps`}
                          {s.rpe != null && <span className="muted"> @ RPE {s.rpe}</span>}
                        </td>
                        <td style={{ textAlign: 'right' }} className="muted">
                          {s.weightKg && s.reps ? fmtWeight(Math.round(estimate1RM(s.weightKg, s.reps) * 10) / 10, units) : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
        <button className="btn secondary block" onClick={() => setAsRoutine(true)}>
          <CopyPlus size={18} aria-hidden /> Save as routine
        </button>
        <button className="btn danger block" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={18} aria-hidden /> Delete workout
        </button>
      </main>
      {confirmDelete && (
        <Confirm
          title="Delete this workout?"
          body="Its sets leave your history and records. This cannot be undone."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteWorkout(w.id);
            nav('/', { replace: true });
          }}
        />
      )}
      {asRoutine && (
        <Dialog title="Save as routine" onClose={() => setAsRoutine(false)}>
          <label className="field">
            <span>Routine name</span>
            <input className="input" value={routineName} maxLength={80} onChange={(e) => setRoutineName(e.target.value)} />
          </label>
          <button
            className="btn primary block"
            disabled={!routineName.trim() || busy}
            onClick={() => {
              setBusy(true);
              const r = routineFromWorkout(w, routineName);
              nav(`/routines/${r.id}`);
            }}
          >
            Save routine
          </button>
        </Dialog>
      )}
    </>
  );
}

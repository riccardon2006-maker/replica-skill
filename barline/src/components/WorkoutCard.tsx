import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { exerciseById, useDb } from '../data/store';
import { fmtDuration, fmtWeight, recordsIn, workoutVolume } from '../data/stats';
import type { Workout } from '../data/types';
import { Stat } from './ui';

export function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function WorkoutCard({ w }: { w: Workout }) {
  const db = useDb();
  // Counts exercises with a new best, not record kinds (one heavy squat is one PR, not three).
  const prs = new Set(recordsIn(w, db.workouts).map((r) => r.exerciseId)).size;
  return (
    <Link className="card link" to={`/workouts/${w.id}`} aria-label={`${w.title}, ${fmtDate(w.startedAt)}`}>
      <div className="row between">
        <div className="grow">
          <h3 className="strong ellipsis">{w.title}</h3>
          <p className="t-sm muted">{fmtDate(w.startedAt)}</p>
        </div>
        {prs > 0 && (
          <span className="badge">
            <Trophy size={14} aria-hidden /> {prs} PR{prs > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="stats">
        <Stat label="Time" value={fmtDuration(w.endedAt - w.startedAt)} />
        <Stat label="Volume" value={fmtWeight(workoutVolume(w), db.settings.units)} />
        <Stat label="Exercises" value={w.exercises.length} />
      </div>
      <ul className="stack t-sm" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 4 }}>
        {w.exercises.slice(0, 4).map((e) => (
          <li key={e.id} className="row">
            <span className="muted" style={{ width: 28 }}>
              {e.sets.length}×
            </span>
            <span className="ellipsis">{exerciseById(e.exerciseId, db)?.name ?? 'Unknown exercise'}</span>
          </li>
        ))}
        {w.exercises.length > 4 && <li className="muted">and {w.exercises.length - 4} more</li>}
      </ul>
    </Link>
  );
}

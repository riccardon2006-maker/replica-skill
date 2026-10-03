import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Search } from 'lucide-react';
import { allExercises, useDb } from '../data/store';
import { EQUIPMENT, MUSCLES } from '../data/library';
import { Dialog, initials } from './ui';

function useFiltered() {
  const db = useDb();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return allExercises(db).filter(
      (e) =>
        (!muscle || e.muscle === muscle) &&
        (!equipment || e.equipment === equipment) &&
        words.every((w) => `${e.name} ${e.muscle} ${e.equipment}`.toLowerCase().includes(w)),
    );
  }, [db, q, muscle, equipment]);
  const muscles = useMemo(() => [...new Set([...MUSCLES, ...db.exercises.map((e) => e.muscle)])].sort(), [db.exercises]);
  return { q, setQ, muscle, setMuscle, equipment, setEquipment, list, muscles };
}

function Filters({ f }: { f: ReturnType<typeof useFiltered> }) {
  return (
    <div className="stack">
      <label className="row" style={{ position: 'relative' }}>
        <span className="sr-only">Search exercises</span>
        <Search size={18} aria-hidden style={{ position: 'absolute', left: 12, color: 'var(--c-text-muted)' }} />
        <input className="input" style={{ paddingLeft: 38 }} type="search" placeholder="Search exercises" value={f.q} onChange={(e) => f.setQ(e.target.value)} />
      </label>
      <div className="row" style={{ overflowX: 'auto', paddingBottom: 4 }} role="group" aria-label="Filter by muscle">
        {f.muscles.map((m) => (
          <button key={m} className="chip" aria-pressed={f.muscle === m} onClick={() => f.setMuscle(f.muscle === m ? null : m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="row" style={{ overflowX: 'auto', paddingBottom: 4 }} role="group" aria-label="Filter by equipment">
        {EQUIPMENT.map((m) => (
          <button key={m} className="chip" aria-pressed={f.equipment === m} onClick={() => f.setEquipment(f.equipment === m ? null : m)}>
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExerciseLibrary() {
  const f = useFiltered();
  return (
    <>
      <Filters f={f} />
      <p className="t-sm muted" aria-live="polite">
        {f.list.length} exercises
      </p>
      {f.list.length === 0 ? (
        <div className="empty">
          <p>Nothing matches. Make it yourself.</p>
          <Link className="btn primary" to="/exercises/new">
            <Plus size={18} aria-hidden /> Create exercise
          </Link>
        </div>
      ) : (
        <div className="list">
          {f.list.map((e) => (
            <Link key={e.id} className="list-item" to={`/exercises/${e.id}`}>
              <span className="avatar" aria-hidden>
                {initials(e.name)}
              </span>
              <span className="grow">
                <span className="strong ellipsis" style={{ display: 'block' }}>
                  {e.name}
                </span>
                <span className="t-sm muted" style={{ textTransform: 'capitalize' }}>
                  {e.muscle} · {e.equipment}
                  {e.custom ? ' · yours' : ''}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export function ExercisePicker({ onPick, onClose }: { onPick: (ids: string[]) => void; onClose: () => void }) {
  const f = useFiltered();
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Dialog title="Add exercises" onClose={onClose} full>
      <Filters f={f} />
      <div className="list" style={{ flex: 1, overflow: 'auto' }}>
        {f.list.map((e) => {
          const on = picked.includes(e.id);
          return (
            <button key={e.id} className="list-item" aria-pressed={on} onClick={() => toggle(e.id)}>
              <span className="avatar" aria-hidden style={on ? { background: 'var(--c-accent)', color: 'var(--c-on-accent)' } : undefined}>
                {on ? <Check size={18} /> : initials(e.name)}
              </span>
              <span className="grow">
                <span className="strong ellipsis" style={{ display: 'block' }}>
                  {e.name}
                </span>
                <span className="t-sm muted" style={{ textTransform: 'capitalize' }}>
                  {e.muscle} · {e.equipment}
                </span>
              </span>
            </button>
          );
        })}
        {f.list.length === 0 && <p className="list-item muted">Nothing matches. Create it from the exercise library.</p>}
      </div>
      <button className="btn primary lg block" disabled={picked.length === 0} onClick={() => onPick(picked)}>
        {picked.length === 0 ? 'Pick exercises' : `Add ${picked.length} exercise${picked.length > 1 ? 's' : ''}`}
      </button>
    </Dialog>
  );
}

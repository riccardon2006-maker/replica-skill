// S03: build or edit a routine. No cap on how many you keep.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Link2, Plus, Trash2 } from 'lucide-react';
import { exerciseById, saveRoutine, uid, useDb } from '../data/store';
import { fromDisplay, toDisplay } from '../data/stats';
import type { Routine, RoutineExercise, RoutineSet, SetType } from '../data/types';
import { ExercisePicker } from '../components/ExerciseList';
import { NumInput } from '../components/NumInput';
import { Empty, TopBar } from '../components/ui';
import { restLabel } from './LiveWorkout';

const REST = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300];
const TYPES: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
const TYPE_SHORT: Record<SetType, string> = { normal: 'Normal', warmup: 'Warm-up', drop: 'Drop', failure: 'Failure' };

export default function RoutineEditor() {
  const { id } = useParams();
  const db = useDb();
  const nav = useNavigate();
  const existing = db.routines.find((r) => r.id === id);
  const [r, setR] = useState<Routine>(
    () => (existing ? structuredClone(existing) : { id: uid(), title: '', notes: '', folder: '', exercises: [], updatedAt: Date.now() }),
  );
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const units = db.settings.units;
  const folders = [...new Set(db.routines.map((x) => x.folder).filter(Boolean))];

  if (id && !existing)
    return (
      <>
        <TopBar title="Routine" back="/workout" />
        <main className="page">
          <Empty icon={<Trash2 size={40} />} title="This routine is gone" />
        </main>
      </>
    );

  const patchEx = (exId: string, fn: (e: RoutineExercise) => RoutineExercise) => setR((x) => ({ ...x, exercises: x.exercises.map((e) => (e.id === exId ? fn(e) : e)) }));
  const patchSet = (exId: string, setId: string, p: Partial<RoutineSet>) =>
    patchEx(exId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...p } : s)) }));

  const save = () => {
    try {
      saveRoutine(r);
      nav('/workout');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const move = (i: number, d: number) =>
    setR((x) => {
      const list = [...x.exercises];
      const [it] = list.splice(i, 1);
      list.splice(i + d, 0, it);
      return { ...x, exercises: list };
    });

  const toggleSuperset = (i: number) =>
    setR((x) => {
      const list = [...x.exercises];
      const a = list[i];
      const b = list[i + 1];
      if (a.supersetGroup != null && a.supersetGroup === b.supersetGroup) {
        list[i + 1] = { ...b, supersetGroup: null };
        if (list[i - 1]?.supersetGroup !== a.supersetGroup) list[i] = { ...a, supersetGroup: null };
      } else {
        const g = a.supersetGroup ?? Math.max(0, ...list.map((e) => e.supersetGroup ?? 0)) + 1;
        list[i] = { ...a, supersetGroup: g };
        list[i + 1] = { ...b, supersetGroup: g };
      }
      return { ...x, exercises: list };
    });

  return (
    <>
      <TopBar
        title={existing ? 'Edit routine' : 'New routine'}
        back="/workout"
        actions={
          <button className="btn primary sm" onClick={save}>
            Save
          </button>
        }
      />
      <main className="page no-tabs">
        <label className="field">
          <span>Routine name</span>
          <input className="input" value={r.title} maxLength={80} placeholder="Upper body A" onChange={(e) => setR({ ...r, title: e.target.value })} />
        </label>
        <label className="field">
          <span>Folder (optional)</span>
          <input className="input" list="folders" value={r.folder} maxLength={40} placeholder="e.g. 4-day split" onChange={(e) => setR({ ...r, folder: e.target.value })} />
          <datalist id="folders">
            {folders.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </label>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        {r.exercises.map((e, i) => {
          const ex = exerciseById(e.exerciseId, db);
          const next = r.exercises[i + 1];
          const linked = next && e.supersetGroup != null && e.supersetGroup === next.supersetGroup;
          const inGroup = e.supersetGroup != null && (linked || r.exercises[i - 1]?.supersetGroup === e.supersetGroup);
          return (
            <section key={e.id} className={`card ex-block${inGroup ? ' superset' : ''}`} aria-label={ex?.name}>
              <div className="ex-head">
                <span className="grow strong ellipsis">{ex?.name}</span>
                <button className="icon-btn" aria-label={`Move ${ex?.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={18} />
                </button>
                <button className="icon-btn" aria-label={`Move ${ex?.name} down`} disabled={!next} onClick={() => move(i, 1)}>
                  <ArrowDown size={18} />
                </button>
                <button className="icon-btn" aria-label={`Remove ${ex?.name}`} onClick={() => setR({ ...r, exercises: r.exercises.filter((x) => x.id !== e.id) })}>
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="row wrap">
                <label className="field grow">
                  <span>Rest</span>
                  <select className="select" value={e.restS} onChange={(ev) => patchEx(e.id, (x) => ({ ...x, restS: Number(ev.target.value) }))}>
                    {REST.map((s) => (
                      <option key={s} value={s}>
                        {restLabel(s)}
                      </option>
                    ))}
                  </select>
                </label>
                {next && (
                  <button className="btn secondary" style={{ alignSelf: 'flex-end', height: 44 }} aria-pressed={!!linked} onClick={() => toggleSuperset(i)}>
                    <Link2 size={16} aria-hidden /> {linked ? 'Unlink' : 'Superset next'}
                  </button>
                )}
              </div>
              <input className="input" aria-label={`Notes for ${ex?.name}`} placeholder="Notes" value={e.notes} onChange={(ev) => patchEx(e.id, (x) => ({ ...x, notes: ev.target.value }))} />
              <div className="sets">
                {e.sets.map((s, si) => (
                  <div key={s.id} className="set-row" style={{ gridTemplateColumns: '96px 1fr 1fr 40px' }}>
                    <select
                      className="select"
                      style={{ minHeight: 36, padding: '0 6px' }}
                      aria-label={`Set ${si + 1} type`}
                      value={s.type}
                      onChange={(ev) => patchSet(e.id, s.id, { type: ev.target.value as SetType })}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_SHORT[t]}
                        </option>
                      ))}
                    </select>
                    <NumInput label={`Set ${si + 1} target weight`} placeholder={units} value={toDisplay(s.weightKg, units)} onChange={(v) => patchSet(e.id, s.id, { weightKg: fromDisplay(v, units) })} />
                    <NumInput label={`Set ${si + 1} target reps`} placeholder="reps" decimals={false} value={s.reps} onChange={(v) => patchSet(e.id, s.id, { reps: v })} />
                    <button className="icon-btn" aria-label={`Delete set ${si + 1}`} onClick={() => patchEx(e.id, (x) => ({ ...x, sets: x.sets.filter((y) => y.id !== s.id) }))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn secondary block"
                onClick={() =>
                  patchEx(e.id, (x) => {
                    const last = x.sets[x.sets.length - 1];
                    return { ...x, sets: [...x.sets, { id: uid(), type: 'normal', weightKg: last?.weightKg ?? null, reps: last?.reps ?? null }] };
                  })
                }
              >
                <Plus size={16} aria-hidden /> Add set
              </button>
            </section>
          );
        })}
        <button className="btn secondary lg block" onClick={() => setPicking(true)}>
          <Plus size={20} aria-hidden /> Add exercise
        </button>
        <button className="btn primary lg block" onClick={save}>
          Save routine
        </button>
      </main>
      {picking && (
        <ExercisePicker
          onClose={() => setPicking(false)}
          onPick={(ids) => {
            setR((x) => ({
              ...x,
              exercises: [
                ...x.exercises,
                ...ids.map((exerciseId) => ({
                  id: uid(),
                  exerciseId,
                  notes: '',
                  restS: db.settings.defaultRestS,
                  supersetGroup: null,
                  sets: Array.from({ length: 3 }, () => ({ id: uid(), type: 'normal' as const, weightKg: null, reps: null })),
                })),
              ],
            }));
            setPicking(false);
          }}
        />
      )}
    </>
  );
}

// S05: the live workout. Every change is written to storage as it happens.
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, Link2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { exerciseById, newSet, uid, updateActive, discardActive, useDb, completedExercises } from '../data/store';
import { doneSetCount, fmtClock, fmtDuration, fmtNum, fmtWeight, fromDisplay, previousSets, toDisplay, workoutVolume } from '../data/stats';
import type { ActiveWorkout, LoggedSet, SetType, WorkoutExercise } from '../data/types';
import { ExercisePicker } from '../components/ExerciseList';
import { NumInput } from '../components/NumInput';
import { Confirm, Dialog, Stat, TopBar, useNow } from '../components/ui';

const TYPE_LABEL: Record<SetType, string> = { normal: 'Normal', warmup: 'Warm-up', drop: 'Drop set', failure: 'To failure' };
const REST_CHOICES = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300];

export const restLabel = (s: number) => (s === 0 ? 'Off' : fmtClock(s));

/** Label shown in the set number column: W, D, F, or the count of normal sets so far. */
function setLabels(sets: LoggedSet[]) {
  let n = 0;
  return sets.map((s) => (s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : s.type === 'failure' ? 'F' : String(++n)));
}

function patchExercise(exId: string, fn: (e: WorkoutExercise) => WorkoutExercise) {
  updateActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id === exId ? fn(e) : e)) }));
}
function patchSet(exId: string, setId: string, patch: Partial<LoggedSet>) {
  patchExercise(exId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }));
}

/** Decides whether ticking this set should start the rest timer, and for how long. */
export function restAfter(a: ActiveWorkout, exIndex: number, setIndex: number): number {
  const e = a.exercises[exIndex];
  if (!e || e.restS <= 0) return 0;
  // Next set is a drop set: go straight into it.
  if (e.sets[setIndex + 1]?.type === 'drop') return 0;
  // In a superset, rest only after the last exercise of the group.
  if (e.supersetGroup != null) {
    const next = a.exercises[exIndex + 1];
    if (next && next.supersetGroup === e.supersetGroup) return 0;
  }
  return e.restS;
}

function RestBar({ rest }: { rest: NonNullable<ActiveWorkout['rest']> }) {
  const now = useNow(250);
  const left = (rest.endsAt - now) / 1000;
  const doneRef = useRef(false);
  useEffect(() => {
    if (left <= 0 && !doneRef.current) {
      doneRef.current = true;
      navigator.vibrate?.(300);
      const t = setTimeout(() => updateActive((a) => ({ ...a, rest: null })), 2500);
      return () => clearTimeout(t);
    }
  }, [left]);
  const adjust = (d: number) =>
    updateActive((a) => (a.rest ? { ...a, rest: { endsAt: a.rest.endsAt + d * 1000, totalS: Math.max(1, a.rest.totalS + d) } } : a));
  return (
    <div className="rest" role="region" aria-label="Rest timer">
      <div className="rest-inner">
        <div className="rest-track" aria-hidden>
          <div className="rest-fill" style={{ width: `${Math.max(0, Math.min(100, (left / rest.totalS) * 100))}%` }} />
        </div>
        <div className="row between">
          <span className="rest-time" role="timer" aria-live="off">
            {left > 0 ? fmtClock(left) : 'Go'}
          </span>
          <div className="row">
            <button className="btn secondary sm" onClick={() => adjust(-15)} aria-label="Rest 15 seconds less">
              −15s
            </button>
            <button className="btn secondary sm" onClick={() => adjust(15)} aria-label="Rest 15 seconds more">
              +15s
            </button>
            <button className="btn primary sm" onClick={() => updateActive((a) => ({ ...a, rest: null }))}>
              Skip
            </button>
          </div>
        </div>
        <span className="sr-only" aria-live="assertive">
          {left <= 0 ? 'Rest over' : ''}
        </span>
      </div>
    </div>
  );
}

function ExerciseMenu({ a, index, onClose }: { a: ActiveWorkout; index: number; onClose: () => void }) {
  const e = a.exercises[index];
  const ex = exerciseById(e.exerciseId);
  const next = a.exercises[index + 1];
  const inSuperset = e.supersetGroup != null && next?.supersetGroup === e.supersetGroup;
  const move = (d: number) =>
    updateActive((w) => {
      const list = [...w.exercises];
      const [item] = list.splice(index, 1);
      list.splice(index + d, 0, item);
      return { ...w, exercises: list };
    });
  const toggleSuperset = () =>
    updateActive((w) => {
      const list = [...w.exercises];
      if (inSuperset) {
        list[index + 1] = { ...list[index + 1], supersetGroup: null };
        if (list[index - 1]?.supersetGroup !== list[index].supersetGroup) list[index] = { ...list[index], supersetGroup: null };
      } else {
        const g = list[index].supersetGroup ?? Math.max(0, ...list.map((x) => x.supersetGroup ?? 0)) + 1;
        list[index] = { ...list[index], supersetGroup: g };
        list[index + 1] = { ...list[index + 1], supersetGroup: g };
      }
      return { ...w, exercises: list };
    });
  return (
    <Dialog title={ex?.name ?? 'Exercise'} onClose={onClose}>
      <label className="field">
        <span>Rest timer</span>
        <select className="select" value={e.restS} onChange={(ev) => patchExercise(e.id, (x) => ({ ...x, restS: Number(ev.target.value) }))}>
          {REST_CHOICES.map((s) => (
            <option key={s} value={s}>
              {restLabel(s)}
            </option>
          ))}
        </select>
      </label>
      {next && (
        <button className="btn secondary block" onClick={toggleSuperset}>
          <Link2 size={18} aria-hidden /> {inSuperset ? 'Unlink superset with next' : 'Superset with next exercise'}
        </button>
      )}
      <div className="row">
        <button className="btn secondary grow" disabled={index === 0} onClick={() => (move(-1), onClose())}>
          <ArrowUp size={18} aria-hidden /> Move up
        </button>
        <button className="btn secondary grow" disabled={!next} onClick={() => (move(1), onClose())}>
          <ArrowDown size={18} aria-hidden /> Move down
        </button>
      </div>
      <button
        className="btn danger block"
        onClick={() => {
          updateActive((w) => ({ ...w, exercises: w.exercises.filter((x) => x.id !== e.id) }));
          onClose();
        }}
      >
        <Trash2 size={18} aria-hidden /> Remove exercise
      </button>
    </Dialog>
  );
}

function SetMenu({ exId, set, onClose }: { exId: string; set: LoggedSet; onClose: () => void }) {
  return (
    <Dialog title="Set type" onClose={onClose}>
      <div className="stack" role="group" aria-label="Set type">
        {(Object.keys(TYPE_LABEL) as SetType[]).map((t) => (
          <button
            key={t}
            className={`btn block ${set.type === t ? 'primary' : 'secondary'}`}
            aria-pressed={set.type === t}
            onClick={() => (patchSet(exId, set.id, { type: t }), onClose())}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <button className="btn danger block" onClick={() => (patchExercise(exId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== set.id) })), onClose())}>
        <Trash2 size={18} aria-hidden /> Delete set
      </button>
    </Dialog>
  );
}

function ExerciseBlock({ a, index }: { a: ActiveWorkout; index: number }) {
  const db = useDb();
  const e = a.exercises[index];
  const ex = exerciseById(e.exerciseId, db);
  const units = db.settings.units;
  const rpe = db.settings.rpeEnabled;
  const prev = previousSets(e.exerciseId, db.workouts, a.startedAt, a.editing?.workoutId);
  const labels = setLabels(e.sets);
  const [menu, setMenu] = useState(false);
  const [setMenuFor, setSetMenuFor] = useState<LoggedSet | null>(null);
  const [showNotes, setShowNotes] = useState(e.notes !== '');
  const bodyweight = ex?.kind === 'bodyweight_reps';
  const timed = ex?.kind === 'duration';
  const name = ex?.name ?? 'Unknown exercise';

  const tick = (s: LoggedSet, si: number) => {
    const done = !s.done;
    const p = prev[si];
    // Ticking an empty set takes last time's numbers, like writing them in.
    const fill: Partial<LoggedSet> =
      done && s.reps == null && s.durationS == null && p ? { weightKg: s.weightKg ?? p.weightKg, reps: p.reps, durationS: p.durationS } : {};
    updateActive((w) => {
      const next: ActiveWorkout = {
        ...w,
        exercises: w.exercises.map((x) => (x.id === e.id ? { ...x, sets: x.sets.map((y) => (y.id === s.id ? { ...y, ...fill, done } : y)) } : x)),
      };
      if (!done) return next;
      const r = restAfter(next, index, si);
      return { ...next, rest: r > 0 ? { endsAt: Date.now() + r * 1000, totalS: r } : next.rest };
    });
  };

  const superset = e.supersetGroup != null && (a.exercises[index - 1]?.supersetGroup === e.supersetGroup || a.exercises[index + 1]?.supersetGroup === e.supersetGroup);

  return (
    <section className={`ex-block card${superset ? ' superset' : ''}`} aria-label={name}>
      <div className="ex-head">
        <Link className="grow ellipsis" to={`/exercises/${e.exerciseId}`}>
          {name}
        </Link>
        <span className="t-xs muted">Rest {restLabel(e.restS)}</span>
        <button className="icon-btn" aria-label={`Options for ${name}`} onClick={() => setMenu(true)}>
          <MoreHorizontal size={20} />
        </button>
      </div>
      {superset && <span className="badge">Superset</span>}
      {showNotes ? (
        <label className="field">
          <span className="sr-only">Notes for {name}</span>
          <input className="input" placeholder="Notes: seat height, grip, cues" value={e.notes} onChange={(ev) => patchExercise(e.id, (x) => ({ ...x, notes: ev.target.value }))} />
        </label>
      ) : (
        <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => setShowNotes(true)}>
          Add note
        </button>
      )}
      <div className="sets" role="group" aria-label={`Sets for ${name}`}>
        <div className={`set-row head${rpe ? ' rpe' : ''}`} aria-hidden>
          <span>Set</span>
          <span>Last</span>
          <span>{timed ? 'sec' : bodyweight ? `+${units}` : units}</span>
          <span>{timed ? '' : 'Reps'}</span>
          {rpe && <span>RPE</span>}
          <span />
        </div>
        {e.sets.map((s, si) => {
          const p = prev[si];
          const prevText = p ? (timed ? `${p.durationS ?? 0}s` : `${p.weightKg != null ? fmtNum(toDisplay(p.weightKg, units)!) + ' × ' : ''}${p.reps ?? 0}`) : '–';
          return (
            <div key={s.id} className={`set-row${s.done ? ' done' : ''}${rpe ? ' rpe' : ''}`} role="group" aria-label={`Set ${si + 1}`}>
              <button className={`set-type ${s.type}`} aria-label={`Set ${si + 1}, ${TYPE_LABEL[s.type]}. Change type`} onClick={() => setSetMenuFor(s)}>
                {labels[si]}
              </button>
              <button
                className="prev"
                disabled={!p}
                aria-label={p ? `Use last time: ${p.weightKg != null ? fmtWeight(p.weightKg, units) + ' × ' : ''}${timed ? prevText : `${p.reps ?? 0} reps`}` : 'No previous set'}
                onClick={() => p && patchSet(e.id, s.id, { weightKg: p.weightKg, reps: p.reps, durationS: p.durationS })}
              >
                {prevText}
              </button>
              {timed ? (
                <NumInput label={`Set ${si + 1} seconds`} value={s.durationS} decimals={false} onChange={(v) => patchSet(e.id, s.id, { durationS: v })} />
              ) : (
                <NumInput
                  label={`Set ${si + 1} weight`}
                  placeholder={bodyweight ? '0' : ''}
                  value={toDisplay(s.weightKg, units)}
                  onChange={(v) => patchSet(e.id, s.id, { weightKg: fromDisplay(v, units) })}
                />
              )}
              {timed ? <span /> : <NumInput label={`Set ${si + 1} reps`} value={s.reps} decimals={false} max={999} onChange={(v) => patchSet(e.id, s.id, { reps: v })} />}
              {rpe && <NumInput label={`Set ${si + 1} RPE`} value={s.rpe} max={10} onChange={(v) => patchSet(e.id, s.id, { rpe: v })} />}
              <button className="check" aria-pressed={s.done} aria-label={`Set ${si + 1} done`} onClick={() => tick(s, si)}>
                <Check size={18} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="btn secondary block"
        onClick={() =>
          patchExercise(e.id, (x) => {
            const last = x.sets[x.sets.length - 1];
            return { ...x, sets: [...x.sets, newSet({ weightKg: last?.weightKg ?? null, reps: last?.reps ?? null, durationS: last?.durationS ?? null })] };
          })
        }
      >
        <Plus size={18} aria-hidden /> Add set
      </button>
      {menu && <ExerciseMenu a={a} index={index} onClose={() => setMenu(false)} />}
      {setMenuFor && <SetMenu exId={e.id} set={setMenuFor} onClose={() => setSetMenuFor(null)} />}
    </section>
  );
}

export default function LiveWorkout() {
  const db = useDb();
  const a = db.active;
  const nav = useNavigate();
  const now = useNow();
  const [picking, setPicking] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [finishProblem, setFinishProblem] = useState<null | 'none' | 'partial'>(null);
  if (!a) return <Navigate to="/workout" replace />;

  const addExercises = (ids: string[]) => {
    updateActive((w) => ({
      ...w,
      exercises: [
        ...w.exercises,
        ...ids.map((exerciseId) => {
          const prev = previousSets(exerciseId, db.workouts, w.startedAt);
          const count = Math.max(1, prev.filter((s) => s.type !== 'warmup').length || 3);
          return {
            id: uid(),
            exerciseId,
            notes: '',
            restS: db.settings.defaultRestS,
            supersetGroup: null,
            sets: Array.from({ length: count }, () => newSet()),
          };
        }),
      ],
    }));
    setPicking(false);
  };

  const finish = () => {
    const done = completedExercises(a);
    if (done.length === 0) return setFinishProblem('none');
    const unfinished = a.exercises.some((e) => e.sets.some((s) => !s.done));
    if (unfinished) return setFinishProblem('partial');
    nav('/active/finish');
  };

  return (
    <>
      <TopBar
        title={a.editing ? 'Edit workout' : 'Workout'}
        back="/workout"
        actions={
          <button className="btn primary sm" onClick={finish}>
            {a.editing ? 'Next' : 'Finish'}
          </button>
        }
      />
      <main className="page no-tabs">
        <input
          className="input bare"
          aria-label="Workout name"
          placeholder="Name this workout"
          value={a.title}
          onChange={(e) => updateActive((w) => ({ ...w, title: e.target.value }))}
          maxLength={80}
        />
        <div className="stats">
          <Stat label="Duration" value={a.editing ? fmtDuration(a.editing.endedAt - a.startedAt) : fmtDuration(now - a.startedAt)} />
          <Stat label="Volume" value={fmtWeight(workoutVolume(a), db.settings.units)} />
          <Stat label="Sets" value={doneSetCount(a)} />
        </div>
        {a.exercises.length === 0 && (
          <div className="empty">
            <h2 className="h-lg" style={{ color: 'var(--c-text)' }}>
              Empty bar
            </h2>
            <p>Add your first exercise to start logging sets.</p>
          </div>
        )}
        {a.exercises.map((e, i) => (
          <ExerciseBlock key={e.id} a={a} index={i} />
        ))}
        <button className="btn primary lg block" onClick={() => setPicking(true)}>
          <Plus size={20} aria-hidden /> Add exercise
        </button>
        <button className="btn danger block" onClick={() => setConfirmDiscard(true)}>
          {a.editing ? 'Cancel edit' : 'Discard workout'}
        </button>
      </main>
      {a.rest && <RestBar rest={a.rest} />}
      {picking && <ExercisePicker onPick={addExercises} onClose={() => setPicking(false)} />}
      {confirmDiscard && (
        <Confirm
          title={a.editing ? 'Cancel edit?' : 'Discard this workout?'}
          body={a.editing ? 'Your saved workout stays as it was.' : 'Every set you logged in this session will be gone. This cannot be undone.'}
          confirmLabel={a.editing ? 'Cancel edit' : 'Discard'}
          danger
          onCancel={() => setConfirmDiscard(false)}
          onConfirm={() => {
            const back = a.editing ? `/workouts/${a.editing.workoutId}` : '/workout';
            discardActive();
            nav(back);
          }}
        />
      )}
      {finishProblem === 'none' && (
        <Confirm
          title="Nothing to save yet"
          body="Tick at least one set as done, then finish."
          confirmLabel="Keep going"
          onCancel={() => setFinishProblem(null)}
          onConfirm={() => setFinishProblem(null)}
        />
      )}
      {finishProblem === 'partial' && (
        <Confirm
          title="Some sets are not ticked"
          body="Sets you did not tick will be left out of the saved workout."
          confirmLabel="Save ticked sets"
          onCancel={() => setFinishProblem(null)}
          onConfirm={() => nav('/active/finish')}
        />
      )}
    </>
  );
}

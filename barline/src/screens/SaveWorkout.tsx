// S06: name it, describe it, save it.
import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { completedExercises, finishActive, routineDiffers, useDb } from '../data/store';
import { defaultTitle, doneSetCount, fmtDuration, fmtWeight, workoutVolume } from '../data/stats';
import { Stat, TopBar } from '../components/ui';

export default function SaveWorkout() {
  const db = useDb();
  const a = db.active;
  const nav = useNavigate();
  const [title, setTitle] = useState(a?.title || (a ? defaultTitle(a.startedAt) : ''));
  const [description, setDescription] = useState(a?.editing?.description ?? '');
  const [error, setError] = useState('');
  const routine = a?.routineId ? db.routines.find((r) => r.id === a.routineId) : undefined;
  const cleaned = a ? { routineId: a.routineId, exercises: completedExercises(a) } : null;
  const canUpdate = !!routine && !!cleaned && routineDiffers(cleaned);
  const [updateRoutine, setUpdateRoutine] = useState(false);
  const [saving, setSaving] = useState(false);
  // Once saved, the active workout is gone: don't bounce to /workout while navigating away.
  const savedRef = useRef(false);
  if (savedRef.current) return null;
  if (!a || !cleaned) return <Navigate to="/workout" replace />;

  const save = () => {
    if (saving) return;
    setSaving(true);
    try {
      const isNew = !a.editing;
      savedRef.current = true;
      const w = finishActive({ title, description, updateRoutine: canUpdate && updateRoutine });
      nav(`/workouts/${w.id}${isNew ? '?saved=1' : ''}`, { replace: true });
    } catch (e) {
      savedRef.current = false;
      setError((e as Error).message);
      setSaving(false);
    }
  };

  const end = a.editing ? a.editing.endedAt : Date.now();
  return (
    <>
      <TopBar title={a.editing ? 'Save changes' : 'Save workout'} back="/active" />
      <main className="page no-tabs">
        <label className="field">
          <span>Title</span>
          <input className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="stats card">
          <Stat label="Duration" value={fmtDuration(end - a.startedAt)} />
          <Stat label="Volume" value={fmtWeight(workoutVolume(cleaned), db.settings.units)} />
          <Stat label="Sets" value={doneSetCount(cleaned)} />
        </div>
        <label className="field">
          <span>How did it go?</span>
          <textarea className="textarea" value={description} maxLength={2000} placeholder="Energy, sleep, anything worth remembering" onChange={(e) => setDescription(e.target.value)} />
        </label>
        {canUpdate && (
          <label className="toggle card">
            <span>
              <span className="strong" style={{ display: 'block' }}>
                Update “{routine!.title}”
              </span>
              <span className="t-sm muted">You changed exercises or sets. Save them to the routine for next time.</span>
            </span>
            <input type="checkbox" checked={updateRoutine} onChange={(e) => setUpdateRoutine(e.target.checked)} />
          </label>
        )}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary lg block" disabled={saving} onClick={save}>
          {a.editing ? 'Save changes' : 'Save workout'}
        </button>
      </main>
    </>
  );
}

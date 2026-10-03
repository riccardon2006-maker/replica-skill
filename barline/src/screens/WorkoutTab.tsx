// S02: start a session, empty or from a routine.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Copy, MoreHorizontal, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react';
import { deleteRoutine, discardActive, duplicateRoutine, exerciseById, startWorkout, useDb } from '../data/store';
import type { Routine } from '../data/types';
import { Confirm, Dialog, Empty, TopBar } from '../components/ui';

export default function WorkoutTab() {
  const db = useDb();
  const nav = useNavigate();
  const [pending, setPending] = useState<{ routine?: Routine } | null>(null);
  const [menuFor, setMenuFor] = useState<Routine | null>(null);
  const [deleteFor, setDeleteFor] = useState<Routine | null>(null);

  const start = (routine?: Routine) => {
    if (db.active) return setPending({ routine });
    startWorkout(routine);
    nav('/active');
  };

  const folders = new Map<string, Routine[]>();
  for (const r of [...db.routines].sort((a, b) => a.title.localeCompare(b.title))) {
    const k = r.folder || '';
    folders.set(k, [...(folders.get(k) ?? []), r]);
  }
  const folderNames = [...folders.keys()].sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)));

  return (
    <>
      <TopBar
        title="Train"
        actions={
          <Link className="icon-btn" to="/exercises" aria-label="Exercise library">
            <Search size={20} />
          </Link>
        }
      />
      <main className="page">
        <button className="btn primary lg block" onClick={() => start()}>
          <Plus size={20} aria-hidden /> Start empty workout
        </button>
        <div className="row between">
          <h2 className="section-title">Routines</h2>
          <Link className="btn ghost sm" to="/routines/new">
            <Plus size={16} aria-hidden /> New routine
          </Link>
        </div>
        {db.routines.length === 0 ? (
          <Empty icon={<ClipboardList size={40} />} title="No routines yet">
            <p>Save the workouts you repeat. As many as you like, free.</p>
            <Link className="btn secondary" to="/routines/new">
              Create a routine
            </Link>
          </Empty>
        ) : (
          folderNames.map((f) => (
            <section key={f || 'none'} className="stack" aria-label={f || 'Routines'}>
              {f && <h3 className="t-sm strong muted">{f}</h3>}
              {folders.get(f)!.map((r) => (
                <article key={r.id} className="card" aria-label={r.title}>
                  <div className="row">
                    <Link to={`/routines/${r.id}`} className="grow strong ellipsis" style={{ textDecoration: 'none' }}>
                      {r.title}
                    </Link>
                    <button className="icon-btn" aria-label={`Options for ${r.title}`} onClick={() => setMenuFor(r)}>
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <p className="t-sm muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.exercises.length === 0 ? 'No exercises yet' : r.exercises.map((e) => exerciseById(e.exerciseId, db)?.name).join(', ')}
                  </p>
                  <button className="btn primary block" onClick={() => start(r)} aria-label={`Start ${r.title}`}>
                    <Play size={18} aria-hidden /> Start routine
                  </button>
                </article>
              ))}
            </section>
          ))
        )}
      </main>
      {menuFor && (
        <Dialog title={menuFor.title} onClose={() => setMenuFor(null)}>
          <Link className="btn secondary block" to={`/routines/${menuFor.id}`}>
            <Pencil size={18} aria-hidden /> Edit routine
          </Link>
          <button
            className="btn secondary block"
            onClick={() => {
              duplicateRoutine(menuFor.id);
              setMenuFor(null);
            }}
          >
            <Copy size={18} aria-hidden /> Duplicate
          </button>
          <button
            className="btn danger block"
            onClick={() => {
              setDeleteFor(menuFor);
              setMenuFor(null);
            }}
          >
            <Trash2 size={18} aria-hidden /> Delete
          </button>
        </Dialog>
      )}
      {deleteFor && (
        <Confirm
          title={`Delete “${deleteFor.title}”?`}
          body="Workouts you already logged from it stay in your history."
          confirmLabel="Delete routine"
          danger
          onCancel={() => setDeleteFor(null)}
          onConfirm={() => {
            deleteRoutine(deleteFor.id);
            setDeleteFor(null);
          }}
        />
      )}
      {pending && (
        <Dialog title="A workout is already running" onClose={() => setPending(null)}>
          <p className="muted">Pick up where you left off, or throw it away and start fresh.</p>
          <Link className="btn primary block" to="/active">
            Resume it
          </Link>
          <button
            className="btn danger block"
            onClick={() => {
              discardActive();
              startWorkout(pending.routine);
              nav('/active');
            }}
          >
            Discard it and start new
          </button>
        </Dialog>
      )}
    </>
  );
}

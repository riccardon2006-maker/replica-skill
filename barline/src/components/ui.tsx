import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, House, Timer, User } from 'lucide-react';
import { getState, useDb } from '../data/store';
import { fmtDuration } from '../data/stats';

export function TopBar({ title, back, actions }: { title: string; back?: boolean | string; actions?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      {back && (
        <button className="icon-btn" aria-label="Back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}>
          <ArrowLeft size={22} />
        </button>
      )}
      <h1>{title}</h1>
      {actions}
    </header>
  );
}

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-inner">
        <NavLink to="/" end className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <House size={22} aria-hidden /> Home
        </NavLink>
        <NavLink to="/workout" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <Dumbbell size={22} aria-hidden /> Train
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <User size={22} aria-hidden /> You
        </NavLink>
      </div>
    </nav>
  );
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    const vis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [intervalMs]);
  return now;
}

/** Shown on every tab while a workout is in progress. */
export function ResumeBar() {
  const { active } = useDb();
  const loc = useLocation();
  const now = useNow();
  if (!active || loc.pathname.startsWith('/active')) return null;
  return (
    <div className="resume-bar">
      <Link to="/active" aria-label="Resume workout in progress">
        <Timer size={20} aria-hidden />
        <span className="grow strong ellipsis">{active.editing ? 'Editing workout' : active.title || 'Workout in progress'}</span>
        {!active.editing && <span className="muted t-sm">{fmtDuration(now - active.startedAt)}</span>}
      </Link>
    </div>
  );
}

export function Dialog({
  title,
  onClose,
  children,
  full,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  full?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
    (first ?? ref.current)?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`sheet${full ? ' full' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <div className="row between">
          <h2 id={id} className="h-lg">
            {title}
          </h2>
          <button className="btn ghost sm" data-close onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog title={title} onClose={onCancel}>
      <p className="muted">{body}</p>
      <div className="row">
        <button className="btn secondary grow" onClick={onCancel}>
          Cancel
        </button>
        <button className={`btn grow ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <h2 className="h-lg" style={{ color: 'var(--c-text)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <span className="t-xs muted">{label}</span>
      <span className="v">{value}</span>
    </div>
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export const units = () => getState().settings.units;

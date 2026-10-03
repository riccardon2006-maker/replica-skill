// S08 profile and stats, S10 measurements, S11 settings.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dumbbell, Ruler, Settings as Gear, Trash2 } from 'lucide-react';
import { deleteAllData, deleteMeasurement, exerciseById, saveMeasurement, saveSettings, useDb } from '../data/store';
import { fmtDuration, fmtWeight, fromDisplay, localDateKey, toDisplay, weeklyCounts, workoutVolume, workoutsToCsv } from '../data/stats';
import { BarChart, LineChart } from '../components/charts';
import { NumInput } from '../components/NumInput';
import { Confirm, Empty, Stat, TopBar } from '../components/ui';
import { WorkoutCard } from '../components/WorkoutCard';

type Metric = 'workouts' | 'minutes' | 'volume';

function Calendar({ days }: { days: Set<string> }) {
  const [offset, setOffset] = useState(0);
  const base = new Date();
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const today = localDateKey(Date.now());
  const label = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  let trained = 0;
  const cells = Array.from({ length: count }, (_, i) => {
    const key = localDateKey(new Date(first.getFullYear(), first.getMonth(), i + 1).getTime());
    const on = days.has(key);
    if (on) trained++;
    return { d: i + 1, key, on };
  });
  return (
    <section className="card" aria-label="Workout calendar">
      <div className="row between">
        <button className="icon-btn" aria-label="Previous month" onClick={() => setOffset(offset - 1)}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="strong t-sm" aria-live="polite" style={{ textAlign: 'center' }}>
          {label} · {trained} day{trained === 1 ? '' : 's'}
        </h2>
        <button className="icon-btn" aria-label="Next month" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="cal">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="dow" aria-hidden>
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {cells.map((c) => (
          <span key={c.key} className={`d${c.on ? ' on' : ''}${c.key === today ? ' today' : ''}`} aria-label={c.on ? `${c.d}, trained` : undefined}>
            {c.d}
          </span>
        ))}
      </div>
    </section>
  );
}

export function Profile() {
  const db = useDb();
  const [metric, setMetric] = useState<Metric>('workouts');
  const units = db.settings.units;
  const workouts = [...db.workouts].sort((a, b) => b.startedAt - a.startedAt);
  const totalVolume = workouts.reduce((a, w) => a + workoutVolume(w), 0);
  const totalMs = workouts.reduce((a, w) => a + (w.endedAt - w.startedAt), 0);
  const weeks = weeklyCounts(workouts, 12);
  const toU = (kg: number) => (units === 'kg' ? kg : kg * 2.2046226218);
  const bars = weeks.map((w) => ({
    x: new Date(w.week).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' }),
    y: metric === 'workouts' ? w.workouts : metric === 'minutes' ? Math.round(w.minutes) : Math.round(toU(w.volume)),
  }));
  const days = new Set(workouts.map((w) => localDateKey(w.startedAt)));

  // Most trained exercises, all time.
  const counts = new Map<string, number>();
  for (const w of workouts) for (const e of w.exercises) counts.set(e.exerciseId, (counts.get(e.exerciseId) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <>
      <TopBar
        title="You"
        actions={
          <Link className="icon-btn" to="/settings" aria-label="Settings">
            <Gear size={20} />
          </Link>
        }
      />
      <main className="page">
        <div className="stats card">
          <Stat label="Workouts" value={workouts.length} />
          <Stat label="Time trained" value={fmtDuration(totalMs)} />
          <Stat label="Total volume" value={fmtWeight(Math.round(totalVolume), units)} />
        </div>
        <div className="row">
          <Link className="btn secondary grow" to="/measurements">
            <Ruler size={18} aria-hidden /> Measurements
          </Link>
          <Link className="btn secondary grow" to="/exercises">
            <Dumbbell size={18} aria-hidden /> Exercises
          </Link>
        </div>
        <section className="card" aria-label="Last 12 weeks">
          <div className="row between wrap">
            <h2 className="section-title">Last 12 weeks</h2>
            <div className="seg" role="group" aria-label="Chart metric">
              {(['workouts', 'minutes', 'volume'] as Metric[]).map((m) => (
                <button key={m} aria-pressed={metric === m} onClick={() => setMetric(m)}>
                  {m === 'workouts' ? 'Workouts' : m === 'minutes' ? 'Minutes' : 'Volume'}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={bars} label={`${metric} per week`} />
        </section>
        <Calendar days={days} />
        {top.length > 0 && (
          <section className="stack">
            <h2 className="section-title">Most trained</h2>
            <div className="list">
              {top.map(([id, n]) => (
                <Link key={id} className="list-item" to={`/exercises/${id}`}>
                  <span className="grow ellipsis">{exerciseById(id, db)?.name}</span>
                  <span className="t-sm muted">{n} sessions</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <h2 className="section-title">History</h2>
        {workouts.length === 0 ? (
          <Empty icon={<Dumbbell size={40} />} title="Nothing logged yet">
            <Link className="btn primary" to="/workout">
              Start training
            </Link>
          </Empty>
        ) : (
          workouts.map((w) => <WorkoutCard key={w.id} w={w} />)
        )}
      </main>
    </>
  );
}

export function Measurements() {
  const db = useDb();
  const units = db.settings.units;
  const [date, setDate] = useState(localDateKey(Date.now()));
  const [weight, setWeight] = useState<number | null>(null);
  const [error, setError] = useState('');
  const list = [...db.measurements].sort((a, b) => b.date.localeCompare(a.date));
  const points = [...list].reverse().map((m) => ({
    x: new Date(m.date + 'T12:00:00').getTime(),
    y: toDisplay(m.bodyWeightKg, units)!,
    tag: new Date(m.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  }));
  return (
    <>
      <TopBar title="Measurements" back />
      <main className="page">
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              saveMeasurement({ date, bodyWeightKg: fromDisplay(weight, units) ?? 0 });
              setWeight(null);
              setError('');
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <h2 className="section-title">Log body weight</h2>
          <div className="row">
            <label className="field grow">
              <span>Date</span>
              <input className="input" type="date" value={date} max={localDateKey(Date.now())} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className="field grow">
              <span>Weight ({units})</span>
              <NumInput className="input" label={`Body weight in ${units}`} value={weight} onChange={setWeight} />
            </label>
          </div>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary block" type="submit">
            Save entry
          </button>
        </form>
        {list.length === 0 ? (
          <Empty icon={<Ruler size={40} />} title="No entries yet">
            <p>Weigh in once a week, same time of day, and the trend tells the truth.</p>
          </Empty>
        ) : (
          <>
            {points.length > 1 && (
              <div className="card">
                <h2 className="section-title">Body weight</h2>
                <LineChart data={points} label="Body weight" unit={units} />
              </div>
            )}
            <div className="list">
              {list.map((m) => (
                <div key={m.id} className="list-item" style={{ cursor: 'default' }}>
                  <span className="grow">{new Date(m.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="strong">{fmtWeight(m.bodyWeightKg, units)}</span>
                  <button className="icon-btn" aria-label={`Delete entry for ${m.date}`} onClick={() => deleteMeasurement(m.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export function Settings() {
  const db = useDb();
  const s = db.settings;
  const [confirm, setConfirm] = useState(false);
  const exportCsv = () => {
    const csv = workoutsToCsv(db.workouts, (id) => exerciseById(id, db)?.name ?? id);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `barline-workouts-${localDateKey(Date.now())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <TopBar title="Settings" back />
      <main className="page">
        <section className="card">
          <h2 className="section-title">Units</h2>
          <div className="seg" role="group" aria-label="Weight units">
            {(['kg', 'lb'] as const).map((u) => (
              <button key={u} aria-pressed={s.units === u} onClick={() => saveSettings({ units: u })}>
                {u === 'kg' ? 'Kilograms' : 'Pounds'}
              </button>
            ))}
          </div>
          <p className="t-sm muted">Switching never changes your history: weights are stored once and shown in your unit.</p>
        </section>
        <section className="card">
          <h2 className="section-title">Workouts</h2>
          <label className="field">
            <span>Default rest for new exercises</span>
            <select className="select" value={s.defaultRestS} onChange={(e) => saveSettings({ defaultRestS: Number(e.target.value) })}>
              {[0, 30, 60, 90, 120, 180, 240, 300].map((v) => (
                <option key={v} value={v}>
                  {v === 0 ? 'Off' : `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`}
                </option>
              ))}
            </select>
          </label>
          <label className="toggle">
            <span>
              <span style={{ display: 'block' }}>Log RPE</span>
              <span className="t-sm muted">Rate of perceived exertion, 6 to 10, per set</span>
            </span>
            <input type="checkbox" checked={s.rpeEnabled} onChange={(e) => saveSettings({ rpeEnabled: e.target.checked })} />
          </label>
        </section>
        <section className="card">
          <h2 className="section-title">Your data</h2>
          <p className="t-sm muted">It lives on this device. Export it any time, in a format any spreadsheet opens.</p>
          <button className="btn secondary block" onClick={exportCsv} disabled={db.workouts.length === 0}>
            Export workouts (CSV)
          </button>
          <button className="btn danger block" onClick={() => setConfirm(true)}>
            Delete all data
          </button>
        </section>
      </main>
      {confirm && (
        <Confirm
          title="Delete everything?"
          body="Every workout, routine, custom exercise and measurement on this device. This cannot be undone."
          confirmLabel="Delete all data"
          danger
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            deleteAllData();
            setConfirm(false);
          }}
        />
      )}
    </>
  );
}

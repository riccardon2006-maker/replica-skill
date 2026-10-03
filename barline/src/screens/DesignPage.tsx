// /design: every primitive in isolation, the design system check.
import { Check, Plus } from 'lucide-react';
import { BarChart, LineChart } from '../components/charts';
import { Stat, TopBar } from '../components/ui';

export default function DesignPage() {
  return (
    <>
      <TopBar title="Design system" back />
      <main className="page">
        <section className="card">
          <h2 className="section-title">Type</h2>
          <p className="h-xl">Display 28</p>
          <p className="h-lg">Heading 20</p>
          <p>Body 16. The quick lifter racks the bar.</p>
          <p className="t-sm muted">Muted 14</p>
          <p className="t-xs">Caption 12</p>
        </section>
        <section className="card">
          <h2 className="section-title">Buttons</h2>
          <div className="row wrap">
            <button className="btn primary">
              <Plus size={18} aria-hidden /> Primary
            </button>
            <button className="btn secondary">Secondary</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn danger">Danger</button>
            <button className="btn primary" disabled>
              Disabled
            </button>
          </div>
        </section>
        <section className="card">
          <h2 className="section-title">Inputs</h2>
          <label className="field">
            <span>Label</span>
            <input className="input" placeholder="Placeholder" />
          </label>
          <label className="field">
            <span>Select</span>
            <select className="select">
              <option>One</option>
            </select>
          </label>
          <div className="row">
            <button className="chip" aria-pressed="true">
              selected
            </button>
            <button className="chip" aria-pressed="false">
              chip
            </button>
            <span className="badge">Badge</span>
          </div>
        </section>
        <section className="card">
          <h2 className="section-title">Set rows</h2>
          <div className="set-row">
            <button className="set-type normal">1</button>
            <span className="prev">60 kg × 8</span>
            <input aria-label="weight" defaultValue="62.5" />
            <input aria-label="reps" defaultValue="8" />
            <button className="check" aria-pressed="false" aria-label="done">
              <Check size={18} />
            </button>
          </div>
          <div className="set-row done">
            <button className="set-type warmup">W</button>
            <span className="prev">40 kg × 10</span>
            <input aria-label="weight" defaultValue="40" />
            <input aria-label="reps" defaultValue="10" />
            <button className="check" aria-pressed="true" aria-label="done">
              <Check size={18} />
            </button>
          </div>
        </section>
        <section className="card">
          <h2 className="section-title">Stats and charts</h2>
          <div className="stats">
            <Stat label="Duration" value="1h 4m" />
            <Stat label="Volume" value="8 420 kg" />
            <Stat label="Sets" value={21} />
          </div>
          <BarChart label="sample" data={[1, 3, 2, 4, 3, 0, 2, 3].map((y, i) => ({ x: `w${i + 1}`, y }))} />
          <LineChart label="sample" unit="kg" data={[100, 102.5, 105, 104, 107.5].map((y, i) => ({ x: i, y, tag: `#${i + 1}` }))} />
        </section>
      </main>
    </>
  );
}

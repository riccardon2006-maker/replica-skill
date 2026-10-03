// /welcome: the landing page. No fake proof: no testimonials, counts or ratings.
import { Link } from 'react-router-dom';
import { ChartLine, Infinity as Unlimited, Lock, Timer, WifiOff } from 'lucide-react';

const FEATURES = [
  { icon: Unlimited, title: 'Nothing locked', body: 'Unlimited routines and custom exercises. No “upgrade to add a fifth”.' },
  { icon: ChartLine, title: 'All-time charts', body: 'Estimated 1RM, heaviest set and volume for every exercise, from day one.' },
  { icon: Lock, title: 'No account', body: 'Your log lives on your phone. Export it to CSV whenever you like.' },
  { icon: WifiOff, title: 'No signal, no problem', body: 'Basement gym? It opens and saves offline.' },
  { icon: Timer, title: 'Rest timer that keeps time', body: 'Starts when you tick a set, skips before drop sets, survives a locked screen.' },
];

const FAQ = [
  ['Is it really free?', 'The log is, with no caps. Cloud sync between devices will be the paid part, when it ships.'],
  ['Do I need an account?', 'No. Open it and start a workout.'],
  ['Can I get my data out?', 'Yes. Settings, Export workouts (CSV). Any spreadsheet opens it.'],
  ['Can I import from another app?', 'Not yet. An importer is on the list.'],
];

export default function Welcome() {
  return (
    <main className="page" style={{ gap: 'var(--sp-7)' }}>
      <section className="stack lg" style={{ paddingTop: 'var(--sp-6)' }}>
        <p className="section-title">Barline</p>
        <h1 className="h-xl">Your gym log, with nothing locked.</h1>
        <p className="muted">Log every set, rest on a timer, see the line go up. Every routine, every exercise, every chart: free.</p>
        <Link className="btn primary lg" to="/workout">
          Start logging
        </Link>
        <img src="/screens/live-workout.png" alt="The live workout screen: sets ticked off, rest timer counting down" style={{ width: '100%', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)' }} />
      </section>
      <section className="stack">
        <h2 className="h-lg">The catch with most lifting logs</h2>
        <p className="muted">The free plan stops at a handful of routines and custom exercises, and your long-term progress sits behind a subscription. Barline doesn't do that.</p>
      </section>
      <section className="stack">
        <h2 className="h-lg">How it works</h2>
        <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
          <li>Start a workout, empty or from a routine.</li>
          <li>Tick each set as you finish it. The rest timer starts.</li>
          <li>Save. Records and charts update on their own.</li>
        </ol>
      </section>
      <section className="stack">
        <h2 className="h-lg">What you get</h2>
        {FEATURES.map((f) => (
          <div key={f.title} className="card" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <f.icon size={22} aria-hidden style={{ color: 'var(--c-accent)', flex: 'none' }} />
            <div>
              <h3 className="strong">{f.title}</h3>
              <p className="t-sm muted">{f.body}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="stack">
        <h2 className="h-lg">Pricing</h2>
        <div className="card">
          <h3 className="strong">Free: $0</h3>
          <p className="t-sm muted">Everything above, on one device.</p>
        </div>
        <div className="card">
          <h3 className="strong">Sync: $1.99/month or $14.99/year (coming later)</h3>
          <p className="t-sm muted">Backup and sync across devices. Cancel in one click.</p>
        </div>
      </section>
      <section className="stack">
        <h2 className="h-lg">Questions</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="card">
            <summary className="strong" style={{ cursor: 'pointer' }}>
              {q}
            </summary>
            <p className="muted">{a}</p>
          </details>
        ))}
      </section>
      <section className="stack" style={{ textAlign: 'center' }}>
        <h2 className="h-lg">Start logging. It's already on your phone.</h2>
        <Link className="btn primary lg" to="/workout">
          Open Barline
        </Link>
      </section>
    </main>
  );
}

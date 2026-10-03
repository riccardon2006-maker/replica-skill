// S01: your training, newest first.
import { Link } from 'react-router-dom';
import { Dumbbell, WifiOff } from 'lucide-react';
import { useDb } from '../data/store';
import { loadSample } from '../data/sample';
import { Empty, TopBar } from '../components/ui';
import { WorkoutCard } from '../components/WorkoutCard';
import { useEffect, useState } from 'react';

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function Home() {
  const db = useDb();
  const online = useOnline();
  const workouts = [...db.workouts].sort((a, b) => b.startedAt - a.startedAt);
  return (
    <>
      <TopBar title="Barline" />
      <main className="page">
        {!online && (
          <p className="card t-sm row" role="status">
            <WifiOff size={16} aria-hidden /> Offline. Keep training: everything saves on this phone.
          </p>
        )}
        {workouts.length === 0 ? (
          <Empty icon={<Dumbbell size={48} />} title="No workouts yet">
            <p>Log your first session and it shows up here, with your records.</p>
            <Link className="btn primary lg" to="/workout">
              Start training
            </Link>
            <button className="btn ghost" onClick={() => loadSample()}>
              Explore with sample data
            </button>
          </Empty>
        ) : (
          <>
            <h2 className="section-title">Recent workouts</h2>
            {workouts.map((w) => (
              <WorkoutCard key={w.id} w={w} />
            ))}
          </>
        )}
      </main>
    </>
  );
}

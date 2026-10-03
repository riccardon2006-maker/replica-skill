import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ResumeBar, TabBar } from './components/ui';
import Home from './screens/Home';
import WorkoutTab from './screens/WorkoutTab';
import RoutineEditor from './screens/RoutineEditor';
import LiveWorkout from './screens/LiveWorkout';
import SaveWorkout from './screens/SaveWorkout';
import WorkoutDetail from './screens/WorkoutDetail';
import { CustomExercise, ExerciseDetail, Exercises } from './screens/Exercises';
import { Measurements, Profile, Settings } from './screens/Profile';
import DesignPage from './screens/DesignPage';
import Welcome from './screens/Welcome';

// Screens that own the whole viewport: no tab bar under them.
const FULL = ['/active', '/routines/', '/exercises/new', '/welcome'];

export default function App() {
  const { pathname } = useLocation();
  const full = FULL.some((p) => pathname.startsWith(p));
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<WorkoutTab />} />
        <Route path="/routines/new" element={<RoutineEditor />} />
        <Route path="/routines/:id" element={<RoutineEditor />} />
        <Route path="/active" element={<LiveWorkout />} />
        <Route path="/active/finish" element={<SaveWorkout />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercises/new" element={<CustomExercise />} />
        <Route path="/exercises/:id" element={<ExerciseDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/measurements" element={<Measurements />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!full && <ResumeBar />}
      {!full && <TabBar />}
    </div>
  );
}

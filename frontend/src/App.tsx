import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/ExperimentDetail';
import Agents from './pages/Agents';
import Behavior from './pages/Behavior';
import Auditor from './pages/Auditor';
import Analytics from './pages/Analytics';
import Dataset from './pages/Dataset';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="experiments/:id" element={<ExperimentDetail />} />
          <Route path="agents" element={<Agents />} />
          <Route path="behavior" element={<Behavior />} />
          <Route path="auditor" element={<Auditor />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="dataset" element={<Dataset />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

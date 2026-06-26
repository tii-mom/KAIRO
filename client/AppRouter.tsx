import { Navigate, Route, Routes } from 'react-router-dom';
import RuntimeV2Shell from './RuntimeV2Shell';
import BuilderPage from './pages/BuilderPage';
import CatalystsPage, { CatalystDetailPage } from './pages/CatalystsPage';
import CreateCatalystPage from './pages/CreateCatalystPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProofOfSupportPage from './pages/ProofOfSupportPage';
import RuntimeHomePage from './pages/RuntimeHomePage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import SubmitProjectPage from './pages/SubmitProjectPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RuntimeV2Shell />}>
        <Route path="/" element={<RuntimeHomePage />} />
        <Route path="/catalysts" element={<CatalystsPage />} />
        <Route path="/catalysts/create" element={<CreateCatalystPage />} />
        <Route path="/catalysts/:id" element={<CatalystDetailPage />} />
        <Route path="/catalysts/:id/submit" element={<SubmitProjectPage />} />
        <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/proof" element={<ProofOfSupportPage />} />
      </Route>
      <Route path="/admin" element={<Navigate to="/catalysts" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

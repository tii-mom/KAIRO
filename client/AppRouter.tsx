import { Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import BuilderProfilePage from './pages/BuilderProfilePage';
import CatalystDetailPage from './pages/CatalystDetailPage';
import CatalystListPage from './pages/CatalystListPage';
import CreateCatalystPage from './pages/CreateCatalystPage';
import DormantGiantsPage from './pages/DormantGiantsPage';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProofOfSupportPage from './pages/ProofOfSupportPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import SubmitProjectPage from './pages/SubmitProjectPage';
import { demoUserState } from './pages/pageUtils';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalysts" element={<CatalystListPage />} />
      <Route path="/catalysts/:id" element={<CatalystDetailPage />} />
      <Route path="/create-catalyst" element={<CreateCatalystPage />} />
      <Route path="/catalysts/:id/submit" element={<SubmitProjectPage />} />
      <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
      <Route path="/builders/:id" element={<BuilderProfilePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/dormant-giants" element={<DormantGiantsPage />} />
      <Route path="/proof" element={<ProofOfSupportPage userState={demoUserState} />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

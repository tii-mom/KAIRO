import { Navigate, Route, Routes } from 'react-router-dom';
import RuntimeV2Shell from './RuntimeV2Shell';
import AdminPage from './pages/AdminPage';
import BetaPage from './pages/BetaPage';
import BuilderPage from './pages/BuilderPage';
import BuilderProfilePage from './pages/BuilderProfilePage';
import CatalystsPage, { CatalystDetailPage } from './pages/CatalystsPage';
import CreateCatalystPage from './pages/CreateCatalystPage';
import DormantGiantsPage from './pages/DormantGiantsPage';
import FeedbackPage from './pages/FeedbackPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProofOfSupportPage from './pages/ProofOfSupportPage';
import RuntimeHomePage from './pages/RuntimeHomePage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import SubmitProjectPage from './pages/SubmitProjectPage';
import { useI18n } from './i18n/useI18n';

function StaticInfoPage({ pageKey }: { pageKey: string }) {
  const { t, tArray } = useI18n();
  const title = t(`staticPages.${pageKey}Title`);
  const body = tArray(`staticPages.${pageKey}Paragraphs`);

  return (
    <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
      <h1 className="text-4xl font-black text-white">{title}</h1>
      {body.map((paragraph) => (
        <p key={paragraph} className="max-w-3xl text-sm leading-7 text-white/65">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RuntimeV2Shell />}>
        <Route path="/" element={<RuntimeHomePage />} />
        <Route path="/catalysts" element={<CatalystsPage />} />
        <Route path="/create-catalyst" element={<CreateCatalystPage />} />
        <Route path="/catalysts/create" element={<CreateCatalystPage />} />
        <Route path="/catalysts/:id" element={<CatalystDetailPage />} />
        <Route path="/catalysts/:id/submit" element={<SubmitProjectPage />} />
        <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/builder/:id" element={<BuilderProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/proof" element={<ProofOfSupportPage />} />
        <Route path="/proof/:userId" element={<ProofOfSupportPage />} />
        <Route path="/dormant-giants" element={<DormantGiantsPage />} />
        <Route path="/beta" element={<BetaPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route
          path="/about"
          element={
            <StaticInfoPage pageKey="about" />
          }
        />
        <Route
          path="/how-it-works"
          element={
            <StaticInfoPage pageKey="howItWorks" />
          }
        />
        <Route
          path="/for-builders"
          element={
            <StaticInfoPage pageKey="forBuilders" />
          }
        />
        <Route
          path="/for-communities"
          element={
            <StaticInfoPage pageKey="forCommunities" />
          }
        />
        <Route
          path="/submit-token"
          element={
            <StaticInfoPage pageKey="submitToken" />
          }
        />
        <Route
          path="/disclaimer"
          element={
            <StaticInfoPage pageKey="disclaimer" />
          }
        />
      </Route>
      <Route path="/legacy" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

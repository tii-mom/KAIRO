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
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProofOfSupportPage from './pages/ProofOfSupportPage';
import RuntimeHomePage from './pages/RuntimeHomePage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import SubmitProjectPage from './pages/SubmitProjectPage';

function StaticInfoPage({ title, body }: { title: string; body: string[] }) {
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
            <StaticInfoPage
              title="About KAIRO"
              body={[
                'KAIRO Phase 0 is a community signal and bounty discovery platform for dormant token ecosystems.',
                'Catalysts help communities publish concrete missions, builders submit working demos, supporters Boost promising work, and KAIRO records Funding Status, Reward Records, and Proof of Support without presenting any financial-service promise.',
              ]}
            />
          }
        />
        <Route
          path="/how-it-works"
          element={
            <StaticInfoPage
              title="How It Works"
              body={[
                'Communities publish Catalysts with a builder brief and public Funding Status.',
                'Builders submit product demos, supporters Boost the strongest work, and KAIRO surfaces Momentum, leaderboards, Reward Records, and public proof so the comeback story stays legible.',
              ]}
            />
          }
        />
        <Route
          path="/for-builders"
          element={
            <StaticInfoPage
              title="For Builders"
              body={[
                'Browse Catalysts, ship working demos, collect Boosts, and build KAIRO Score through delivery.',
                'Phase 0 is designed for discovery and visible contribution history, not guaranteed rewards or financial returns.',
              ]}
            />
          }
        />
        <Route
          path="/for-communities"
          element={
            <StaticInfoPage
              title="For Communities"
              body={[
                'Publish a Catalyst, describe the product need clearly, and keep Funding Status updated in public.',
                'KAIRO helps communities attract builders and supporters around real product work rather than speculation.',
              ]}
            />
          }
        />
        <Route
          path="/submit-token"
          element={
            <StaticInfoPage
              title="Submit Token"
              body={[
                'Use the Catalyst flow to introduce a dormant project, explain the community context, and invite builder submissions.',
                'KAIRO reviews public reward information and can add Reward Records while keeping Phase 0 focused on discovery, contribution records, and community signal.',
              ]}
            />
          }
        />
        <Route
          path="/disclaimer"
          element={
            <StaticInfoPage
              title="Disclaimer"
              body={[
                'Boost is not an investment. KAIRO does not guarantee rewards or airdrops.',
                'Funding Status is a public coordination label for sponsor reward information. KAIRO Phase 0 is a community signal and bounty discovery platform.',
              ]}
            />
          }
        />
      </Route>
      <Route path="/legacy" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

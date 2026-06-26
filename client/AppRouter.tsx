import { Navigate, Route, Routes } from 'react-router-dom';
import RuntimeV2Shell from './RuntimeV2Shell';
import BuilderPage from './pages/BuilderPage';
import CatalystsPage, { CatalystDetailPage } from './pages/CatalystsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProofOfSupportPage from './pages/ProofOfSupportPage';
import RuntimeHomePage from './pages/RuntimeHomePage';

const demoUserState = {
  walletAddress: '0x71C8b29330ebde4ea29141088d8b4a2911ba49Bf',
  walletName: 'KAIRO Demo',
  balanceEth: 0,
  balanceSol: 0,
  balanceKairo: 400,
  boostedCatalysts: ['dormant-yields'],
  boostedBids: [],
  ownedTokens: {},
};

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RuntimeV2Shell />}>
        <Route path="/" element={<RuntimeHomePage />} />
        <Route path="/catalysts" element={<CatalystsPage />} />
        <Route path="/catalysts/:id" element={<CatalystDetailPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/proof" element={<ProofOfSupportPage userState={demoUserState} />} />
      </Route>
      <Route path="/admin" element={<Navigate to="/catalysts" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

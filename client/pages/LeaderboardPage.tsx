import { useNavigate } from 'react-router-dom';
import Leaderboard from '../../src/components/Leaderboard';
import { INITIAL_BIDS, INITIAL_CATALYSTS } from '../../src/mockData';
import { demoUserState, noopBoostCatalyst, noopNotification, PageShell } from './pageUtils';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  return <PageShell><Leaderboard catalysts={INITIAL_CATALYSTS} bids={INITIAL_BIDS} userState={demoUserState} onSelectCatalyst={(id) => navigate(`/catalysts/${id}`)} onBoostCatalyst={noopBoostCatalyst} addNotification={noopNotification} setActiveTab={() => undefined} /></PageShell>;
}

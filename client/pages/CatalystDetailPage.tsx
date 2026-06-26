import { Navigate, useNavigate, useParams } from 'react-router-dom';
import CatalystDetails from '../../src/components/CatalystDetails';
import { INITIAL_BIDS, INITIAL_CATALYSTS } from '../../src/mockData';
import { demoUserState, noopBoostBid, noopNotification, noopSubmitBid, PageShell } from './pageUtils';

export default function CatalystDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const catalyst = INITIAL_CATALYSTS.find((item) => item.id === id);
  if (!catalyst) return <Navigate to="/catalysts" replace />;
  return (
    <PageShell>
      <CatalystDetails catalyst={catalyst} bids={INITIAL_BIDS.filter((bid) => bid.catalystId === catalyst.id)} onBack={() => navigate('/catalysts')} userState={demoUserState} onSubmitBid={noopSubmitBid} onBoostBid={noopBoostBid} addNotification={noopNotification} />
    </PageShell>
  );
}

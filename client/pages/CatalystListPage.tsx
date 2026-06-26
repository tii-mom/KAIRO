import { useNavigate } from 'react-router-dom';
import CatalystsList from '../../src/components/CatalystsList';
import { INITIAL_CATALYSTS } from '../../src/mockData';
import { demoUserState, noopBoostCatalyst, noopNotification, PageShell } from './pageUtils';

export default function CatalystListPage() {
  const navigate = useNavigate();
  return (
    <PageShell>
      <CatalystsList catalysts={INITIAL_CATALYSTS} userState={demoUserState} onSelectCatalyst={(id) => navigate(`/catalysts/${id}`)} onBoostCatalyst={noopBoostCatalyst} addNotification={noopNotification} />
    </PageShell>
  );
}

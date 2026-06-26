import Dashboard from '../../src/components/Dashboard';
import { INITIAL_CATALYSTS } from '../../src/mockData';
import { demoUserState, noopBoostCatalyst, noopNotification, PageShell } from './pageUtils';

export default function HomePage() {
  return (
    <PageShell>
      <Dashboard catalysts={INITIAL_CATALYSTS} userState={demoUserState} addNotification={noopNotification} onSelectCatalyst={() => undefined} setActiveTab={() => undefined} onBoostCatalyst={noopBoostCatalyst} />
    </PageShell>
  );
}

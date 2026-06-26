import AdminPanel from '../../src/components/AdminPanel';
import { INITIAL_CATALYSTS } from '../../src/mockData';
import { noopNotification, noopUpdateCatalyst, PageShell } from './pageUtils';

export default function AdminPage() {
  return <PageShell><AdminPanel catalysts={INITIAL_CATALYSTS} onUpdateCatalyst={noopUpdateCatalyst} addNotification={noopNotification} isOpen onClose={() => undefined} /></PageShell>;
}

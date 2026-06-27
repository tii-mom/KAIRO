import { Link, NavLink, Outlet } from 'react-router-dom';
import { Activity, Award, FlaskConical, HeartHandshake, MessageSquare, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { SignalTicker, cx } from './components/runtimeUi';

const navItems = [
  { to: '/', label: 'Catalysts', icon: Sparkles },
  { to: '/catalysts', label: 'Funding Status', icon: ShieldCheck },
  { to: '/builder', label: 'Builder Board', icon: Award },
  { to: '/leaderboard', label: 'KAIRO Score', icon: Trophy },
  { to: '/proof', label: 'Proof of Support', icon: HeartHandshake },
  { to: '/beta', label: 'Private Beta', icon: FlaskConical },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
];

const tickerItems = [
  { label: 'REVIVAL RUNTIME', value: 'V2 ACTIVE', tone: 'gold' as const },
  { label: 'STATUS', value: 'PRIVATE BETA', tone: 'sky' as const },
  { label: 'COGNITIVE RADAR', value: 'MOMENTUM FEED', tone: 'emerald' as const },
  { label: 'EVIDENCE LOG', value: 'PUBLIC SAFE REWARDS', tone: 'gold' as const },
  { label: 'TRUST PROOF', value: 'SUPPORT TRAIL', tone: 'sky' as const },
  { label: 'OPERATIONS', value: 'GOVERNANCE ONLINE', tone: 'rose' as const },
];

export default function RuntimeV2Shell() {
  return (
    <div className="kairo-root text-white flex flex-col min-h-screen">
      <SignalTicker items={tickerItems} />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0c0e14]/80 backdrop-blur-xl">
        <div className="kairo-shell py-4">
          <div className="glass-panel flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/kairo-logo-dark.png"
                  alt="KAIRO"
                  className="h-12 w-12 rounded-lg object-cover drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                />
                <div>
                  <div className="font-mono text-lg font-bold tracking-[0.25em] text-[#ffb95f]">KAIRO</div>
                  <div className="mt-0.5 text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">Resurrection Platform</div>
                </div>
              </Link>
              <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
                <StatusMetric label="Telemetry Shell" value="Command Consoles" />
                <StatusMetric label="Ecosystem Scope" value="Resurrection Signal" />
                <StatusMetric label="Protocol Guardrail" value="Zero Financial Flows" />
              </div>
            </div>
            <nav className="scrollbar-none flex gap-1.5 overflow-x-auto py-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cx(
                      'px-3.5 py-2 font-mono text-[10px] tracking-wider uppercase border border-transparent rounded hover:border-[#ffb95f]/20 hover:bg-white/[0.03] text-white/60 transition-all duration-200 shrink-0 flex items-center gap-1.5',
                      isActive && 'border-[#ffb95f]/30 bg-[#ffb95f]/10 text-[#ffb95f]'
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="kairo-shell py-6 sm:py-8 flex-grow">
        <Outlet />
      </main>
      <footer className="w-full border-t border-white/5 bg-[#0c0e14]/90 py-10 mt-12">
        <div className="kairo-shell flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/kairo-logo-dark.png"
              alt="KAIRO"
              className="h-8 w-8 rounded-lg object-cover opacity-90"
            />
            <div className="text-xl font-bold font-sans tracking-tight text-[#ffb95f]">KAIRO</div>
          </div>
          <div className="text-white/40 font-mono text-[10px] uppercase tracking-widest text-center">
            © 2026 KAIRO Protocol. Reignite the Dormant.
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/">Platform</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/leaderboard">Governance</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/how-it-works">Docs</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/feedback">Feedback</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/beta">Beta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/5 bg-white/[0.01] px-3 py-2 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[8px] font-mono uppercase tracking-widest text-white/30">{label}</div>
        <div className="mt-0.5 text-[11px] font-medium text-white/70 truncate">{value}</div>
      </div>
      <Activity className="h-3.5 w-3.5 text-[#ffb95f] shrink-0 opacity-70" />
    </div>
  );
}

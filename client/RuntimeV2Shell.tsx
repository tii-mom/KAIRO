import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, Award, FlaskConical, HeartHandshake, MessageSquare, ShieldCheck, Sparkles, Trophy, Plus } from 'lucide-react';
import { SignalTicker, cx } from './components/runtimeUi';
import { useI18n } from './i18n/useI18n';
import LanguageSwitcher from './i18n/LanguageSwitcher';

export default function RuntimeV2Shell() {
  const { t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refVal = params.get('ref');
    if (refVal && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('kairo-referrer-id', refVal);
    }
  }, [location]);


  const navItems = [
    { to: '/', label: t('nav.home'), icon: Sparkles },
    { to: '/catalysts', label: t('nav.catalystRegistry'), icon: ShieldCheck },
    { to: '/create-catalyst', label: t('nav.submitCatalyst'), icon: Plus },
    { to: '/builder', label: t('nav.builderBoard'), icon: Award },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { to: '/proof', label: t('nav.supportProof'), icon: HeartHandshake },
    { to: '/beta', label: t('nav.beta'), icon: FlaskConical },
    { to: '/feedback', label: t('nav.feedback'), icon: MessageSquare },
  ];

  const tickerItems = [
    { label: t('ticker.revivalRuntime'), value: t('ticker.v2Active'), tone: 'gold' as const },
    { label: t('ticker.status'), value: t('ticker.privateBeta'), tone: 'sky' as const },
    { label: t('ticker.cognitiveRadar'), value: t('ticker.momentumFeed'), tone: 'emerald' as const },
    { label: t('ticker.evidenceLog'), value: t('ticker.publicSafeRewards'), tone: 'gold' as const },
    { label: t('ticker.trustProof'), value: t('ticker.supportTrail'), tone: 'sky' as const },
    { label: t('ticker.operations'), value: t('ticker.governanceOnline'), tone: 'rose' as const },
  ];

  return (
    <div className="kairo-root text-white flex flex-col min-h-screen">
      <SignalTicker items={tickerItems} />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0c0e14]/80 backdrop-blur-xl">
        <div className="kairo-shell py-4">
          <div className="glass-panel flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/kairo-logo-dark.png"
                  alt="KAIRO"
                  className="h-12 w-12 rounded-full border border-white/10 bg-[#050608] object-cover p-[3px] transition-all duration-500 group-hover:border-[#ffb95f]/30 group-hover:scale-105 shadow-[0_0_15px_rgba(255,185,95,0.05)] group-hover:shadow-[0_0_20px_rgba(255,185,95,0.15)]"
                />
                <div>
                  <div className="font-mono text-lg font-bold tracking-[0.25em] text-[#ffb95f] transition-colors duration-300 group-hover:text-[#ffc885]">KAIRO</div>
                  <div className="mt-0.5 text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">{t('shell.resurrectionPlatform')}</div>
                </div>
              </Link>
              <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
                <StatusMetric label={t('metrics.telemetryShell')} value={t('metrics.commandConsoles')} />
                <StatusMetric label={t('metrics.ecosystemScope')} value={t('metrics.resurrectionSignal')} />
                <StatusMetric label={t('metrics.protocolGuardrail')} value={t('metrics.zeroFinancialFlows')} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
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
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      <main className="kairo-shell py-6 sm:py-8 flex-grow">
        <Outlet />
      </main>
      <footer className="w-full border-t border-white/5 bg-[#0c0e14]/90 py-10 mt-12">
        <div className="kairo-shell flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 group">
            <img
              src="/kairo-logo-dark.png"
              alt="KAIRO"
              className="h-8 w-8 rounded-full border border-white/10 bg-[#050608] object-cover p-[2px] opacity-90 transition-all duration-500 group-hover:border-[#ffb95f]/30 group-hover:scale-105"
            />
            <div className="text-xl font-bold font-sans tracking-tight text-[#ffb95f] group-hover:text-[#ffc885] transition-colors duration-300">KAIRO</div>
          </div>
          <div className="text-white/40 font-mono text-[10px] uppercase tracking-widest text-center">
            {t('shell.copyright')}
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/">{t('nav.platform')}</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/leaderboard">{t('nav.leaderboard')}</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/how-it-works">{t('nav.docs')}</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/feedback">{t('nav.feedback')}</Link>
            <Link className="text-white/50 hover:text-[#ffb95f]" to="/beta">{t('nav.beta')}</Link>
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

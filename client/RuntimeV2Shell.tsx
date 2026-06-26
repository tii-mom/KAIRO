import { Link, NavLink, Outlet } from 'react-router-dom';
import { Award, Flame, HeartHandshake, ShieldCheck, Sparkles, Trophy } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Catalysts', icon: Sparkles },
  { to: '/catalysts', label: 'Funding Status', icon: ShieldCheck },
  { to: '/builder', label: 'Builder Board', icon: Award },
  { to: '/leaderboard', label: 'KAIRO Score', icon: Trophy },
  { to: '/proof', label: 'Proof of Support', icon: HeartHandshake },
];

export default function RuntimeV2Shell() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,210,133,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_28%)]" />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070d]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffd285] text-[#05070d] shadow-[0_0_30px_rgba(255,210,133,0.28)]">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <div className="font-mono text-lg font-black tracking-[0.24em]">KAIRO</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">Runtime V2</div>
            </div>
          </Link>
          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'border-[#ffd285]/40 bg-[#ffd285]/15 text-[#ffd285]'
                      : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}

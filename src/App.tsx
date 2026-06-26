import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Flame, Award, Terminal, Globe, X, CheckCircle2, AlertCircle, Info, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Catalyst, Bid, UserState } from './types';
import { INITIAL_CATALYSTS, INITIAL_BIDS } from './mockData';
import confetti from 'canvas-confetti';

// Component imports
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CatalystsList from './components/CatalystsList';
import CatalystDetails from './components/CatalystDetails';
import BuilderHub from './components/BuilderHub';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';

interface AppProps {
  initialTab?: string;
  initialCatalystId?: string | null;
  onRouteBack?: () => void;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const INITIAL_USER: UserState = {
  walletAddress: null,
  walletName: null,
  balanceEth: 2.8452,
  balanceSol: 45.80,
  balanceKairo: 400,
  boostedCatalysts: [],
  boostedBids: [],
  ownedTokens: {
    DORM: 5000,
    PEPE2: 12000000,
    RETRO: 250,
    NEURA: 0,
    SPATIAL: 0,
    SHIBE: 80000
  }
};

export default function App({ initialTab = 'arena', initialCatalystId = null, onRouteBack }: AppProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [roleMode, setRoleMode] = useState<'investor' | 'developer'>('investor');
  const [selectedCatalystId, setSelectedCatalystId] = useState<string | null>(initialCatalystId);
  const [catalysts, setCatalysts] = useState<Catalyst[]>(INITIAL_CATALYSTS);
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  const [userState, setUserState] = useState<UserState>(INITIAL_USER);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Financial Stock Ticker Tape State
  const [tickerItems, setTickerItems] = useState([
    { symbol: 'KRI Index', price: '24,812.50', change: 1.45, isUp: true },
    { symbol: 'DORM/USDT', price: '0.004285', change: 8.24, isUp: true },
    { symbol: 'RETRO/SOL', price: '1.8540', change: -3.42, isUp: false },
    { symbol: 'PEPE2/WETH', price: '0.00002145', change: 12.45, isUp: true },
    { symbol: 'NEURA/USDC', price: '0.5620', change: 5.81, isUp: true },
    { symbol: 'SPATIAL/SOL', price: '0.1245', change: -1.22, isUp: false },
    { symbol: 'SHIBE/SOL', price: '0.008940', change: 24.12, isUp: true },
    { symbol: 'BTC/USDT', price: '68,254.00', change: -1.15, isUp: false },
    { symbol: 'ETH/USDT', price: '3,452.80', change: 0.85, isUp: true },
    { symbol: 'SOL/USDT', price: '142.65', change: 2.15, isUp: true },
    { symbol: 'KAI_GAS', price: '18 Gwei', change: 0, isUp: true, isGas: true }
  ]);

  // Simulated live pricing updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerItems((prev) =>
        prev.map((item) => {
          if (item.isGas) {
            const nextGas = Math.max(10, Math.min(120, parseFloat(item.price) + (Math.random() > 0.5 ? 1 : -1)));
            return { ...item, price: `${nextGas.toFixed(0)} Gwei` };
          }
          const changeDelta = (Math.random() - 0.48) * 0.4;
          const percentageChange = parseFloat((item.change + changeDelta).toFixed(2));
          const currentPrice = parseFloat(item.price.replace(/,/g, ''));
          const priceDelta = currentPrice * (changeDelta / 100);
          const nextPrice = (currentPrice + priceDelta);
          
          let formattedPrice = '';
          if (nextPrice > 1000) {
            formattedPrice = nextPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else if (nextPrice > 1) {
            formattedPrice = nextPrice.toFixed(4);
          } else if (nextPrice > 0.01) {
            formattedPrice = nextPrice.toFixed(6);
          } else {
            formattedPrice = nextPrice.toFixed(8);
          }

          return {
            ...item,
            price: formattedPrice,
            change: percentageChange,
            isUp: percentageChange >= 0
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateCatalyst = (id: string, updates: Partial<Catalyst>) => {
    setCatalysts((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  // Add toast notifications
  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}`;
    setNotifications((prev) => [...prev, { id, title, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Auto-remove notifications after 4.5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Wallet Actions
  const connectWallet = (walletName: string) => {
    setUserState((prev) => ({
      ...prev,
      walletAddress: '0x71C8b29330ebde4ea29141088d8b4a2911ba49Bf',
      walletName: walletName
    }));
  };

  const disconnectWallet = () => {
    setUserState((prev) => ({
      ...prev,
      walletAddress: null,
      walletName: null
    }));
    addNotification('钱包已断开', '安全断开 Web3 账户连接，清除本地会话。', 'info');
  };

  // Boost Catalyst Actions (upvoting the main project)
  const handleBoostCatalyst = (id: string, amount: number) => {
    setCatalysts((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          return { ...cat, momentum: cat.momentum + amount };
        }
        return cat;
      })
    );

    // Trigger premium confetti burst
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#ffd285', '#f52329', '#ffffff', '#ff9900']
      });
    } catch (e) {
      console.warn('Confetti effect failed:', e);
    }

    setUserState((prev) => {
      if (prev.boostedCatalysts.includes(id)) {
        return prev; // only add rewards/tracking once
      }
      return {
        ...prev,
        boostedCatalysts: [...prev.boostedCatalysts, id],
        balanceKairo: prev.balanceKairo + 50 // reward user with KAIR tokens for active boosting
      };
    });
  };

  // Boost specific builder bid/proposal
  const handleBoostBid = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          // Increase catalyst momentum too
          handleBoostCatalyst(b.catalystId, 150);
          return { ...b, votes: b.votes + 1 };
        }
        return b;
      })
    );

    setUserState((prev) => {
      if (prev.boostedBids.includes(bidId)) {
        return prev;
      }
      return {
        ...prev,
        boostedBids: [...prev.boostedBids, bidId]
      };
    });
  };

  // Submit Bid/Proposal
  const handleSubmitBid = (newBidData: Omit<Bid, 'id' | 'createdAt' | 'status' | 'votes'>) => {
    const newBid: Bid = {
      ...newBidData,
      id: `bid-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'UnderReview',
      votes: 1
    };

    setBids((prev) => [newBid, ...prev]);

    // Update totalBids count inside catalyst
    setCatalysts((prev) =>
      prev.map((cat) => {
        if (cat.id === newBidData.catalystId) {
          return { ...cat, totalBids: cat.totalBids + 1, momentum: cat.momentum + 300 };
        }
        return cat;
      })
    );
  };

  // Reward points handler
  const handleAddRewards = (amount: number) => {
    setUserState((prev) => ({
      ...prev,
      balanceKairo: prev.balanceKairo + amount
    }));
  };

  // Resolve current active Catalyst object if detailed view is open
  const selectedCatalyst = catalysts.find((c) => c.id === selectedCatalystId);

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-white selection:bg-[#ffd285] selection:text-black font-sans antialiased relative">
      
      {/* Absolute ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Wall Street Real-Time Ticker Tape */}
      <div className="w-full bg-[#090b11]/95 border-b border-white/5 py-2.5 px-4 backdrop-blur-md sticky top-0 z-50 overflow-hidden text-[10px] font-mono font-bold tracking-wider">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          
          {/* Live Status Indicators */}
          <div className="flex items-center space-x-3.5 flex-shrink-0 border-r border-white/10 pr-4">
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#ffd285] tracking-widest text-[9px]">KAIRO NETWORK</span>
            </div>
          </div>

          {/* Scrolling tape wrapper */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex space-x-8 animate-marquee whitespace-nowrap">
              {/* Double up items to ensure continuous seamless layout */}
              {[...tickerItems, ...tickerItems].map((item, idx) => (
                <div key={idx} className="inline-flex items-center space-x-2">
                  <span className="text-white/40">{item.symbol}</span>
                  <span className="text-white font-extrabold">{item.price}</span>
                  {item.isGas ? (
                    <span className="text-[#ffd285] bg-[#ffd285]/10 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">GAS</span>
                  ) : item.isUp ? (
                    <span className="text-emerald-400 flex items-center font-bold">
                      ▲ <span className="ml-0.5">+{item.change}%</span>
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center font-bold">
                      ▼ <span className="ml-0.5">{item.change}%</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Volume Tracker Pill */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 border-l border-white/10 pl-4 text-[9px]">
            <span className="text-white/30 font-mono">24H VOLUME:</span>
            <span className="text-emerald-400 font-extrabold font-mono">$1,420,854,920</span>
          </div>

        </div>
      </div>

      {/* Top Ambient Glow elements */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#f52329]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[30rem] w-[30rem] rounded-full bg-[#ffd285]/3 blur-[140px] pointer-events-none" />

      {/* Navbar Component */}
      <Navbar
        userState={userState}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCatalystId(null); // Close detail view on tab switch
          if (['arena', 'leaderboard'].includes(tab)) {
            setRoleMode('investor');
          } else if (['catalysts', 'builderHub'].includes(tab)) {
            setRoleMode('developer');
          }
        }}
        roleMode={roleMode}
        setRoleMode={(mode) => {
          setRoleMode(mode);
          if (mode === 'investor') {
            if (!['arena', 'leaderboard'].includes(activeTab)) {
              setActiveTab('arena');
            }
          } else {
            if (!['catalysts', 'builderHub'].includes(activeTab)) {
              setActiveTab('catalysts');
            }
          }
          setSelectedCatalystId(null);
        }}
        addNotification={addNotification}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 pb-28 md:pb-8 sm:px-6 z-10 relative">
        
        {/* Banner Announcement */}
        <div className="mb-8 rounded-2xl border border-[#ffd285]/10 bg-gradient-to-r from-[#ffd285]/10 to-[#f52329]/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-[#ffd285] flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-white tracking-wide">Kairo 催化剂治理平台安全运行中</span>
              <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                由 Kairo 智能路由与多签多链路保护，旨在催化 Web3 代币重组与复兴。当前为测试演练阶段。
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#ffd285] px-3.5 py-1.5 text-[10px] font-bold text-black hover:bg-white transition-colors animate-pulse"
              id="banner-sandbox-trigger"
            >
              <Shield className="h-3 w-3 text-black" />
              <span>沙箱控制面板</span>
            </button>

            <div className="flex items-center space-x-2 rounded-xl bg-[#0c0e14] px-3.5 py-1.5 border border-white/5 text-[10px] font-mono font-bold text-[#ffd285]">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span>已燃烧通缩：24,801,200 DORM</span>
            </div>
          </div>
        </div>

        {/* Workspace Mode Switcher (Tab Selector) */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-1.5 rounded-2xl bg-[#0c0e14]/60 border border-white/5 backdrop-blur-md">
          <div className="flex p-1 rounded-xl bg-[#07090e] border border-white/5">
            <button
              onClick={() => {
                setRoleMode('investor');
                if (!['arena', 'leaderboard'].includes(activeTab)) {
                  setActiveTab('arena');
                }
                setSelectedCatalystId(null);
                addNotification('进入：支持者视角', '已加载 Catalyst 势能、Proof of Support 与排行榜', 'info');
              }}
              className={`flex-1 md:flex-initial rounded-lg px-5 py-2.5 text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                roleMode === 'investor'
                  ? 'bg-gradient-to-r from-[#ffd285] to-[#f52329] text-black shadow-md'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              <span>投资与治理模式</span>
            </button>
            <button
              onClick={() => {
                setRoleMode('developer');
                if (!['catalysts', 'builderHub'].includes(activeTab)) {
                  setActiveTab('catalysts');
                }
                setSelectedCatalystId(null);
                addNotification('进入：开发者中心', '已开启催化任务方案及开发终端板块', 'info');
              }}
              className={`flex-1 md:flex-initial rounded-lg px-5 py-2.5 text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                roleMode === 'developer'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>催化开发模式</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 px-3 text-xs text-white/50">
            <span className={`h-2 w-2 rounded-full animate-pulse ${roleMode === 'developer' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
            <span className="font-sans font-medium text-white/70">
              {roleMode === 'investor' 
                ? '当前视角：Catalyst 势能、Proof of Support、排行榜' 
                : '当前视角：资助任务、提案投票、Builder沙箱'
              }
            </span>
          </div>
        </div>

        {/* Workspace Portal Card */}
        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
          roleMode === 'developer'
            ? 'border-cyan-500/10 bg-gradient-to-br from-cyan-950/20 to-blue-950/10'
            : 'border-[#ffd285]/10 bg-gradient-to-br from-[#ffd285]/5 to-[#f52329]/5'
        }`}>
          {/* Background Ambient Glow */}
          <div className={`absolute -right-32 -top-32 h-64 w-64 rounded-full blur-[80px] opacity-10 pointer-events-none ${
            roleMode === 'developer' ? 'bg-cyan-400' : 'bg-[#ffd285]'
          }`} />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 relative">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                  roleMode === 'developer' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-[#ffd285]/20 text-[#ffd285]'
                }`}>
                  {roleMode === 'developer' ? 'Builder Node Active' : 'Investor Gateway'}
                </span>
                <span className="text-white/30 text-xs">|</span>
                <span className="text-xs text-white/50">当前版本 v1.4 (Beta)</span>
              </div>
              <h2 className={`text-lg font-bold tracking-tight ${
                roleMode === 'developer' ? 'text-white' : 'text-[#ffd285]'
              }`}>
                {roleMode === 'developer' ? '💻 Kairo 催化开发终端' : '🚀 Kairo 投资与治理视窗'}
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                {roleMode === 'developer' 
                  ? '专为 Web3 Builder、项目团队与社区催化人打造的协同工具链。在这里，您可以针对由于流动性匮乏或市场异常受损的代币提出重组资助和催化剂重启方案，获得全网 Boost 能量并锁定高额 Kairo 治理奖励。'
                  : '面向社区支持者的复兴看板。在这里，您可以实时跟踪 Catalyst 的 Boost 势能、Builder 交付记录与 Proof of Support 积分变化。'
                }
              </p>
            </div>

            {/* Metrics Dashboard for current mode */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 flex-shrink-0 w-full lg:w-auto min-w-[320px]">
              {roleMode === 'developer' ? (
                <>
                  <div className="rounded-xl border border-cyan-500/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">可用任务</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono mt-1">12 项</span>
                  </div>
                  <div className="rounded-xl border border-cyan-500/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">提交提案</span>
                    <span className="text-base font-extrabold text-cyan-300 font-mono mt-1">38 份</span>
                  </div>
                  <div className="rounded-xl border border-cyan-500/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">开发分红</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono mt-1">180k KAI</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[#ffd285]/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">全网势能</span>
                    <span className="text-base font-extrabold text-[#ffd285] font-mono mt-1">1.24M Bt</span>
                  </div>
                  <div className="rounded-xl border border-[#ffd285]/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">24H 交易量</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono mt-1">$1.42B</span>
                  </div>
                  <div className="rounded-xl border border-[#ffd285]/10 bg-[#07090e]/60 p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-white/40 block">治理票数</span>
                    <span className="text-base font-extrabold text-[#ffd285] font-mono mt-1">400 票</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Render Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCatalystId ? 'details' : activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* If a Catalyst is selected for detailed view, show CatalystDetails regardless of activeTab */}
            {selectedCatalystId && selectedCatalyst ? (
              <CatalystDetails
                catalyst={selectedCatalyst}
                bids={bids}
                onBack={() => {
                  setSelectedCatalystId(null);
                  onRouteBack?.();
                }}
                userState={userState}
                onSubmitBid={handleSubmitBid}
                onBoostBid={handleBoostBid}
                addNotification={addNotification}
              />
            ) : (
              <>
                {activeTab === 'arena' && (
                  <Dashboard
                    catalysts={catalysts}
                    userState={userState}
                    addNotification={addNotification}
                    onSelectCatalyst={(id) => {
                      setSelectedCatalystId(id);
                      setActiveTab('catalysts');
                    }}
                    setActiveTab={setActiveTab}
                    onBoostCatalyst={handleBoostCatalyst}
                  />
                )}

                {activeTab === 'catalysts' && (
                  <CatalystsList
                    catalysts={catalysts}
                    userState={userState}
                    onSelectCatalyst={setSelectedCatalystId}
                    onBoostCatalyst={handleBoostCatalyst}
                    addNotification={addNotification}
                  />
                )}

                {activeTab === 'leaderboard' && (
                  <Leaderboard
                    catalysts={catalysts}
                    bids={bids}
                    userState={userState}
                    onSelectCatalyst={(id) => {
                      setSelectedCatalystId(id);
                      setActiveTab('catalysts');
                    }}
                    onBoostCatalyst={handleBoostCatalyst}
                    addNotification={addNotification}
                    setActiveTab={setActiveTab}
                  />
                )}



                {activeTab === 'builderHub' && (
                  <BuilderHub
                    bids={bids}
                    userState={userState}
                    addNotification={addNotification}
                    onAddRewards={handleAddRewards}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Sticky Bottom Credit Line */}
      <footer className="w-full py-8 mt-16 border-t border-white/5 text-[11px] text-white/30 font-sans">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Kairo Decentralized Revival Protocol © 2026. All rights secured.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white/60 transition-colors cursor-pointer">Protocol Specifications</span>
            <span className="hover:text-white/60 transition-colors cursor-pointer">Audits</span>
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-[#ffd285] hover:underline hover:text-white transition-all font-bold flex items-center space-x-1"
              id="footer-sandbox-trigger"
            >
              <Shield className="h-3 w-3 inline" />
              <span>调试沙箱</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Sandbox Sidebar Drawer */}
      <AdminPanel 
        catalysts={catalysts}
        onUpdateCatalyst={handleUpdateCatalyst}
        addNotification={addNotification}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Floating Toast Notification Panel */}
      <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 z-50 flex flex-col gap-3.5 md:max-w-sm pointer-events-none" id="toast-notifications-root">
        <AnimatePresence>
          {notifications.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="pointer-events-auto rounded-2xl border border-white/5 bg-[#0c0e14]/95 p-4 shadow-2xl backdrop-blur-md flex gap-3 relative overflow-hidden"
              >
                {/* Visual state vertical line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  isSuccess ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-blue-500'
                }`} />

                <div className="flex-shrink-0 mt-0.5 ml-1.5">
                  {isSuccess ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
                  ) : isError ? (
                    <AlertCircle className="h-4.5 w-4.5 text-red-400" />
                  ) : (
                    <Info className="h-4.5 w-4.5 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-xs font-extrabold text-white leading-none">{toast.title}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mt-1">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeNotification(toast.id)}
                  className="absolute top-3.5 right-3 text-white/40 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Flame, ArrowUpRight, TrendingUp, Users, RefreshCw, Zap, TrendingDown, HelpCircle, Sparkles, Activity } from 'lucide-react';
import { Catalyst, ProjectToken } from '../types';

interface DashboardProps {
  catalysts: Catalyst[];
  userState: any;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  onSelectCatalyst: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onBoostCatalyst: (id: string, amount: number) => void;
}

interface ActivityEvent {
  id: string;
  user: string;
  type: 'boost' | 'bid' | 'swap';
  target: string;
  detail: string;
  time: string;
}

const MOCK_EVENTS: Omit<ActivityEvent, 'id' | 'time'>[] = [
  { user: '0x94fC...e92a', type: 'boost', target: 'DORM', detail: '质押注入 850 Boost 势能', },
  { user: '0x32a1...78b2', type: 'swap', target: 'PEPE2', detail: '兑换了 45,000,000 $PEPE2 并燃烧 5%' },
  { user: 'Builder Alex.eth', type: 'bid', target: 'DORM', detail: '提交了 Catalyst-01 的复兴方案' },
  { user: '0x77c1...f201', type: 'boost', target: 'RETRO', detail: '质押注入 1,200 Boost 势能' },
  { user: '0xab62...cd81', type: 'swap', target: 'NEURA', detail: '买入 8,500 $NEURA 算力代币' },
  { user: 'Builder Elena_R', type: 'bid', target: 'PEPE2', detail: '提交了 Pepe2 极速挂机版 H5 小游戏' },
  { user: '0x44bf...1210', type: 'boost', target: 'SPATIAL', detail: '质押注入 300 Boost 势能' }
];

export default function Dashboard({
  catalysts,
  userState,
  addNotification,
  onSelectCatalyst,
  setActiveTab,
  onBoostCatalyst
}: DashboardProps) {
  // Select the first catalyst's token as default selected token
  const [selectedTokenId, setSelectedTokenId] = useState<string>('cat-1');
  const [activationRate, setActivationRate] = useState<number>(35); // percentage (0 - 100)
  const [activityStream, setActivityStream] = useState<ActivityEvent[]>([]);
  const [dashboardView, setDashboardView] = useState<'investor' | 'developer'>('investor');
  const [compilerRuns, setCompilerRuns] = useState<number>(200);
  const [isDryDeploying, setIsDryDeploying] = useState<boolean>(false);
  const [devConsoleLogs, setDevConsoleLogs] = useState<string[]>([
    'KAIR-VM Compiler Core v1.9.0 initialized.',
    'System ready to optimize bytecode pipelines.',
    'Loaded Solidity target: catalyst-receiver.sol.',
    'Multi-sig proxy status: secured (3-of-5 threshold active).'
  ]);

  const selectedCatalyst = catalysts.find(c => c.id === selectedTokenId) || catalysts[0];
  const token = selectedCatalyst.token;

  // Simulate web3 activity logs
  useEffect(() => {
    const initialEvents: ActivityEvent[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const ev = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      initialEvents.push({
        ...ev,
        id: `init-${i}`,
        time: new Date(now.getTime() - i * 4 * 60 * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
    setActivityStream(initialEvents);

    const interval = setInterval(() => {
      const ev = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setActivityStream(prev => [
        {
          ...ev,
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 5)
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Sandbox simulation logic based on selected token and activation rate
  const peakMc = token.originalPeakMc;
  const currentMc = token.currentMc;
  const currentPrice = token.priceHistory[token.priceHistory.length - 1]?.price || 0.001;
  const headroomMultiple = peakMc / currentMc;

  // Let's say if activation is X%, the projected market cap gains portion of headroom
  // Cap is simulated to grow logarithmically or exponentially with activation
  const activationMultiplier = 1 + (activationRate / 100) * (headroomMultiple * 0.15);
  const projectedMc = currentMc * activationMultiplier;
  const projectedPrice = currentPrice * activationMultiplier;
  const projectedBurn = (token.holdersCount * (activationRate / 100) * (token.burnRate * 450)).toFixed(0);
  const projectedPriceChange = ((activationMultiplier - 1) * 100);

  const handleApplySandboxBoost = () => {
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请在右上角连接钱包以提交 Boost 势能！', 'error');
      return;
    }
    
    // Simulate boosting on the active token
    onBoostCatalyst(selectedCatalyst.id, 500);
    addNotification('复苏势能注入成功', `您为 $${token.symbol} 注入了 500 Boost 势能！`, 'success');
  };

  return (
    <div className="space-y-6" id="arena-dashboard">
      
      {/* Perspective Switcher for Users and Developers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0e14]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{dashboardView === 'investor' ? '当前布局：📊 社区投资者专属看板 (Investor View)' : '当前布局：🛠️ 智能合约开发者控制台 (Developer Console)'}</span>
          </span>
          <p className="text-[11px] text-white/50 mt-1 leading-relaxed max-w-2xl">
            {dashboardView === 'investor' 
              ? '关注休眠资产势能、社区多签托管、市值修复模拟与销毁通缩进度。适合治理方与代币持有者。' 
              : '专注 KAIR-VM 沙盒编译器调试、气阻 (Gas) 执行效率微调、智能对齐校验与多签代理。适合链上 Builder 与安全审计师。'}
          </p>
        </div>
        <div className="flex rounded-xl bg-[#07090e] p-[3px] border border-white/5 self-start md:self-center">
          <button
            onClick={() => setDashboardView('investor')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              dashboardView === 'investor'
                ? 'bg-[#ffd285] text-black shadow-lg shadow-[#ffd285]/10 font-black'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span>📊 投资者视图</span>
          </button>
          <button
            onClick={() => setDashboardView('developer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              dashboardView === 'developer'
                ? 'bg-[#ffd285] text-black shadow-lg shadow-[#ffd285]/10 font-black'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span>🛠️ 开发者视图</span>
          </button>
        </div>
      </div>
      
      {/* Upper Grid Hero & Interactive Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns: Dynamic Chart & Stats */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md relative overflow-hidden">
          {/* Subtle neon corner shadows */}
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#ffd285]/5 blur-[80px]" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
            <div className="flex items-center space-x-3.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffd285] to-[#f52329] p-[1.5px] shadow-[0_0_15px_rgba(255,185,95,0.15)]">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0e14] text-base font-bold text-white font-mono">
                  ${token.symbol}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white">{token.name}</h2>
                  <span className="rounded bg-[#ffd285]/10 px-2 py-0.5 text-[10px] font-bold text-[#ffd285] tracking-wide uppercase">
                    {selectedCatalyst.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-white/50 font-mono mt-0.5">
                  <span>峰值市值: ${ (token.originalPeakMc / 1000000).toFixed(1) }M</span>
                  <span>•</span>
                  <span>当前市值: ${ (token.currentMc / 1000).toFixed(1) }K</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-white/40 font-medium">当前价格 (模拟)</div>
                <div className="text-base font-mono font-bold text-[#ffd285]">
                  ${currentPrice.toFixed(currentPrice < 0.0001 ? 8 : 4)}
                </div>
              </div>
              <div className={`rounded-xl px-2.5 py-1.5 flex items-center space-x-1 text-xs font-bold ${
                token.priceChange24h >= 0 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {token.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Conditional Sub-Views depending on Perspective Toggle */}
          {dashboardView === 'investor' ? (
            <>
              {/* Interactive Recharts area chart */}
              <div className="h-64 sm:h-72 w-full mt-6 z-10 font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={token.priceHistory} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffd285" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ffd285" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(255,255,255,0.3)" 
                      tickLine={false} 
                      axisLine={false}
                      dy={8}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      tickLine={false} 
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val.toFixed(val < 0.001 ? 5 : 3)}`}
                      width={45}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0c0e14', 
                        border: '1px solid rgba(255,210,133,0.15)', 
                        borderRadius: '12px' 
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#ffd285', fontFamily: 'monospace', fontWeight: 'bold' }}
                      formatter={(value: any) => [`$${parseFloat(value).toFixed(value < 0.0001 ? 8 : 5)}`, '模拟价格']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#ffd285" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sparkles / Promo box underneath chart */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="h-4 w-4 text-[#ffd285]" />
                  <p className="text-xs text-white/70">
                    此代币被发布了专属的复兴催化任务。共有 <strong className="text-white font-mono">{selectedCatalyst.totalBids}</strong> 位 Builders 正在全力开发应用中！
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectCatalyst(selectedCatalyst.id);
                    setActiveTab('catalysts');
                  }}
                  className="text-xs font-bold text-[#ffd285] hover:text-white transition-colors flex items-center space-x-1 flex-shrink-0"
                >
                  <span>查看催化任务并投标</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </>
          ) : (
            /* Developer View: Solidity Analyzer + Interactive AST Sandbox */
            <div className="flex-1 mt-6 z-10 flex flex-col justify-between">
              <div className="rounded-xl border border-white/5 bg-[#07090e]/80 p-4 font-mono text-xs space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-[#ffd285] font-bold text-[10px] tracking-wider">KAIR-VM AST 语法分析沙盒</span>
                  <span className="text-[9px] text-green-400 animate-pulse font-bold">STATUS: COMPILER READY</span>
                </div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto" id="dev-compiler-scroll">
                  {devConsoleLogs.map((log, i) => (
                    <div key={i} className="text-white/70 leading-relaxed text-[11px]">
                      <span className="text-white/30 mr-1.5">&gt;</span>
                      {log}
                    </div>
                  ))}
                  {isDryDeploying && (
                    <div className="text-amber-400 font-bold animate-pulse text-[11px]">
                      <span className="text-white/30 mr-1.5">&gt;</span>
                      正在通过 KAIR-VM 安全策略节点进行试部署...
                    </div>
                  )}
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-[10px]">
                  <div className="p-2.5 rounded bg-white/[0.01] border border-white/5">
                    <span className="text-white/40 block">Gas 优化轮数 (Optimization)</span>
                    <span className="text-green-400 font-bold block mt-0.5">{compilerRuns} Runs (256-bit EVM)</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.01] border border-white/5">
                    <span className="text-white/40 block">安全防护级别 (Security)</span>
                    <span className="text-[#ffd285] font-bold block mt-0.5">3-of-5 Kairo Multi-sig</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-white/[0.01] to-transparent border border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/50">编译器将智能加载 $ {token.symbol} 抽象语法树</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDevConsoleLogs(prev => [
                        ...prev,
                        `[AST] 开始解析并验证 $${token.symbol} 智能合约的 AST 语法树...`,
                        `[✓] 成功通过 SafeMath 通用检测，字节码大小: 2,814 bytes.`
                      ]);
                      addNotification('AST 解析完成', '代币合约抽象语法树格式安全，校验成功！', 'success');
                    }}
                    className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white transition-colors cursor-pointer"
                  >
                    解析 AST
                  </button>
                  <button
                    disabled={isDryDeploying}
                    onClick={() => {
                      setIsDryDeploying(true);
                      setDevConsoleLogs(prev => [...prev, `[DEPLOY] 发起测试网多签试部署交易...`]);
                      setTimeout(() => {
                        setIsDryDeploying(false);
                        setDevConsoleLogs(prev => [
                          ...prev,
                          `[✓] 试部署成功！合约地址: 0xKa_${token.symbol.toLowerCase()}_${Math.floor(Math.random() * 9000 + 1000)}`,
                          `[✓] 智能对齐: 合约完全适配 $${token.symbol} 休眠持有人激活池。`
                        ]);
                        addNotification('试部署成功', '已生成 Kairo 测试网模拟多签审计凭证！', 'success');
                      }, 1200);
                    }}
                    className="rounded-lg bg-[#ffd285] hover:bg-white px-3 py-1.5 text-[10px] font-bold text-black transition-colors cursor-pointer"
                  >
                    {isDryDeploying ? '试部署中...' : '试部署合约'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Conditional Sandbox Projection (Investor) or Gas Optimizer (Developer) */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md relative flex flex-col justify-between overflow-hidden">
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#f52329]/5 blur-[80px]" />
          
          {dashboardView === 'investor' ? (
            <div className="z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-[#ffd285]" />
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase">市值修复预测面板</h3>
                  </div>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-mono text-white/50">PROJECTION</span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed mt-4">
                  如果通过开发实用工具让 <strong className="text-[#ffd285] font-mono">{token.holdersCount}</strong> 名休眠持有者重新活跃，项目市值将会迎来几何倍数的反弹：
                </p>

                {/* Slider Control */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">社区成员激活率</span>
                    <span className="text-[#ffd285] font-bold text-sm">{activationRate}%</span>
                  </div>
                  <input
                    id="sandbox-slider"
                    type="range"
                    min="5"
                    max="100"
                    value={activationRate}
                    onChange={(e) => setActivationRate(parseInt(e.target.value))}
                    className="w-full accent-[#ffd285] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>5% (冷启动)</span>
                    <span>50% (中度繁荣)</span>
                    <span>100% (全面复兴)</span>
                  </div>
                </div>

                {/* Dynamic Simulated Outputs */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-xs text-white/50">预期反弹市值</div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-white">${(projectedMc / 1000).toFixed(1)}K</div>
                      <div className="text-[10px] font-mono text-green-400">+{projectedPriceChange.toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-xs text-white/50">代币销毁预期</div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-red-400">-{projectedBurn} {token.symbol}</div>
                      <div className="text-[10px] font-sans text-white/40">基于 {token.burnRate}% 基础销毁机制</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-xs text-white/50">重拾峰值估值距离</div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#ffd285]">{(peakMc / projectedMc).toFixed(1)}x</div>
                      <div className="text-[10px] text-white/40">相较 $ {(peakMc / 1000000).toFixed(1)}M 顶峰</div>
                    </div>
                  </div>
                </div>

                {/* Valuation Recovery Progress Indicator */}
                <div className="mt-5 p-3.5 rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white/40">历史峰值估值收复进度</span>
                    <span className="text-green-400 font-bold">{Math.min(100, (projectedMc / peakMc) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-white/20" 
                      style={{ width: `${Math.min(100, (currentMc / peakMc) * 100)}%` }} 
                    />
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#f52329] via-[#ff9900] to-[#ffd285] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (projectedMc / peakMc) * 100)}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-white/30">
                    <span>当前: ${(currentMc / 1000).toFixed(0)}K</span>
                    <span>预期: ${(projectedMc / 1000).toFixed(0)}K</span>
                    <span>巅峰: ${(peakMc / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  id="sandbox-boost-btn"
                  onClick={handleApplySandboxBoost}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-[#ffd285] to-[#f52329] py-3 text-xs font-bold text-black shadow-lg transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>注入 Boost 激活休眠代币势能</span>
                </button>
              </div>
            </div>
          ) : (
            /* Developer View: Gas Optimizer & KAIR-VM Params */
            <div className="z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-[#ffd285]" />
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase">气阻执行效率优化器</h3>
                  </div>
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-[9px] font-mono text-green-400">OPTIMIZER</span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed mt-4">
                  治理方与开发者可通过微调 KAIR-VM 编译器执行轮数来降低多签托管、通缩销毁和重组注入的单笔 Gas 费：
                </p>

                {/* Slider Control */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">编译器优化轮数 (Runs)</span>
                    <span className="text-green-400 font-bold text-sm">{compilerRuns} Runs</span>
                  </div>
                  <input
                    id="runs-slider"
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={compilerRuns}
                    onChange={(e) => setCompilerRuns(parseInt(e.target.value))}
                    className="w-full accent-green-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>200 Runs (中等效率)</span>
                    <span>1000 Runs (极速对齐)</span>
                    <span>2000 Runs (最大化省 Gas)</span>
                  </div>
                </div>

                {/* Dynamic Simulated Outputs for Devs */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
                    <div className="text-white/50">多签交互消耗气阻</div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{Math.max(12000, 85000 - compilerRuns * 25).toLocaleString()} gas</div>
                      <div className="text-[10px] text-green-400">节省 -{((compilerRuns / 2000) * 45).toFixed(1)}% gas</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
                    <div className="text-white/50">Swap 扣除 Gas 折合</div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#ffd285]">{(0.0035 - (compilerRuns / 2000) * 0.0015).toFixed(5)} ETH</div>
                      <div className="text-[10px] text-white/40">基于当前 {18} Gwei 网络主网估算</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
                    <div className="text-white/50">安全审计评分 (Audit)</div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{Math.min(99.8, 96.5 + (compilerRuns / 2000) * 3.3).toFixed(1)} / 100</div>
                      <div className="text-[10px] text-white/40">由 KAIR-VM 模拟评估算法驱动</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    addNotification('编译器参数已保存', `成功将全局 KAIR-VM 编译器执行轮数调整为 ${compilerRuns} Runs。`, 'success');
                    onBoostCatalyst(selectedCatalyst.id, 100); // give minor momentum boost to reflect action
                  }}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-green-500 py-3 text-xs font-bold text-black shadow-lg transition-all hover:bg-green-400 cursor-pointer"
                >
                  <span>应用全局 KAIR-VM 编译器优化</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Row 2: Leaderboard & Dynamic Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns: Arena Leaderboard */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md" id="leaderboard-panel">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-2.5">
              <Flame className="h-5 w-5 text-[#f52329] animate-pulse" />
              <div>
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">复苏竞技排行榜 (Arena Leaderboard)</h3>
                <p className="text-[10px] text-white/40 mt-0.5">根据社区 Boost 势能与 Builder 投标活跃度动态计算排名</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] font-mono text-green-400">LIVE FEED</span>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">排名</th>
                  <th className="py-3 px-4">项目代币</th>
                  <th className="py-3 px-4">复苏势能 (Boost)</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">销毁比例</th>
                  <th className="py-3 px-4 hidden md:table-cell">历史峰值 / 当前</th>
                  <th className="py-3 px-4 text-right">复兴空间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {catalysts
                  .sort((a, b) => b.momentum - a.momentum)
                  .map((cat, idx) => {
                    const isSelected = cat.id === selectedTokenId;
                    const multiple = cat.token.originalPeakMc / cat.token.currentMc;
                    
                    return (
                      <tr 
                        key={cat.id}
                        id={`leaderboard-row-${cat.token.symbol}`}
                        onClick={() => setSelectedTokenId(cat.id)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected 
                            ? 'bg-[#ffd285]/5 border-l-2 border-l-[#ffd285]' 
                            : 'hover:bg-white/[0.01]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-white/80">
                          {idx === 0 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1</span>
                          ) : idx === 1 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-400/20 text-slate-300 border border-slate-400/30">2</span>
                          ) : idx === 2 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-700/20 text-amber-600 border border-amber-700/30">3</span>
                          ) : (
                            <span className="pl-1.5">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-sm font-mono font-bold text-white group-hover:text-[#ffd285] transition-colors">${cat.token.symbol}</span>
                            <span className="hidden sm:inline-block text-[10px] text-white/40 max-w-[120px] truncate">{cat.token.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div className="flex items-center space-x-1.5 text-white">
                            <Flame className="h-3 w-3 text-[#f52329]" />
                            <span className="font-bold">{cat.momentum.toLocaleString()}</span>
                            <span className="hidden xs:inline text-[10px] text-white/40">({cat.totalBids} 投标)</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center space-x-1 rounded-md bg-red-500/10 border border-red-500/10 px-2 py-0.5 text-[10px] font-mono text-red-400 font-semibold">
                            <Flame className="h-2.5 w-2.5 text-red-400" />
                            <span>{cat.token.burnRate}%</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-white/60 hidden md:table-cell">
                          <span>${(cat.token.originalPeakMc / 1000000).toFixed(1)}M / ${(cat.token.currentMc / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-green-400">
                          {multiple.toFixed(0)}x
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Column: On-chain Beacon Logs */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md flex flex-col justify-between" id="activity-beacon">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-[#ffd285]" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">实时复苏信标 (Activity)</h3>
              </div>
              <span className="rounded bg-[#ffd285]/10 px-1.5 py-0.5 text-[9px] font-mono text-[#ffd285] font-bold">MONITOR</span>
            </div>

            <div className="mt-4 space-y-3.5" id="activity-logs">
              <AnimatePresence initial={false}>
                {activityStream.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 rounded-xl bg-white/[0.015] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#ffd285] font-semibold">{log.user}</span>
                      <span className="text-white/30">{log.time}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-white/80">{log.detail}</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-white/60 font-semibold tracking-wider">
                        ${log.target}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[10px] text-white/40 font-mono">
              数据周期：每 12 秒刷新一个区块高度
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

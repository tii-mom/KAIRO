import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Award, TrendingUp, Trophy, ArrowUpRight, Zap, Target, Star, Users, Search } from 'lucide-react';
import { Catalyst, Bid } from '../types';

interface LeaderboardProps {
  catalysts: Catalyst[];
  bids: Bid[];
  userState: any;
  onSelectCatalyst: (id: string) => void;
  onBoostCatalyst: (id: string, amount: number) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  setActiveTab: (tab: string) => void;
}

type LeaderboardTab = 'hottest' | 'builders' | 'giants' | 'comeback';

export default function Leaderboard({
  catalysts,
  bids,
  userState,
  onSelectCatalyst,
  onBoostCatalyst,
  addNotification,
  setActiveTab
}: LeaderboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<LeaderboardTab>('hottest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fast Boost action
  const handleFastBoost = (e: React.MouseEvent, id: string, symbol: string) => {
    e.stopPropagation();
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请先连接您的 Web3 钱包才能注入 Boost 势能！', 'error');
      return;
    }
    onBoostCatalyst(id, 250);
    addNotification('Boost 注入成功', `您成功向 $${symbol} 注入了 250 Boost 能量！`, 'success');
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // 1. Hottest Catalysts Data
  const hottestCatalysts = [...catalysts]
    .sort((a, b) => b.momentum - a.momentum)
    .filter(cat => 
      !normalizedQuery ||
      cat.token.symbol.toLowerCase().includes(normalizedQuery) ||
      cat.token.name.toLowerCase().includes(normalizedQuery) ||
      cat.title.toLowerCase().includes(normalizedQuery)
    );

  // 2. Top Builders Data (Group and aggregate bids by builderName)
  const buildersMap: Record<string, {
    name: string;
    avatar: string;
    totalVotes: number;
    submissionCount: number;
    bestBid: Bid;
  }> = {};

  bids.forEach((bid) => {
    if (!buildersMap[bid.builderName]) {
      buildersMap[bid.builderName] = {
        name: bid.builderName,
        avatar: bid.builderAvatar,
        totalVotes: 0,
        submissionCount: 0,
        bestBid: bid
      };
    }

    const entry = buildersMap[bid.builderName];
    entry.totalVotes += bid.votes;
    entry.submissionCount += 1;
    if (bid.votes > entry.bestBid.votes) {
      entry.bestBid = bid;
    }
  });

  const topBuilders = Object.values(buildersMap)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .filter(builder => 
      !normalizedQuery ||
      builder.name.toLowerCase().includes(normalizedQuery) ||
      builder.bestBid.title.toLowerCase().includes(normalizedQuery)
    );

  // 3. Dormant Giants Data (Ration originalPeakMc / currentMc descending)
  const dormantGiants = [...catalysts]
    .sort((a, b) => {
      const ratioA = a.token.originalPeakMc / a.token.currentMc;
      const ratioB = b.token.originalPeakMc / b.token.currentMc;
      return ratioB - ratioA;
    })
    .filter(cat => 
      !normalizedQuery ||
      cat.token.symbol.toLowerCase().includes(normalizedQuery) ||
      cat.token.name.toLowerCase().includes(normalizedQuery)
    );

  // 4. Comeback Hall Data (Completed or heavy momentum + positive 24h change)
  const comebackHall = [...catalysts]
    .filter(cat => {
      // Show completed ones OR those with momentum > 8000 and priceChange24h > 10
      return cat.status === 'Completed' || cat.status === 'Voting' || (cat.momentum > 7000 && cat.token.priceChange24h > 10);
    })
    .sort((a, b) => b.momentum - a.momentum)
    .filter(cat => 
      !normalizedQuery ||
      cat.token.symbol.toLowerCase().includes(normalizedQuery) ||
      cat.token.name.toLowerCase().includes(normalizedQuery) ||
      cat.title.toLowerCase().includes(normalizedQuery)
    );

  return (
    <div className="space-y-6" id="leaderboard-module">
      
      {/* Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-[#ffd285] animate-pulse" />
            <h2 className="text-xl font-black tracking-wider text-white uppercase font-mono">
              KAIRO 排行殿堂 (Leaderboard Hall of Fame)
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            盘点复苏生态中热度最高、实力最强、潜力最大与逆袭最成功的核心资产与建设者。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Real-time search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索项目/代币/Builder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 rounded-xl border border-white/5 bg-[#121622]/40 py-2.5 pl-9 pr-7 text-xs font-medium text-white placeholder-white/30 outline-none focus:border-[#ffd285]/30 focus:bg-[#121622]/80 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sub-tab Selectors */}
          <div className="flex rounded-xl border border-white/5 bg-[#121622]/40 p-[2px] overflow-x-auto">
            {(
              [
                { id: 'hottest', label: '最热催化剂', icon: Flame },
                { id: 'builders', label: '顶尖 Builders', icon: Users },
                { id: 'giants', label: '休眠巨兽', icon: Target },
                { id: 'comeback', label: '逆袭光荣榜', icon: Award }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#ffd285]/15 to-[#f52329]/10 border border-[#ffd285]/20 text-[#ffd285]' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#ffd285]' : 'text-current'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* 1. HOTTEST CATALYSTS VIEW */}
          {activeSubTab === 'hottest' && (
            <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 backdrop-blur-md overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-[#f52329]/5 to-transparent flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-white/60 uppercase">HOTTEST REVIVAL PROJECTS</span>
                <span className="text-[10px] text-white/40 font-mono">SORTED BY MOMENTUM POWER</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                      <th className="py-3.5 px-6">排名</th>
                      <th className="py-3.5 px-4">代币</th>
                      <th className="py-3.5 px-4">催化剂任务名称</th>
                      <th className="py-3.5 px-4 text-center hidden sm:table-cell">分类</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">投标方案数</th>
                      <th className="py-3.5 px-4 text-right">热度 (Momentum)</th>
                      <th className="py-3.5 px-6 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {hottestCatalysts.map((cat, index) => {
                      const hasBoosted = userState.boostedCatalysts.includes(cat.id);
                      return (
                        <tr 
                          key={cat.id} 
                          onClick={() => onSelectCatalyst(cat.id)}
                          className="hover:bg-white/[0.015] transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-sm">
                            {index === 0 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-black font-black text-xs">1</span>
                            ) : index === 1 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-400 text-black font-black text-xs">2</span>
                            ) : index === 2 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-700 text-black font-black text-xs">3</span>
                            ) : (
                              <span className="pl-2 text-white/60">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-sm text-[#ffd285]">
                            ${cat.token.symbol}
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate">
                            <span className="text-xs font-bold text-white group-hover:text-[#ffd285] transition-colors">{cat.title}</span>
                          </td>
                          <td className="py-4 px-4 text-center hidden sm:table-cell">
                            <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
                              {cat.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-white/80 hidden md:table-cell">
                            {cat.totalBids} 个方案
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-sm font-black text-white">
                            <div className="flex items-center justify-end space-x-1">
                              <Flame className="h-3.5 w-3.5 text-[#f52329]" />
                              <span>{cat.momentum.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={(e) => handleFastBoost(e, cat.id, cat.token.symbol)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                                hasBoosted
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-[#ffd285]/10 hover:bg-[#ffd285]/20 text-[#ffd285] border border-[#ffd285]/15'
                              }`}
                            >
                              {hasBoosted ? '已注入' : '注入 Boost'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. TOP BUILDERS VIEW */}
          {activeSubTab === 'builders' && (
            <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 backdrop-blur-md overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-white/60 uppercase">TOP REVIVAL BUILDERS</span>
                <span className="text-[10px] text-white/40 font-mono">SORTED BY CUMULATIVE VOTES</span>
              </div>

              {topBuilders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                        <th className="py-3.5 px-6">排名</th>
                        <th className="py-3.5 px-4">开发者名称</th>
                        <th className="py-3.5 px-4">核心主打方案</th>
                        <th className="py-3.5 px-4 text-center hidden sm:table-cell">总提交方案数</th>
                        <th className="py-3.5 px-4 text-right">获得 Boost 投票</th>
                        <th className="py-3.5 px-6 text-right hidden md:table-cell">开发者头衔</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-sans">
                      {topBuilders.map((builder, index) => (
                        <tr key={builder.name} className="hover:bg-white/[0.015] transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-sm">
                            {index === 0 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-black font-black text-xs">1</span>
                            ) : index === 1 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-400 text-black font-black text-xs">2</span>
                            ) : index === 2 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-700 text-black font-black text-xs">3</span>
                            ) : (
                              <span className="pl-2 text-white/60">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={builder.avatar}
                                alt={builder.name}
                                referrerPolicy="no-referrer"
                                className="h-8 w-8 rounded-full object-cover border border-white/10"
                              />
                              <div>
                                <span className="font-bold text-white block">{builder.name}</span>
                                <span className="text-[10px] text-white/40 font-mono">Verified Builder</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate">
                            <span 
                              onClick={() => {
                                onSelectCatalyst(builder.bestBid.catalystId);
                              }}
                              className="text-white/80 font-semibold hover:text-[#ffd285] transition-colors cursor-pointer"
                            >
                              {builder.bestBid.title}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-white/70 hidden sm:table-cell">
                            {builder.submissionCount} 个
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-white">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-400 fill-current" />
                              <span>{builder.totalVotes.toLocaleString()} Votes</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-mono hidden md:table-cell">
                            <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[9px] font-bold ${
                              index === 0 
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-400'
                                : 'bg-white/5 border border-white/5 text-white/50'
                            }`}>
                              {index === 0 ? (
                                <>
                                  <Trophy className="h-3 w-3 text-amber-400 mr-0.5" />
                                  <span>KAIRO REVIVAL MASTER</span>
                                </>
                              ) : (
                                'PRO BUILDER'
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-xs text-white/40">暂无 Builder 提交数据。</p>
                </div>
              )}
            </div>
          )}

          {/* 3. DORMANT GIANTS VIEW */}
          {activeSubTab === 'giants' && (
            <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 backdrop-blur-md overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-white/60 uppercase">DORMANT GIANTS (UNDERVALUED BEASTS)</span>
                <span className="text-[10px] text-white/40 font-mono">SORTED BY REVIVAL ROOM MULTIPLE</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                      <th className="py-3.5 px-6">排名</th>
                      <th className="py-3.5 px-4">代币</th>
                      <th className="py-3.5 px-4 hidden sm:table-cell">全称</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">历史顶峰市值 (Peak MC)</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">当前沙盒市值 (Current MC)</th>
                      <th className="py-3.5 px-4 text-right hidden sm:table-cell">持币地址数</th>
                      <th className="py-3.5 px-6 text-right">反弹空间 (Gaps)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {dormantGiants.map((cat, index) => {
                      const multiple = cat.token.originalPeakMc / cat.token.currentMc;
                      return (
                        <tr 
                          key={cat.id} 
                          onClick={() => onSelectCatalyst(cat.id)}
                          className="hover:bg-white/[0.015] transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-sm">
                            {index === 0 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-black font-black text-xs">1</span>
                            ) : index === 1 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-400 text-black font-black text-xs">2</span>
                            ) : index === 2 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-700 text-black font-black text-xs">3</span>
                            ) : (
                              <span className="pl-2 text-white/60">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-sm text-[#ffd285]">
                            ${cat.token.symbol}
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-white group-hover:text-[#ffd285] transition-colors hidden sm:table-cell">
                            {cat.token.name}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-white/80 hidden md:table-cell">
                            ${(cat.token.originalPeakMc / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-red-400 font-bold hidden md:table-cell">
                            ${(cat.token.currentMc / 1000).toFixed(1)}K
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-xs text-white/60 hidden sm:table-cell">
                            {cat.token.holdersCount.toLocaleString()} 位
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-sm font-black text-green-400 group-hover:underline">
                            {multiple.toFixed(0)}x 空间
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. COMEBACK HALL VIEW */}
          {activeSubTab === 'comeback' && (
            <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 backdrop-blur-md overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-green-500/5 to-transparent flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-white/60 uppercase">COMEBACK HALL OF SHINE</span>
                <span className="text-[10px] text-white/40 font-mono">RECOGNIZING ACTIVE COMER RESURRECTION</span>
              </div>

              {comebackHall.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                        <th className="py-3.5 px-6">逆袭指数</th>
                        <th className="py-3.5 px-4">代币</th>
                        <th className="py-3.5 px-4 hidden sm:table-cell">催化计划</th>
                        <th className="py-3.5 px-4 text-center hidden xs:table-cell">状态</th>
                        <th className="py-3.5 px-4 text-right">今日涨幅 (24H)</th>
                        <th className="py-3.5 px-6 text-right">逆袭能量 (Boost)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {comebackHall.map((cat, index) => (
                        <tr 
                          key={cat.id} 
                          onClick={() => onSelectCatalyst(cat.id)}
                          className="hover:bg-white/[0.015] transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6 font-mono font-bold">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3.5 w-3.5 text-[#ffd285] fill-current" />
                              <span className="text-white/90">GIANT_#{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-sm text-[#ffd285]">
                            ${cat.token.symbol}
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate text-xs font-semibold text-white group-hover:text-[#ffd285] transition-colors hidden sm:table-cell">
                            {cat.title}
                          </td>
                          <td className="py-4 px-4 text-center hidden xs:table-cell">
                            <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[9px] font-bold ${
                              cat.status === 'Completed'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {cat.status === 'Completed' ? (
                                <>
                                  <Award className="h-3 w-3 text-green-300 mr-0.5" />
                                  <span>复兴成功</span>
                                </>
                              ) : (
                                <>
                                  <Flame className="h-3 w-3 text-blue-300 mr-0.5 animate-pulse" />
                                  <span>深度投票</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-xs font-bold text-green-400">
                            +{cat.token.priceChange24h.toFixed(2)}%
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-sm font-black text-white">
                            {cat.momentum.toLocaleString()} Power
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Star className="h-8 w-8 text-white/20 mx-auto" />
                  <p className="mt-3 text-xs text-white/40">当前暂无成功完成复兴的项目。</p>
                  <p className="text-[10px] text-[#ffd285] mt-1 hover:underline cursor-pointer" onClick={() => setActiveTab('catalysts')}>
                    现在就去 Boost 催化剂以开启首个项目的复兴之路！
                  </p>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}

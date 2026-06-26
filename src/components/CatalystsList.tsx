import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Award, Clock, ArrowRight, Zap, Flame, Terminal, HelpCircle, Shield, Lock } from 'lucide-react';
import { Catalyst, CategoryType, CatalystStatus } from '../types';
import ShareButton from './ShareButton';

interface CatalystsListProps {
  catalysts: Catalyst[];
  userState: any;
  onSelectCatalyst: (id: string) => void;
  onBoostCatalyst: (id: string, amount: number) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

const CATEGORIES: { id: CategoryType | 'All'; label: string }[] = [
  { id: 'All', label: '全部领域' },
  { id: 'DeFi', label: 'DeFi 金融' },
  { id: 'Meme', label: 'Meme 模因' },
  { id: 'GameFi', label: 'GameFi 游戏' },
  { id: 'AI', label: 'AI 人工智能' },
  { id: 'SocialFi', label: 'SocialFi 社交' },
  { id: 'Infra', label: '基础设施' }
];

const STATUSES: { id: CatalystStatus | 'All'; label: string }[] = [
  { id: 'All', label: '全部状态' },
  { id: 'Active', label: '竞标中 (Active)' },
  { id: 'Voting', label: '投票期 (Voting)' },
  { id: 'Completed', label: '已完成 (Completed)' },
  { id: 'Upcoming', label: '即将开始' }
];

export default function CatalystsList({
  catalysts,
  userState,
  onSelectCatalyst,
  onBoostCatalyst,
  addNotification
}: CatalystsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<CatalystStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'momentum' | 'reward' | 'deadline' | 'bids'>('momentum');

  // Fast Boost on the list view
  const handleFastBoost = (e: React.MouseEvent, id: string, symbol: string) => {
    e.stopPropagation(); // Avoid triggering details modal
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请先连接您的 Web3 钱包才能注入 Boost 势能！', 'error');
      return;
    }
    
    onBoostCatalyst(id, 250);
    addNotification('一键 Boost 成功', `您成功向 $${symbol} 的催化任务注入了 250 Boost 能量！`, 'success');
  };

  // Filter & Sort logic
  const filteredCatalysts = catalysts
    .filter((cat) => {
      const matchesSearch = 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || cat.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || cat.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'momentum') return b.momentum - a.momentum;
      if (sortBy === 'reward') return b.rewardPool.usdValue - a.rewardPool.usdValue;
      if (sortBy === 'bids') return b.totalBids - a.totalBids;
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-6" id="catalysts-gallery">
      
      {/* Filters Dashboard */}
      <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md space-y-4">
        
        {/* Search & Sort Panel */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="catalyst-search"
              type="text"
              placeholder="搜索代币名称、催化剂任务描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#121622]/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-[#ffd285]/30 focus:bg-[#121622]/80"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center space-x-1 text-xs text-white/40">
              <SlidersHorizontal className="h-3 w-3" />
              <span>排序方式:</span>
            </span>
            <div className="flex rounded-xl border border-white/5 bg-[#121622]/40 p-[2px]">
              {(
                [
                  { id: 'momentum', label: 'Momentum (势能)' },
                  { id: 'reward', label: 'Reward Amount (奖池)' },
                  { id: 'deadline', label: 'Time Remaining (时间)' },
                  { id: 'bids', label: 'Bids (方案数量)' }
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  id={`sort-${option.id}`}
                  onClick={() => setSortBy(option.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortBy === option.id 
                      ? 'bg-[#ffd285]/10 text-[#ffd285]' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#ffd285] to-[#f52329]/90 text-black shadow-md shadow-[#f52329]/10'
                  : 'bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 overflow-x-auto scrollbar-none">
          {STATUSES.map((stat) => (
            <button
              key={stat.id}
              onClick={() => setSelectedStatus(stat.id)}
              className={`rounded-xl px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
                selectedStatus === stat.id
                  ? 'bg-[#ffd285]/15 border border-[#ffd285]/20 text-[#ffd285]'
                  : 'bg-transparent border border-white/5 text-white/40 hover:text-white/70'
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Catalysts Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCatalysts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalysts.map((cat) => {
              const multiple = cat.token.originalPeakMc / cat.token.currentMc;
              const hasBoosted = userState.boostedCatalysts.includes(cat.id);
              
              // Calculate remaining days (just mock difference based on hardcoded dates)
              const remainingDays = Math.max(1, Math.round((new Date(cat.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

              return (
                <motion.div
                  key={cat.id}
                  id={`catalyst-card-${cat.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectCatalyst(cat.id)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md cursor-pointer hover:border-[#ffd285]/20 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                >
                  {/* Subtle hover background glows */}
                  <div className="absolute -top-24 -right-24 h-40 w-40 rounded-full bg-[#f52329]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    {/* Card Header: Category & Token Emblem */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60 uppercase tracking-wide">
                          {cat.category}
                        </span>
                        {cat.isVerified && (
                          <span 
                            className="flex items-center space-x-0.5 rounded bg-green-500/10 px-2 py-0.5 text-[9px] font-black text-green-400 border border-green-500/10"
                            title="该项目已通过官方验证"
                          >
                            <Shield className="h-2.5 w-2.5 inline" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                        {cat.isEscrowed && (
                          <span 
                            className="flex items-center space-x-0.5 rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/10"
                            title="奖池资产已托管"
                          >
                            <Lock className="h-2.5 w-2.5 inline" />
                            <span>ESCROWED</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono text-xs text-white">
                        <span className="font-bold text-[#ffd285] group-hover:underline">${cat.token.symbol}</span>
                        <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-400">
                          {multiple.toFixed(0)}x 空间
                        </span>
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <h4 className="mt-4 text-sm font-bold text-white leading-snug group-hover:text-[#ffd285] transition-colors min-h-[40px] line-clamp-2">
                      {cat.title}
                    </h4>
                    <p className="mt-2 text-xs text-white/50 line-clamp-3 leading-relaxed min-h-[54px]">
                      {cat.description}
                    </p>

                    {/* Reward Pool Stat */}
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-[#ffd285]/5 to-[#f52329]/5 p-3.5 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs text-white/40">
                          <Award className="h-3.5 w-3.5 text-[#ffd285]" />
                          <span>复兴奖池</span>
                        </div>
                        <span className="text-[10px] text-white/40 font-semibold">EST. USD VALUE</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono text-sm font-extrabold text-white">
                          {cat.rewardPool.amount.toLocaleString()} <span className="text-[10px] text-white/60 font-semibold">{cat.rewardPool.tokenSymbol}</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-[#ffd285]">
                          ${cat.rewardPool.usdValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Indicators */}
                  <div className="mt-5 pt-3 border-t border-white/5">
                    
                    {/* Bids & Momentum */}
                    <div className="flex items-center justify-between text-xs font-mono mb-3.5">
                      <div className="flex items-center space-x-1 text-white/60">
                        <Terminal className="h-3.5 w-3.5 text-[#ffd285]" />
                        <span className="font-semibold text-white">{cat.totalBids}</span>
                        <span>方案投标</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Flame className="h-3.5 w-3.5 text-[#f52329]" />
                        <span className="font-bold text-white">{cat.momentum.toLocaleString()}</span>
                        <span className="text-white/40">Boost</span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleFastBoost(e, cat.id, cat.token.symbol)}
                        className={`flex-1 flex items-center justify-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                          hasBoosted
                            ? 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                            : 'bg-white/[0.02] border-white/5 text-white hover:bg-white/5 hover:border-white/10 active:scale-[0.98]'
                        }`}
                      >
                        <Zap className={`h-3.5 w-3.5 ${hasBoosted ? 'fill-current' : ''}`} />
                        <span>{hasBoosted ? '已注入' : '一键 Boost'}</span>
                      </button>

                      <ShareButton 
                        id={cat.id}
                        type="catalyst"
                        title={cat.title}
                        addNotification={addNotification}
                        variant="compact"
                      />

                      <div className="flex items-center justify-center rounded-xl bg-[#121622]/80 p-2 border border-white/5 group-hover:border-[#ffd285]/30 transition-all text-white/60 group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Deadline Pill */}
                    <div className="mt-3.5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-white/30" />
                        <span>剩余 {remainingDays} 天截止</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded ${
                        cat.status === 'Active' 
                          ? 'bg-green-500/10 text-green-400' 
                          : cat.status === 'Voting'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-white/5 text-white/50'
                      }`}>
                        {cat.status === 'Active' ? '正在投标' : cat.status === 'Voting' ? '正在投票' : cat.status === 'Completed' ? '已结束' : '即将开启'}
                      </span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/30 p-12 text-center" id="empty-catalysts">
            <Award className="h-10 w-10 text-white/20 mx-auto" />
            <h4 className="mt-4 text-sm font-bold text-white">未找到匹配的复兴催化剂</h4>
            <p className="mt-1 text-xs text-white/40">尝试更换搜索关键字、调整筛选领域或刷新过滤条件。</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

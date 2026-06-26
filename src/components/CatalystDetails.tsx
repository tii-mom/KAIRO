import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Award, Clock, Flame, ShieldAlert, Terminal, Globe, Github, Youtube, PlusCircle, CheckCircle2, User, Landmark, Sparkles, Shield, Lock, TrendingUp, ThumbsUp, ThumbsDown, Eye, Share2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { Catalyst, Bid } from '../types';
import ShareButton from './ShareButton';

interface CatalystDetailsProps {
  catalyst: Catalyst;
  bids: Bid[];
  onBack: () => void;
  userState: any;
  onSubmitBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status' | 'votes'>) => void;
  onBoostBid: (bidId: string) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

export default function CatalystDetails({
  catalyst,
  bids,
  onBack,
  userState,
  onSubmitBid,
  onBoostBid,
  addNotification
}: CatalystDetailsProps) {
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    demoUrl: '',
    githubUrl: '',
    videoUrl: '',
    requestedFunding: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Social Preview State
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);
  const [socialPreviewTab, setSocialPreviewTab] = useState<'twitter' | 'telegram'>('twitter');

  // Sentiment Polling State
  const [sentiment, setSentiment] = useState(() => {
    const hash = catalyst.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bullishPct = 65 + (hash % 25); // 65% to 90% bullish initial state
    const totalMockVotes = 85 + (hash % 50);
    const bullishVotes = Math.round(totalMockVotes * (bullishPct / 100));
    const bearishVotes = totalMockVotes - bullishVotes;
    return {
      bullish: bullishVotes,
      bearish: bearishVotes,
      userVoted: null as 'bullish' | 'bearish' | null
    };
  });

  // Recent Boosts Log State
  const [boostsLog, setBoostsLog] = useState<Array<{ id: string; alias: string; amount: number; time: string }>>([]);

  // Seed dynamic logs based on catalyst
  useEffect(() => {
    const seedNames = ['0x9aF...2d1', 'DegenKing.eth', '0x3E2...F4a', 'KairoBacker', 'vitalik.eth', '0x71C...3a2'];
    const baseLog = [];
    const hash = catalyst.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 4; i++) {
      const minutesAgo = (i + 1) * 15 + (hash % 10);
      const amount = [500, 1000, 250, 2500][(hash + i) % 4];
      baseLog.push({
        id: `seed-${catalyst.id}-${i}`,
        alias: seedNames[(hash + i) % seedNames.length],
        amount,
        time: `${minutesAgo}分钟前`
      });
    }
    setBoostsLog(baseLog);

    // Reset sentiment for new catalyst
    const bullishPct = 65 + (hash % 25);
    const totalMockVotes = 85 + (hash % 50);
    const bullishVotes = Math.round(totalMockVotes * (bullishPct / 100));
    const bearishVotes = totalMockVotes - bullishVotes;
    setSentiment({
      bullish: bullishVotes,
      bearish: bearishVotes,
      userVoted: null
    });
  }, [catalyst.id]);

  // Keep track of parent momentum to insert real-time user boosts
  const prevMomentumRef = useRef(catalyst.momentum);
  useEffect(() => {
    if (catalyst.momentum > prevMomentumRef.current) {
      const diff = catalyst.momentum - prevMomentumRef.current;
      
      // Append user boost log item
      setBoostsLog((prev) => [
        {
          id: `user-boost-${Date.now()}`,
          alias: userState?.walletAddress 
            ? `${userState.walletAddress.slice(0, 6)}...${userState.walletAddress.slice(-4)}` 
            : '匿名 Degen (你)',
          amount: diff,
          time: '刚刚'
        },
        ...prev
      ]);
    }
    prevMomentumRef.current = catalyst.momentum;
  }, [catalyst.momentum, userState?.walletAddress]);

  const handleSentimentVote = (type: 'bullish' | 'bearish') => {
    if (sentiment.userVoted === type) {
      addNotification('重复表态', '您已经为该方向投过票了！', 'info');
      return;
    }

    setSentiment(prev => {
      const isSwitching = prev.userVoted !== null;
      let newBullish = prev.bullish;
      let newBearish = prev.bearish;

      if (type === 'bullish') {
        newBullish += 1;
        if (isSwitching) newBearish -= 1;
      } else {
        newBearish += 1;
        if (isSwitching) newBullish -= 1;
      }

      return {
        bullish: newBullish,
        bearish: newBearish,
        userVoted: type
      };
    });

    addNotification(
      '表态成功', 
      `已记录您的情绪方向：${type === 'bullish' ? '极度看涨 (Bullish)' : '极度看跌 (Bearish)'}`, 
      'success'
    );
  };

  // Get bids for this specific catalyst
  const catalystBids = bids.filter((b) => b.catalystId === catalyst.id);
  const multiple = catalyst.token.originalPeakMc / catalyst.token.currentMc;
  const remainingDays = Math.max(1, Math.round((new Date(catalyst.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = '请输入提案名称';
    if (!formData.description.trim() || formData.description.length < 20) {
      errors.description = '请输入至少20个字的详细设计方案说明';
    }
    
    // URL patterns
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!formData.demoUrl.trim()) {
      errors.demoUrl = '请输入 Demo 部署预览地址';
    } else if (!urlPattern.test(formData.demoUrl)) {
      errors.demoUrl = '请输入有效的网址 (e.g. https://demo.example.com)';
    }

    if (!formData.githubUrl.trim()) {
      errors.githubUrl = '请输入 GitHub 仓库地址';
    } else if (!urlPattern.test(formData.githubUrl)) {
      errors.githubUrl = '请输入有效的 GitHub URL';
    }

    if (formData.videoUrl && !urlPattern.test(formData.videoUrl)) {
      errors.videoUrl = '请输入有效的视频预览 URL';
    }

    if (!formData.requestedFunding.trim()) {
      errors.requestedFunding = '请输入申请的代币资助额度';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请在右上角连接钱包以提交开发竞标提案！', 'error');
      return;
    }

    if (!validateForm()) {
      addNotification('输入验证失败', '请检查并填写所有必需的提案字段。', 'error');
      return;
    }

    onSubmitBid({
      catalystId: catalyst.id,
      builderName: userState.walletName || '神秘 Web3 Builder',
      builderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
      title: formData.title,
      description: formData.description,
      demoUrl: formData.demoUrl,
      githubUrl: formData.githubUrl,
      videoUrl: formData.videoUrl || undefined,
      requestedFunding: `${parseFloat(formData.requestedFunding).toLocaleString()} ${catalyst.rewardPool.tokenSymbol}`
    });

    addNotification('方案竞标成功', '您的复兴催化方案已成功提交至智能合约！', 'success');
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      demoUrl: '',
      githubUrl: '',
      videoUrl: '',
      requestedFunding: ''
    });
    setIsSubmitFormOpen(false);
  };

  const handleBoostProposal = (bidId: string, builderName: string) => {
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请先连接您的 Web3 钱包才能进行投票助力！', 'error');
      return;
    }

    onBoostBid(bidId);
    addNotification('投票助力成功', `成功为 ${builderName} 的提案追加 1 次 Boost 投票！`, 'success');
  };

  return (
    <div className="space-y-6" id="catalyst-details-view">
      
      {/* Back & Navigation Header */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-[#121622] hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>返回催化列表</span>
      </button>

      {/* Main Grid: Info Cards (Left) & Bids + Submit (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Catalyst Info Deep Dive (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Specs Card */}
          <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#ffd285]/5 blur-3xl" />
            
            <div className="z-10 relative">
              <div className="flex flex-col gap-1.5 pb-2.5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60 uppercase tracking-wide">
                    {catalyst.category}
                  </span>
                  <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-mono text-green-400 font-bold">
                    {catalyst.status}
                  </span>
                </div>
                
                {/* Verified / Escrowed Badges */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {catalyst.isVerified && (
                    <span className="flex items-center space-x-1 rounded bg-green-500/10 px-2 py-0.5 text-[9px] font-black text-green-400 border border-green-500/10">
                      <Shield className="h-2.5 w-2.5" />
                      <span>OFFICIAL VERIFIED</span>
                    </span>
                  )}
                  {catalyst.isEscrowed && (
                    <span className="flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/10">
                      <Lock className="h-2.5 w-2.5" />
                      <span>ESCROWED POOL</span>
                    </span>
                  )}
                </div>
              </div>

              <h2 className="mt-4 text-base font-extrabold text-white leading-snug">
                {catalyst.title}
              </h2>

              <p className="mt-3 text-xs text-white/60 leading-relaxed pb-4">
                {catalyst.description}
              </p>

              {/* Share Component */}
              <div className="border-t border-b border-white/5 py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase block">分享此催化计划</span>
                  <button
                    id="open-social-preview-btn"
                    onClick={() => setIsSocialPreviewOpen(true)}
                    className="flex items-center space-x-1 rounded bg-[#ffd285]/10 px-2 py-0.5 text-[9px] font-bold text-[#ffd285] border border-[#ffd285]/20 hover:bg-[#ffd285]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye className="h-2.5 w-2.5" />
                    <span>社交分享预览</span>
                  </button>
                </div>
                <ShareButton 
                  id={catalyst.id} 
                  type="catalyst" 
                  title={catalyst.title} 
                  addNotification={addNotification} 
                  variant="full" 
                />
              </div>

              {/* Reward Pool Summary */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase">催化悬赏奖池</span>
                <div className="rounded-xl bg-gradient-to-br from-[#ffd285]/5 to-[#f52329]/5 p-4 border border-[#ffd285]/10">
                  <div className="text-[10px] font-mono text-white/40">TOTAL REWARD POOL</div>
                  <div className="text-lg font-mono font-black text-[#ffd285] mt-1">
                    {catalyst.rewardPool.amount.toLocaleString()} <span className="text-xs text-white/80">{catalyst.rewardPool.tokenSymbol}</span>
                  </div>
                  <div className="text-xs font-mono text-white/50 mt-0.5">
                    约合价值：${catalyst.rewardPool.usdValue.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Status Stats Block */}
              <div className="mt-5 grid grid-cols-2 gap-3.5 pt-4 border-t border-white/5">
                <div className="rounded-xl bg-white/[0.015] p-3 border border-white/5">
                  <div className="flex items-center space-x-1 text-[10px] text-white/40">
                    <Flame className="h-3 w-3 text-[#f52329]" />
                    <span>社区 Boost</span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-black text-white">
                    {catalyst.momentum.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.015] p-3 border border-white/5">
                  <div className="flex items-center space-x-1 text-[10px] text-white/40">
                    <Clock className="h-3 w-3 text-white/40" />
                    <span>截止倒计时</span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-black text-white">
                    {remainingDays} 天
                  </div>
                </div>
              </div>

              {/* Momentum 7-Day Growth Chart (Recharts) */}
              <div className="mt-4 rounded-xl bg-white/[0.015] p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-[#ffd285]" />
                    <span>7日 Boost 势能成长趋势</span>
                  </span>
                  <span className="text-[9px] font-mono text-green-400 font-bold bg-green-400/10 px-1 py-0.5 rounded">
                    +{Math.round(((catalyst.momentum - Math.round(catalyst.momentum * 0.42)) / Math.round(catalyst.momentum * 0.42)) * 100)}%
                  </span>
                </div>
                <div className="h-28 w-full mt-2" id="momentum-growth-chart">
                  {(() => {
                    const data = [
                      { name: '06-20', momentum: Math.round(catalyst.momentum * 0.42) },
                      { name: '06-21', momentum: Math.round(catalyst.momentum * 0.51) },
                      { name: '06-22', momentum: Math.round(catalyst.momentum * 0.63) },
                      { name: '06-23', momentum: Math.round(catalyst.momentum * 0.68) },
                      { name: '06-24', momentum: Math.round(catalyst.momentum * 0.81) },
                      { name: '06-25', momentum: Math.round(catalyst.momentum * 0.91) },
                      { name: '06-26', momentum: catalyst.momentum },
                    ];
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffd285" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#f52329" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <ChartTooltip 
                            contentStyle={{ backgroundColor: '#0c0e14', borderColor: '#ffd28520', borderRadius: '8px' }}
                            labelClassName="text-white/40 text-[9px] font-mono"
                            itemStyle={{ color: '#ffd285', fontSize: '10px', fontFamily: 'monospace' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="momentum" 
                            stroke="#ffd285" 
                            strokeWidth={1.5} 
                            fillOpacity={1} 
                            fill="url(#momentumGradient)" 
                          />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>

              {/* Recent Boosts Activity Log Section */}
              <div className="mt-4 rounded-xl bg-white/[0.015] p-4 border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase block">最近 Boost 助力流水</span>
                  <span className="text-[9px] font-mono text-white/30">ACTIVITY LOG</span>
                </div>
                <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/5" id="recent-boosts-activity-log">
                  {boostsLog.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-[11px] border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span className="font-mono text-white/80 font-bold">{log.alias}</span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-[#ffd285] font-black">+{log.amount.toLocaleString()}</span>
                        <span className="text-white/30 text-[9px]">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Polling Widget */}
              <div className="mt-4 rounded-xl bg-white/[0.015] p-4 border border-white/5 space-y-3" id="sentiment-polling-widget">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase flex items-center space-x-1">
                    <ThumbsUp className="h-3.5 w-3.5 text-green-400" />
                    <span>市场对当前复兴催化情绪</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#ffd285] bg-[#ffd285]/10 px-1.5 py-0.5 rounded font-black">
                    {(() => {
                      const total = sentiment.bullish + sentiment.bearish;
                      return total > 0 ? ((sentiment.bullish / total) * 100).toFixed(0) : '0';
                    })()}% BULLISH
                  </span>
                </div>

                {/* Sentiment Gauge Slider Indicator */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between text-[10px] font-mono font-bold">
                    <span className="text-green-400">Bullish ({sentiment.bullish})</span>
                    <span className="text-red-400">Bearish ({sentiment.bearish})</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-white/5">
                    <div 
                      style={{ width: `${(sentiment.bullish / (sentiment.bullish + sentiment.bearish)) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                    />
                    <div 
                      style={{ width: `${(sentiment.bearish / (sentiment.bullish + sentiment.bearish)) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSentimentVote('bullish')}
                    className={`flex items-center justify-center space-x-1 rounded-xl py-2 text-xs font-bold transition-all border cursor-pointer ${
                      sentiment.userVoted === 'bullish'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-400'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>看多 Bullish</span>
                  </button>
                  <button
                    onClick={() => handleSentimentVote('bearish')}
                    className={`flex items-center justify-center space-x-1 rounded-xl py-2 text-xs font-bold transition-all border cursor-pointer ${
                      sentiment.userVoted === 'bearish'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        : 'bg-rose-500/5 border-rose-500/10 text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400'
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>看空 Bearish</span>
                  </button>
                </div>
              </div>

              {/* Token Info Pill */}
              <div className="mt-5 rounded-xl bg-white/[0.015] p-4 border border-white/5 font-mono text-xs text-white/60 space-y-2">
                <div className="flex justify-between">
                  <span>休眠代币:</span>
                  <strong className="text-white">${catalyst.token.symbol}</strong>
                </div>
                <div className="flex justify-between">
                  <span>当前持币数:</span>
                  <span className="text-white">{catalyst.token.holdersCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>顶峰市值:</span>
                  <span className="text-white">${(catalyst.token.originalPeakMc / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>当前市值:</span>
                  <span className="text-white">${(catalyst.token.currentMc / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold">
                  <span>复兴空间:</span>
                  <span>{multiple.toFixed(0)}x</span>
                </div>
              </div>

            </div>
          </div>

          {/* Project Backstory Card */}
          <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold tracking-wider text-[#ffd285] uppercase">项目历史背景 (Background)</h3>
            <p className="mt-3 text-xs text-white/60 leading-relaxed font-sans">
              {catalyst.background}
            </p>
          </div>

        </div>

        {/* Right Columns: Developer Bids (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Target/Requirements Card */}
          <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Terminal className="h-4.5 w-4.5 text-[#ffd285]" />
              <h3 className="text-sm font-bold text-white">明确开发目标与交付物 (Requirements)</h3>
            </div>
            
            <ul className="mt-4 space-y-3">
              {catalyst.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs text-white/70 leading-relaxed">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ffd285]/10 text-[#ffd285] text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submissions Header / Form Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Builder 方案提案竞标 ({catalystBids.length})</h3>
              <p className="text-[10px] text-white/40 mt-0.5">社区用户可用 Boost 为您看好的产品提案进行链上投票，胜出者将获得此催化剂奖池</p>
            </div>

            <button
              id="open-bid-form-btn"
              onClick={() => setIsSubmitFormOpen(!isSubmitFormOpen)}
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#ffd285]/10 border border-[#ffd285]/20 px-4 py-2.5 text-xs font-bold text-[#ffd285] hover:bg-[#ffd285]/20 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isSubmitFormOpen ? '关闭提案表单' : '我要提交提案'}</span>
            </button>
          </div>

          {/* Proposal Submission Form Component */}
          <AnimatePresence>
            {isSubmitFormOpen && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl border border-[#ffd285]/20 bg-[#121622]/40 p-6 backdrop-blur-md"
                id="bid-submission-form-panel"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-[#ffd285]" />
                    <h4 className="text-xs font-bold tracking-wider text-white uppercase">发布新催化投标方案</h4>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">BUILDER PORTAL</span>
                </div>

                {!userState.walletAddress && (
                  <div className="mt-4 flex items-center space-x-3 rounded-xl border border-red-500/10 bg-red-500/5 p-3.5 text-xs text-red-400">
                    <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
                    <p>您需要连接钱包。请在页眉点击 [连接钱包] 激活 Web3 环境以验证您的身份。</p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70">方案名称 *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. 1-Click Zap TG 聚合质押应用"
                        className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30"
                      />
                      {formErrors.title && <p className="text-[10px] text-red-400 font-medium">{formErrors.title}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70">申请代币资助额度 *</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="requestedFunding"
                          value={formData.requestedFunding}
                          onChange={handleInputChange}
                          placeholder={`最高 ${catalyst.rewardPool.amount.toLocaleString()}`}
                          className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 pl-3.5 pr-12 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-white/40">
                          {catalyst.rewardPool.tokenSymbol}
                        </span>
                      </div>
                      {formErrors.requestedFunding && <p className="text-[10px] text-red-400 font-medium">{formErrors.requestedFunding}</p>}
                    </div>
                  </div>

                  {/* Desc */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/70">技术设计与产品方案说明 * (最少 20 字)</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="详细说明您的产品亮点、技术框架、如何盘活该代币持有者，以及如何确保代码安全可靠。"
                      className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30 resize-none"
                    />
                    {formErrors.description && <p className="text-[10px] text-red-400 font-medium">{formErrors.description}</p>}
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70">Demo 部署地址 *</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input
                          type="text"
                          name="demoUrl"
                          value={formData.demoUrl}
                          onChange={handleInputChange}
                          placeholder="https://my-demo.kairo.dev"
                          className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30"
                        />
                      </div>
                      {formErrors.demoUrl && <p className="text-[10px] text-red-400 font-medium">{formErrors.demoUrl}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70">GitHub 仓库地址 *</label>
                      <div className="relative">
                        <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input
                          type="text"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleInputChange}
                          placeholder="https://github.com/myrepo"
                          className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30"
                        />
                      </div>
                      {formErrors.githubUrl && <p className="text-[10px] text-red-400 font-medium">{formErrors.githubUrl}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70">讲解/演示视频 URL (选填)</label>
                      <div className="relative">
                        <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input
                          type="text"
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/..."
                          className="w-full rounded-xl border border-white/5 bg-[#0c0e14]/50 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#ffd285]/30"
                        />
                      </div>
                      {formErrors.videoUrl && <p className="text-[10px] text-red-400 font-medium">{formErrors.videoUrl}</p>}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="submit-bid-form-btn"
                      type="submit"
                      disabled={!userState.walletAddress}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-[#ffd285] to-[#f52329] py-3 text-xs font-bold text-black shadow-lg transition-all hover:opacity-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>签署并上传方案至 KAIRO 催化合约</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Proposals list */}
          <div className="space-y-4" id="bids-list">
            {catalystBids.length > 0 ? (
              catalystBids
                .sort((a, b) => b.votes - a.votes)
                .map((bid) => {
                  const hasVoted = userState.boostedBids.includes(bid.id);
                  return (
                    <div
                      key={bid.id}
                      id={`bid-card-${bid.id}`}
                      className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md hover:border-white/10 transition-colors"
                    >
                      {/* Bid Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={bid.builderAvatar}
                            alt={bid.builderName}
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center space-x-1">
                              <span>{bid.builderName}</span>
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-white/50">BUILDER</span>
                            </div>
                            <div className="text-[10px] text-white/40 font-mono mt-0.5">
                              提交于 {bid.createdAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="rounded-md bg-[#ffd285]/10 border border-[#ffd285]/10 px-2 py-0.5 text-[10px] font-mono text-[#ffd285]">
                            申请: {bid.requestedFunding}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            bid.status === 'Winner' 
                              ? 'bg-amber-500/20 text-amber-300' 
                              : bid.status === 'Approved'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-white/5 text-white/40'
                          }`}>
                            {bid.status === 'Winner' ? (
                              <span className="flex items-center space-x-1">
                                <Award className="h-3 w-3 text-amber-300" />
                                <span>WINNER 胜出方案</span>
                              </span>
                            ) : bid.status === 'Approved' ? (
                              '已收录'
                            ) : (
                              '评估中'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Bid content */}
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-extrabold text-white">{bid.title}</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-sans">{bid.description}</p>
                      </div>

                      {/* Links and upvote actions */}
                      <div className="mt-5 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={bid.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 rounded bg-white/5 px-2.5 py-1.5 font-semibold text-white/80 hover:bg-white/10 transition-colors"
                          >
                            <Globe className="h-3 w-3 text-[#ffd285]" />
                            <span>Demo 演示</span>
                          </a>

                          <a
                            href={bid.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 rounded bg-white/5 px-2.5 py-1.5 font-semibold text-white/80 hover:bg-white/10 transition-colors"
                          >
                            <Github className="h-3 w-3" />
                            <span>开源代码</span>
                          </a>

                          {bid.videoUrl && (
                            <a
                              href={bid.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 rounded bg-white/5 px-2.5 py-1.5 font-semibold text-white/80 hover:bg-white/10 transition-colors"
                            >
                              <Youtube className="h-3 w-3 text-red-400" />
                              <span>讲解视频</span>
                            </a>
                          )}
                        </div>

                        {/* Boost Vote Trigger */}
                        <div className="flex items-center space-x-2.5">
                          <div className="flex flex-col items-end font-mono text-xs">
                            <span className="text-white/40 text-[9px] uppercase font-bold">方案积分</span>
                            <span className="font-extrabold text-white flex items-center space-x-1">
                              <Flame className="h-3 w-3 text-[#f52329]" />
                              <span>{bid.votes} Votes</span>
                            </span>
                          </div>

                          <ShareButton 
                            id={bid.id}
                            type="builder"
                            title={bid.title}
                            addNotification={addNotification}
                            variant="compact"
                          />

                          <button
                            onClick={() => handleBoostProposal(bid.id, bid.builderName)}
                            className={`flex items-center space-x-1 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                              hasVoted
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-[#ffd285]/10 border border-[#ffd285]/15 text-[#ffd285] hover:bg-[#ffd285]/20'
                            }`}
                          >
                            <span>{hasVoted ? '已追加投票' : '投他一票 Boost'}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/20 p-10 text-center" id="empty-bids">
                <Terminal className="h-8 w-8 text-white/20 mx-auto" />
                <h4 className="mt-4 text-xs font-bold text-white">该催化任务尚无 Builder 方案竞标</h4>
                <p className="mt-1 text-[11px] text-white/40">点击右上角 “我要提交提案” 抢占先机，获取复兴奖池！</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Social Preview Modal */}
      <AnimatePresence>
        {isSocialPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsSocialPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0e14] p-6 shadow-2xl"
              id="social-preview-modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-[#ffd285]" />
                    <span>自动生成的 Open-Graph 社交卡片预览</span>
                  </h3>
                  <p className="text-[10px] text-white/40 mt-0.5">当此催化剂计划在 X (Twitter) 或 Telegram 上被分享时的真实外观</p>
                </div>
                <button
                  onClick={() => setIsSocialPreviewOpen(false)}
                  className="rounded-full bg-white/5 p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex space-x-2 mt-4 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setSocialPreviewTab('twitter')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    socialPreviewTab === 'twitter'
                      ? 'bg-white/10 text-white shadow-md'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {/* Twitter / X custom SVG */}
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter) Card</span>
                </button>
                <button
                  onClick={() => setSocialPreviewTab('telegram')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    socialPreviewTab === 'telegram'
                      ? 'bg-white/10 text-white shadow-md'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {/* Telegram custom SVG */}
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.1.02-1.62 1.03-4.57 3.02-.43.3-.82.45-1.18.44-.39-.01-1.14-.22-1.7-.4-.69-.22-1.24-.34-1.19-.72.03-.2.3-.41.82-.62 3.2-1.39 5.34-2.31 6.42-2.76 3.06-1.28 3.7-1.5 4.11-1.5.09 0 .3.02.43.13.11.09.14.22.15.31l-.01.1z"/>
                  </svg>
                  <span>Telegram Preview</span>
                </button>
              </div>

              {/* Feed Preview Container */}
              <div className="mt-5 rounded-2xl bg-[#07090e] p-5 border border-white/5">
                {socialPreviewTab === 'twitter' ? (
                  /* Twitter Post Layout */
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd285] to-[#f52329] text-black font-black text-xs">
                        K
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-white flex items-center space-x-1">
                          <span>Kairo Revival Protocol</span>
                          <span className="text-blue-400">✓</span>
                        </div>
                        <div className="text-[9px] text-white/40">@kairo_protocol · 刚刚</div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-white/90 leading-relaxed font-sans">
                      <span className="text-[#ffd285] font-semibold">[代币复兴催化任务启动] </span>{catalyst.title}！<br />
                      [奖池分配] 当前赏金池已达 <span className="text-[#ffd285] font-mono font-bold">{catalyst.rewardPool.amount.toLocaleString()} {catalyst.rewardPool.tokenSymbol}</span> (约合 ${catalyst.rewardPool.usdValue.toLocaleString()} USD)。社区 Boost 势能已累积至 <span className="text-amber-400 font-bold">{catalyst.momentum}</span>，诚邀全球 Web3 Builder 参与方案竞标！<br />
                      <span className="text-blue-400">#KairoHub #Web3Revival #{catalyst.token.symbol}</span>
                    </p>

                    {/* Auto-Generated Card Image (Rendered via HTML/SVG) */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 aspect-[1.91/1] bg-gradient-to-br from-[#121622] via-[#07090e] to-[#121622] flex flex-col justify-between p-5 shadow-inner">
                      {/* Cyber Wireframe Background */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#f52329]/5 blur-3xl" />
                      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#ffd285]/5 blur-3xl" />

                      {/* Card Top */}
                      <div className="z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#ffd285] to-[#f52329] flex items-center justify-center text-[10px] text-black font-black font-mono">K</span>
                          <span className="text-[9px] font-mono font-bold tracking-widest text-white/60">KAIRO PLATFORM</span>
                        </div>
                        <span className="rounded bg-green-500/10 px-2 py-0.5 text-[8px] font-mono font-bold text-green-400 border border-green-500/20">
                          ACTIVE RECOVERY CHALLENGE
                        </span>
                      </div>

                      {/* Card Center Info */}
                      <div className="z-10 space-y-1 mt-2">
                        <span className="text-[9px] font-bold text-[#ffd285] tracking-wider uppercase bg-[#ffd285]/10 px-1.5 py-0.5 rounded">
                          {catalyst.category}
                        </span>
                        <h4 className="text-sm font-black text-white leading-snug tracking-tight max-w-md mt-1">
                          {catalyst.title}
                        </h4>
                      </div>

                      {/* Card Stats Bottom */}
                      <div className="z-10 grid grid-cols-3 gap-2.5 border-t border-white/5 pt-3 mt-2">
                        <div>
                          <div className="text-[7px] text-white/40 font-mono">REWARD POOL</div>
                          <div className="text-xs font-mono font-bold text-[#ffd285] mt-0.5">
                            {catalyst.rewardPool.amount.toLocaleString()} <span className="text-[8px]">{catalyst.rewardPool.tokenSymbol}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[7px] text-white/40 font-mono">BOOST MOMENTUM</div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5 flex items-center space-x-0.5">
                            <Flame className="h-3 w-3 text-[#ffd285]" />
                            <span>{catalyst.momentum.toLocaleString()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[7px] text-white/40 font-mono">ESTIMATED SPACE</div>
                          <div className="text-xs font-mono font-bold text-green-400 mt-0.5 flex items-center space-x-0.5">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span>{multiple.toFixed(0)}x PEAK</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/30 font-mono">
                      Card: kairo.web3/catalyst/{catalyst.id}
                    </div>
                  </div>
                ) : (
                  /* Telegram Message Bubble Layout */
                  <div className="flex items-start space-x-2.5 max-w-lg">
                    {/* Mock TG User Avatar */}
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                      TG
                    </div>
                    
                    {/* Chat Bubble */}
                    <div className="bg-[#182533] p-3.5 rounded-2xl rounded-tl-none border border-white/5 space-y-2">
                      <div className="text-[11px] text-[#4ea4f6] font-bold">Kairo Announcement Channel</div>
                      <p className="text-[11px] text-white/90 leading-relaxed font-sans">
                        我们在 Kairo Hub 发现了一个极其值得关注的复兴催化任务！开发完成后可激活 ${catalyst.token.symbol} 的海量代币势能。来看看：
                      </p>
                      
                      {/* TG Link Rich Preview Block */}
                      <div className="border-l-2 border-[#4ea4f6] pl-2.5 py-0.5 space-y-2 bg-[#121622]/40 rounded-r-lg">
                        <div className="text-[11px] text-white font-black hover:underline cursor-pointer">
                          Kairo Hub | {catalyst.title}
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed font-sans">
                          代币复兴催化剂计划：让休眠的 Web3 协议重新繁荣。开发任务已发布，总悬赏 {catalyst.rewardPool.amount.toLocaleString()} {catalyst.rewardPool.tokenSymbol} 币，欢迎全球 Builder 提交开发竞标提案。
                        </p>
                        
                        {/* Telegram Embedded Image */}
                        <div className="relative overflow-hidden rounded-lg border border-white/10 aspect-[1.91/1] bg-gradient-to-br from-[#121622] to-[#07090e] p-3.5 flex flex-col justify-between">
                          <div className="text-[8px] font-mono text-[#ffd285] font-black tracking-wider bg-[#ffd285]/10 px-1.5 py-0.5 rounded self-start">
                            {catalyst.category}
                          </div>
                          
                          <div className="my-1.5">
                            <h4 className="text-[11px] font-extrabold text-white leading-tight">
                              {catalyst.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                            <span className="text-[9px] font-mono text-[#ffd285]">
                              Pool: {catalyst.rewardPool.amount.toLocaleString()} {catalyst.rewardPool.tokenSymbol}
                            </span>
                            <span className="text-[9px] font-mono text-green-400">
                              Revival: {multiple.toFixed(0)}x Peak
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsSocialPreviewOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  关闭预览
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://kairo.web3/catalyst/${catalyst.id}`);
                    addNotification('复制成功', '催化计划分享链接已复制到剪贴板！', 'success');
                    setIsSocialPreviewOpen(false);
                  }}
                  className="rounded-xl bg-[#ffd285] py-2.5 text-xs font-bold text-black hover:bg-white transition-colors cursor-pointer"
                >
                  复制分享链接
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

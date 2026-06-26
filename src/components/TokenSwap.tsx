import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Info, Settings, AlertCircle, CheckCircle, ExternalLink, Zap, Flame, TrendingUp, TrendingDown, ArrowRight, Layers, Lock } from 'lucide-react';
import { ProjectToken, UserState, SwapTx } from '../types';

interface TokenSwapProps {
  tokens: ProjectToken[];
  userState: UserState;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  onPerformSwap: (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => void;
  swapHistory: SwapTx[];
}

const SUPPORTED_ASSETS = [
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'SOL', name: 'Solana', decimals: 9 },
  { symbol: 'KAIRO', name: 'KAIRO Utility', decimals: 18 }
];

export default function TokenSwap({
  tokens,
  userState,
  addNotification,
  onPerformSwap,
  swapHistory
}: TokenSwapProps) {
  const [fromAsset, setFromAsset] = useState('ETH');
  const [toAsset, setToAsset] = useState(tokens[0]?.symbol || 'DORM');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState<number>(1.0); // Slippage tolerance (%)
  const [lastTx, setLastTx] = useState<SwapTx | null>(null);
  const [activeSwapTab, setActiveSwapTab] = useState<'swap' | 'book' | 'history'>('swap');

  // Exchange rate logic
  const selectedToToken = tokens.find(t => t.symbol === toAsset) || tokens[0];
  const toTokenPrice = selectedToToken?.priceHistory[selectedToToken.priceHistory.length - 1]?.price || 0.001;

  // Let's mock a fixed base rate for KAIRO or ETH
  const fromPrice = fromAsset === 'ETH' ? 3500 : fromAsset === 'SOL' ? 160 : 0.05; // USD values
  const rate = fromPrice / toTokenPrice; // how many dormant tokens per 1 unit of from asset

  // Live Wall Street Orderbook & Time & Sales states
  const [orderBook, setOrderBook] = useState<{
    bids: { price: number; size: number; total: number }[];
    asks: { price: number; size: number; total: number }[];
  }>({ bids: [], asks: [] });

  const [liveTrades, setLiveTrades] = useState<{
    time: string;
    type: 'BUY' | 'SELL';
    size: number;
    price: number;
  }[]>([]);

  // Initialize and tick live orderbook + trades
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = toTokenPrice;
      const bidsList = [];
      const asksList = [];
      
      let bidAccum = 0;
      let askAccum = 0;

      for (let i = 1; i <= 6; i++) {
        const askPrice = basePrice * (1 + (i * 0.0012) + (Math.random() * 0.0004));
        const askSize = Math.floor(Math.random() * 80000 + 5000);
        askAccum += askSize;
        asksList.push({ price: askPrice, size: askSize, total: askAccum });

        const bidPrice = basePrice * (1 - (i * 0.0012) - (Math.random() * 0.0004));
        const bidSize = Math.floor(Math.random() * 95000 + 4000);
        bidAccum += bidSize;
        bidsList.push({ price: bidPrice, size: bidSize, total: bidAccum });
      }

      return {
        bids: bidsList,
        asks: asksList.reverse()
      };
    };

    setOrderBook(generateOrderBook());

    const initialTrades = Array.from({ length: 5 }, (_, idx) => {
      const isBuy = Math.random() > 0.45;
      const deviation = (Math.random() - 0.5) * 0.004;
      const tradePrice = toTokenPrice * (1 + deviation);
      const time = new Date(Date.now() - idx * 25000).toLocaleTimeString('zh-CN', { hour12: false });
      return {
        time,
        type: isBuy ? 'BUY' as const : 'SELL' as const,
        size: Math.floor(Math.random() * 50000 + 1000),
        price: tradePrice
      };
    });
    setLiveTrades(initialTrades);
  }, [toAsset, toTokenPrice]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrderBook(prev => {
        const updateSize = (list: typeof prev.bids) => {
          let accum = 0;
          return list.map(item => {
            const sizeChange = (Math.random() - 0.5) * item.size * 0.15;
            const newSize = Math.max(1000, Math.floor(item.size + sizeChange));
            accum += newSize;
            return { ...item, size: newSize, total: accum };
          });
        };
        return {
          asks: updateSize([...prev.asks].reverse()).reverse(),
          bids: updateSize(prev.bids)
        };
      });

      const isBuy = Math.random() > 0.48;
      const deviation = (Math.random() - 0.5) * 0.002;
      const tradePrice = toTokenPrice * (1 + deviation);
      const newTrade = {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type: isBuy ? 'BUY' as const : 'SELL' as const,
        size: Math.floor(Math.random() * 120000 + 500),
        price: tradePrice
      };

      setLiveTrades(prev => [newTrade, ...prev.slice(0, 5)]);
    }, 2800);

    return () => clearInterval(timer);
  }, [toTokenPrice]);

  // Calculate swap math
  const rawToAmount = fromAmount ? parseFloat(fromAmount) * rate : 0;
  // Deduct 5% mock burn on-chain
  const burnAmount = rawToAmount * 0.05;
  const toAmount = rawToAmount - burnAmount;

  // Price impact simulation (larger trades have exponential price impact)
  const usdValue = fromAmount ? parseFloat(fromAmount) * fromPrice : 0;
  const priceImpact = usdValue > 0 ? Math.min(15, parseFloat((usdValue / 2000).toFixed(2))) : 0;

  const handleMaxClick = () => {
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请先连接您的钱包以查询实时资产余额！', 'error');
      return;
    }
    const balance = fromAsset === 'ETH' ? userState.balanceEth : fromAsset === 'SOL' ? userState.balanceSol : userState.balanceKairo;
    // Leave a small gas headroom for ETH/SOL
    const safeMax = fromAsset === 'KAIRO' ? balance : Math.max(0, balance - (fromAsset === 'ETH' ? 0.005 : 0.01));
    setFromAmount(safeMax > 0 ? safeMax.toFixed(5) : '0');
  };

  const handleSwapAssets = () => {
    // Reverse from & to is only possible if user swaps back, but for simplicity, we keep swap one-way (Assets -> Dormant Coins)
    addNotification('操作提示', '平台复兴引擎仅支持单向买入及销毁休眠代币，暂不开放提取出池功能。', 'info');
  };

  const executeSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请在右上角连接钱包以启动 AMM 兑换！', 'error');
      return;
    }

    const inputVal = parseFloat(fromAmount);
    if (!fromAmount || isNaN(inputVal) || inputVal <= 0) {
      addNotification('输入无效', '请输入大于零的有效交易数额。', 'error');
      return;
    }

    // Check balance
    const balance = fromAsset === 'ETH' ? userState.balanceEth : fromAsset === 'SOL' ? userState.balanceSol : userState.balanceKairo;
    if (inputVal > balance) {
      addNotification('余额不足', `您持有的 ${fromAsset} 余额不足，无法完成本次交易。`, 'error');
      return;
    }

    // Success: Perform swap state modifications
    onPerformSwap(fromAsset, toAsset, inputVal, toAmount);
    
    // Generate a beautiful mock receipt
    const txHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const receipt: SwapTx = {
      id: `tx-${Date.now()}`,
      fromSymbol: fromAsset,
      toSymbol: toAsset,
      fromAmount: inputVal,
      toAmount: toAmount,
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      txHash: txHash
    };
    
    setLastTx(receipt);
    setFromAmount('');
    addNotification('智能合约调用成功', `已成功将 ${inputVal} ${fromAsset} 兑换并燃烧至 $${toAsset}！`, 'success');
  };

  return (
    <div id="swap-interface" className="space-y-4">
      {/* Mobile-only tab switcher for Swap section */}
      <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 lg:hidden">
        {(['swap', 'book', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSwapTab(tab)}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              activeSwapTab === tab 
                ? 'bg-gradient-to-r from-[#ffd285] to-[#f52329] text-black shadow-md' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'swap' ? '闪兑交易' : tab === 'book' ? '实时盘口' : '凭证/历史'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
        {/* Swap Panel (Left 4 Columns) */}
        <div className={`lg:col-span-4 rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${
          activeSwapTab === 'swap' ? 'flex' : 'hidden lg:flex'
        }`}>
        {/* Neon light borders */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#f52329]/5 blur-[80px]" />
        
        <div className="z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-[#ffd285]" />
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">KAIRO 极速兑换与销毁 (Swap & Burn)</h3>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsSlippageOpen(!isSlippageOpen)}
                className="text-white/40 hover:text-white transition-colors"
                id="swap-settings-btn"
              >
                <Settings className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isSlippageOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSlippageOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0c0e14] p-3.5 shadow-xl z-20 font-sans"
                    >
                      <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block mb-2">
                        滑点保护设置
                      </span>
                      <div className="flex gap-1.5">
                        {[0.5, 1.0, 3.0].map((v) => (
                          <button
                            key={v}
                            onClick={() => setSlippage(v)}
                            className={`flex-1 rounded py-1 text-xs font-mono font-bold transition-all ${
                              slippage === v 
                                ? 'bg-[#ffd285]/10 text-[#ffd285]' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {v}%
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <form onSubmit={executeSwap} className="mt-6 space-y-4">
            
            {/* Input "FROM" */}
            <div className="rounded-xl border border-white/5 bg-[#121622]/40 p-4 relative">
              <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                <span>付出资产 (From)</span>
                <span className="font-mono">
                  余额: {
                    userState.walletAddress 
                      ? (fromAsset === 'ETH' ? userState.balanceEth.toFixed(4) : fromAsset === 'SOL' ? userState.balanceSol.toFixed(2) : userState.balanceKairo.toFixed(0))
                      : '0.00'
                  } {fromAsset}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <input
                  id="swap-from-input"
                  type="number"
                  step="any"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full text-xl font-mono font-bold text-white bg-transparent outline-none placeholder-white/20"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="rounded bg-[#ffd285]/10 border border-[#ffd285]/20 px-2.5 py-1 text-[10px] font-bold text-[#ffd285] hover:bg-[#ffd285]/20 active:scale-[0.95]"
                  >
                    最大
                  </button>
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value)}
                    className="bg-[#0c0e14] border border-white/10 rounded-lg py-1.5 px-3.5 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    {SUPPORTED_ASSETS.map(asset => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Middle arrow switch */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwapAssets}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd285]/20 bg-[#0c0e14] text-[#ffd285] shadow-lg hover:brightness-115 active:scale-[0.9]"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {/* Input "TO" */}
            <div className="rounded-xl border border-white/5 bg-[#121622]/40 p-4">
              <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                <span>获得代币 (To - 已减去销毁)</span>
                <span className="font-mono">
                  持有: {
                    userState.walletAddress 
                      ? (userState.ownedTokens[toAsset] || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : '0'
                  } {toAsset}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xl font-mono font-bold text-white/90">
                  {toAmount > 0 ? toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                </span>
                
                <select
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className="bg-[#0c0e14] border border-white/10 rounded-lg py-1.5 px-3.5 text-xs font-bold text-[#ffd285] outline-none cursor-pointer"
                >
                  {tokens.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slippage & impact parameters */}
            <div className="rounded-xl border border-white/5 bg-white/[0.015] p-4 text-xs font-mono text-white/50 space-y-2">
              <div className="flex justify-between">
                <span>兑换汇率 (模拟):</span>
                <span className="text-white">1 {fromAsset} = {rate.toLocaleString(undefined, { maximumFractionDigits: 0 })} {toAsset}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center space-x-1">
                  <span>价格影响 (Price Impact):</span>
                  <Info className="h-3 w-3 text-white/30" />
                </span>
                <span className={priceImpact > 5 ? 'text-red-400 font-bold' : priceImpact > 2 ? 'text-amber-400 font-bold' : 'text-green-400 font-bold'}>
                  {priceImpact > 0 ? `${priceImpact}%` : '< 0.01%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>链上自动销毁贡献 (Deflationary Burn):</span>
                <span className="text-red-400 font-bold flex items-center space-x-1">
                  <Flame className="h-3.5 w-3.5 text-red-400" />
                  <span>5.0%</span>
                  <span className="text-[10px] text-white/30">({burnAmount > 0 ? burnAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0} {toAsset})</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>预计网络 Gas 费用:</span>
                <span className="text-white/70">
                  {fromAsset === 'SOL' ? '0.00005 SOL' : '0.0012 ETH'}
                </span>
              </div>
            </div>

            <button
              id="swap-execute-btn"
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-[#ffd285] to-[#f52329] py-3.5 text-xs font-bold text-black shadow-lg transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <Zap className="h-4 w-4" />
              <span>启动 Web3 合约兑换并注入销毁池</span>
            </button>
          </form>
        </div>

        <div className="mt-4 border-t border-white/5 pt-4 text-center z-10">
          <span className="text-[10px] text-white/40 font-sans block flex items-center justify-center space-x-1">
            <Lock className="h-3 w-3 text-white/40" />
            <span>滑点限额：{slippage}% | 智能路由最优解：Kairo AMM v1</span>
          </span>
        </div>

      </div>

      {/* Wall Street Order Book & Live Trades (Middle 4 Columns) */}
      <div className={`lg:col-span-4 flex flex-col space-y-6 ${
        activeSwapTab === 'book' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Real-time Order Book Widget */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md flex-1 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-[#ffd285] animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">实时盘口挂单 (Order Book)</h4>
              </div>
              <span className="text-[9px] text-[#ffd285] bg-[#ffd285]/10 px-1.5 py-0.5 rounded font-bold uppercase">{toAsset}</span>
            </div>

            {/* Asks (Sell Orders) - Red */}
            <div className="mt-3.5 space-y-1">
              <div className="grid grid-cols-3 text-[9px] text-white/30 font-bold pb-1 uppercase">
                <span>价格 (USD)</span>
                <span className="text-right">数量 ({toAsset})</span>
                <span className="text-right">累计总量</span>
              </div>
              
              {orderBook.asks.map((ask, idx) => {
                const sizePercent = Math.min(100, (ask.size / 80000) * 100);
                return (
                  <div key={`ask-${idx}`} className="relative grid grid-cols-3 text-[10px] py-0.5 select-none hover:bg-white/[0.02]">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/5 transition-all duration-500 pointer-events-none" 
                      style={{ width: `${sizePercent}%` }}
                    />
                    <span className="text-rose-500 font-medium font-mono z-10">${ask.price.toFixed(6)}</span>
                    <span className="text-right text-white/70 font-mono z-10">{ask.size.toLocaleString()}</span>
                    <span className="text-right text-white/40 font-mono z-10">{(ask.total / 1000).toFixed(0)}K</span>
                  </div>
                );
              })}
            </div>

            {/* Spread Row */}
            <div className="my-2.5 py-1.5 border-y border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px]">
              <span className="text-white/40 font-bold text-[9px]">SPREAD GAP</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold font-mono">${toTokenPrice.toFixed(6)}</span>
                <span className="text-[9px] text-white/30">(≈ 0.04%)</span>
              </div>
            </div>

            {/* Bids (Buy Orders) - Green */}
            <div className="space-y-1">
              {orderBook.bids.map((bid, idx) => {
                const sizePercent = Math.min(100, (bid.size / 95000) * 100);
                return (
                  <div key={`bid-${idx}`} className="relative grid grid-cols-3 text-[10px] py-0.5 select-none hover:bg-white/[0.02]">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/5 transition-all duration-500 pointer-events-none" 
                      style={{ width: `${sizePercent}%` }}
                    />
                    <span className="text-emerald-400 font-medium font-mono z-10">${bid.price.toFixed(6)}</span>
                    <span className="text-right text-white/70 font-mono z-10">{bid.size.toLocaleString()}</span>
                    <span className="text-right text-white/40 font-mono z-10">{(bid.total / 1000).toFixed(0)}K</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between text-[9px] text-white/30">
            <span>AMM ENGINE: KAIRO_V1</span>
            <span className="text-emerald-400">● ACTIVE</span>
          </div>
        </div>

        {/* Live Prints / Time & Sales */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md flex-1 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-1.5">
                <ArrowRight className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">交易逐笔 (Time & Sales)</h4>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="mt-3.5 space-y-1.5">
              <div className="grid grid-cols-4 text-[9px] text-white/30 font-bold pb-1 uppercase">
                <span>时间</span>
                <span>方向</span>
                <span className="text-right">数量 ({toAsset})</span>
                <span className="text-right">成交价</span>
              </div>

              {liveTrades.map((trade, idx) => (
                <div key={`trade-${idx}`} className="grid grid-cols-4 text-[10px] py-0.5 hover:bg-white/[0.02] border-b border-white/[0.02] last:border-0">
                  <span className="text-white/40 font-mono">{trade.time}</span>
                  <span className={`font-bold font-mono ${trade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {trade.type}
                  </span>
                  <span className="text-right text-white/70 font-mono">{trade.size.toLocaleString()}</span>
                  <span className="text-right text-white/90 font-mono">${trade.price.toFixed(6)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3 text-[9px] text-white/30 font-mono">
            FEED LATENCY <span className="text-emerald-400 font-bold">&lt; 3.0S</span>
          </div>
        </div>

      </div>

      {/* Transaction Records & receipt popup (Right 4 Columns) */}
      <div className={`lg:col-span-4 flex flex-col justify-between space-y-6 ${
        activeSwapTab === 'history' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Receipt Container */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md relative overflow-hidden" id="swap-receipt-box">
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#ffd285]/5 blur-3xl" />
          
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <CheckCircle className="h-4.5 w-4.5 text-green-400" />
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">上一次交易凭证 (Receipt)</h4>
          </div>

          <AnimatePresence mode="wait">
            {lastTx ? (
              <motion.div
                key={lastTx.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mt-4 space-y-3 font-mono text-xs"
              >
                <div className="flex justify-between items-center text-[10px] text-white/40 pb-2 border-b border-white/5">
                  <span>交易打包区块</span>
                  <span className="text-white">#18,495,201</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">支出数额 (Spent)</span>
                  <strong className="text-white">{lastTx.fromAmount.toFixed(4)} {lastTx.fromSymbol}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">买入净额 (Received)</span>
                  <strong className="text-green-400 font-bold">{lastTx.toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {lastTx.toSymbol}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">通缩销毁数额</span>
                  <strong className="text-red-400 font-bold">{(lastTx.fromAmount * rate * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })} {lastTx.toSymbol}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">结算时间</span>
                  <span className="text-white/80">{lastTx.timestamp}</span>
                </div>

                <div className="rounded-lg bg-white/[0.015] p-2.5 border border-white/5 mt-3">
                  <div className="text-[9px] text-white/40 block">哈希值交易对 (TxHash)</div>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-[10px] text-white/60 truncate max-w-[180px]">{lastTx.txHash}</span>
                    <a 
                      href="#"
                      onClick={(e) => { e.preventDefault(); addNotification('模拟区块链浏览器', '该哈希处于虚拟测试网络，无法打开真实浏览器页面', 'info'); }}
                      className="text-[#ffd285] hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="mt-12 mb-12 text-center" id="no-swap-receipt">
                <AlertCircle className="h-8 w-8 text-white/25 mx-auto" />
                <p className="mt-3 text-xs text-white/40">暂无上一笔成交记录。</p>
                <p className="text-[10px] text-white/30 mt-0.5">请在左侧输入兑换数值并执行交易。</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* History Stream */}
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md flex-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">平台最新成交流 (Recent swaps)</h4>
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-mono text-green-400 font-semibold">ON-CHAIN</span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-[11px]" id="swap-history-list">
            {swapHistory.length > 0 ? (
              swapHistory.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-2 rounded bg-white/[0.015] border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white/80">买入</span>
                      <strong className="text-white">{tx.toAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${tx.toSymbol}</strong>
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5">付出 {tx.fromAmount.toFixed(3)} {tx.fromSymbol}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 block">{tx.timestamp}</span>
                    <span className="text-[9px] text-red-400 font-bold font-mono">已燃烧 5%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40 text-center py-6">尚无成交记录流。</p>
            )}
          </div>
        </div>

      </div>

      </div>

    </div>
  );
}

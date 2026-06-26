import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ChevronDown, Flame, Award, Trophy, Activity, Terminal, Shield, Sparkles, Globe, LogOut, Ghost, Link, Coins } from 'lucide-react';
import { UserState } from '../types';

interface NavbarProps {
  userState: UserState;
  connectWallet: (walletName: string) => void;
  disconnectWallet: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  roleMode: 'investor' | 'developer';
  setRoleMode: (mode: 'investor' | 'developer') => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

const WALLETS = [
  { name: 'MetaMask', icon: Coins, color: 'text-orange-500' },
  { name: 'Phantom', icon: Ghost, color: 'text-purple-400' },
  { name: 'Coinbase Wallet', icon: Wallet, color: 'text-blue-500' },
  { name: 'WalletConnect', icon: Link, color: 'text-teal-400' }
];

export default function Navbar({
  userState,
  connectWallet,
  disconnectWallet,
  activeTab,
  setActiveTab,
  roleMode,
  setRoleMode,
  addNotification
}: NavbarProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('Arbitrum');

  const handleWalletSelect = (walletName: string) => {
    connectWallet(walletName);
    setIsWalletModalOpen(false);
    addNotification('钱包连接成功', `已成功连接 ${walletName} 钱包！`, 'success');
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    setIsChainDropdownOpen(false);
    addNotification('链网络切换', `已切换至 ${chain} 主网网络`, 'info');
  };

  const tabs = [
    { id: 'arena', label: '复苏竞技场', icon: Flame, role: 'investor' },
    { id: 'leaderboard', label: '排行榜', icon: Trophy, role: 'investor' },
    { id: 'catalysts', label: '复兴催化剂', icon: Award, role: 'developer' },
    { id: 'builderHub', label: 'Builder 终端', icon: Terminal, role: 'developer' }
  ];

  const activeTabsList = tabs.filter(t => t.role === roleMode);

  // Dynamic theme styling
  const activeColorClass = roleMode === 'developer' ? 'text-cyan-400' : 'text-[#ffd285]';
  const glowBorderClass = roleMode === 'developer' ? 'border-cyan-500/20' : 'border-[#ffd285]/20';
  const glowGradientClass = roleMode === 'developer' ? 'bg-gradient-to-b from-cyan-500/10 to-transparent' : 'bg-gradient-to-b from-[#ffd285]/10 to-transparent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ffd285]/10 bg-[#07090e]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('arena')} 
          className="flex cursor-pointer items-center space-x-2.5"
          id="navbar-logo"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffd285] to-[#f52329] p-[1.5px] shadow-[0_0_15px_rgba(245,35,41,0.25)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
              <span className="bg-gradient-to-r from-[#ffd285] to-[#f52329] bg-clip-text text-lg font-bold tracking-widest text-transparent">K</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xl font-bold tracking-[0.2em] text-white">KAIRO</span>
            <span className="hidden text-[8px] font-semibold tracking-wider text-[#ffd285]/60 sm:block">REIGNITING VALUE</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1" id="navbar-desktop-nav">
          {activeTabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 rounded-xl px-4 py-2.5 font-sans text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : `${roleMode === 'developer' ? 'text-cyan-500/50 hover:bg-cyan-500/5 hover:text-cyan-400' : 'text-[#ffd285]/50 hover:bg-[#ffd285]/5 hover:text-[#ffd285]/80'}`
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className={`absolute inset-0 rounded-xl border ${glowBorderClass} ${glowGradientClass}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 transition-colors ${isActive ? activeColorClass : 'text-current'}`} />
                <span>{tab.label}</span>
                {tab.id === 'arena' && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f52329] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f52329]"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3" id="navbar-actions">
          
          {/* User/Developer Role Mode Switcher */}
          <div className="hidden lg:flex items-center rounded-xl bg-[#121622]/60 p-[3px] border border-white/5">
            <button
              onClick={() => {
                setRoleMode('investor');
                setActiveTab('arena');
                addNotification('视角切换', '已切换至社区投资者视图 📊', 'success');
              }}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                roleMode === 'investor'
                  ? 'bg-gradient-to-r from-[#ffd285] to-[#f52329] text-black shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              📊 投资者
            </button>
            <button
              onClick={() => {
                setRoleMode('developer');
                setActiveTab('catalysts');
                addNotification('视角切换', '已切换至智能合约开发者视图 🛠️', 'success');
              }}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                roleMode === 'developer'
                  ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/10 font-extrabold'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              🛠️ 开发者
            </button>
          </div>

          {/* Chain Switcher */}
          <div className="relative">
            <button
              id="chain-switcher"
              onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
              className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/60 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-[#121622] hover:border-white/10"
            >
              <Globe className="h-3.5 w-3.5 text-[#ffd285]" />
              <span className="hidden sm:inline">{selectedChain}</span>
              <ChevronDown className="h-3 w-3 text-white/50" />
            </button>

            <AnimatePresence>
              {isChainDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsChainDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-[#ffd285]/10 bg-[#0c0e14] p-1.5 shadow-xl z-20"
                  >
                    {['Arbitrum', 'Ethereum', 'Solana', 'Base'].map((chain) => (
                      <button
                        key={chain}
                        onClick={() => handleChainSelect(chain)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          selectedChain === chain 
                            ? 'bg-[#ffd285]/10 text-[#ffd285]' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {chain}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet State Button */}
          {userState.walletAddress ? (
            <div className="flex items-center rounded-xl border border-[#ffd285]/15 bg-[#ffd285]/5 p-[1px]">
              <div className="hidden items-center space-x-2 px-3 text-xs font-mono text-white/80 md:flex">
                <span className="text-[#ffd285]/60 font-sans">余额:</span>
                <span>
                  {selectedChain === 'Solana' 
                    ? `${userState.balanceSol.toFixed(2)} SOL` 
                    : `${userState.balanceEth.toFixed(4)} ETH`
                  }
                </span>
              </div>
              <button
                id="wallet-user-btn"
                onClick={disconnectWallet}
                className="group flex items-center space-x-1.5 rounded-xl bg-[#121622] px-3.5 py-2 text-xs font-mono font-medium text-white transition-all hover:bg-[#1c2236]"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                <span>{userState.walletAddress.slice(0, 6)}...{userState.walletAddress.slice(-4)}</span>
                <LogOut className="h-3 w-3 text-white/40 group-hover:text-white/80 transition-colors" />
              </button>
            </div>
          ) : (
            <motion.button
              id="wallet-connect-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#ffd285] to-[#f52329] px-4 py-2 text-xs font-bold text-black shadow-[0_4px_15px_rgba(245,35,41,0.2)] hover:opacity-95"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>连接钱包</span>
            </motion.button>
          )}

        </div>
      </div>

      {/* Wallet Connect Dialog Modal */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsWalletModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#ffd285]/20 bg-[#0c0e14] p-6 shadow-2xl z-10"
              id="wallet-connect-modal"
            >
              {/* Glow effects inside modal */}
              <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#f52329]/10 blur-[60px]" />
              <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#ffd285]/10 blur-[60px]" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-[#ffd285]" />
                  <h3 className="text-sm font-bold tracking-wide text-white">连接您的 WEB3 钱包</h3>
                </div>
                <button 
                  onClick={() => setIsWalletModalOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="mt-3 text-xs text-white/50 leading-relaxed">
                选择一个支持的钱包提供商连接。您可以使用模拟资金来进行平台内质押、Boost和复兴代币交易。
              </p>

              <div className="mt-5 space-y-2.5">
                {WALLETS.map((wallet) => {
                  const Icon = wallet.icon;
                  return (
                    <button
                      key={wallet.name}
                      id={`wallet-option-${wallet.name.replace(' ', '')}`}
                      onClick={() => handleWalletSelect(wallet.name)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#121622]/40 px-4 py-3 text-sm text-white transition-all hover:bg-[#121622]/90 hover:border-[#ffd285]/30 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-4.5 w-4.5 ${wallet.color}`} />
                        <span className="font-medium group-hover:text-[#ffd285] transition-colors">{wallet.name}</span>
                      </div>
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/50 group-hover:bg-[#ffd285]/10 group-hover:text-[#ffd285] transition-all">
                        已安装
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-white/5 pt-4 text-center">
                <span className="inline-flex items-center space-x-1 text-[10px] text-white/40">
                  <Sparkles className="h-3 w-3 text-[#ffd285]" />
                  <span>KAIRO 智能合约审核已通过：CertiK SECURED</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Navigation - Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#07090e]/95 backdrop-blur-md md:hidden flex justify-around py-3 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        {activeTabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 text-[10px] font-semibold transition-all duration-300 ${
                isActive 
                  ? `${roleMode === 'developer' ? 'text-cyan-400' : 'text-[#ffd285]'} scale-105` 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {isActive && (
                <div className={`absolute -top-3 left-1/4 right-1/4 h-[2px] rounded-full shadow-md ${
                  roleMode === 'developer'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#22d3ee]'
                    : 'bg-gradient-to-r from-[#ffd285] to-[#f52329] shadow-[0_0_8px_#f52329]'
                }`} />
              )}
              <Icon className={`h-4.5 w-4.5 transition-all duration-300 ${isActive ? (roleMode === 'developer' ? 'text-cyan-400 stroke-[2.5px]' : 'text-[#ffd285] stroke-[2.5px]') : 'text-current'}`} />
              <span className="mt-1">{tab.label.slice(0, 4)}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

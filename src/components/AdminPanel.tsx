import React from 'react';
import { Shield, Check, ToggleLeft, ToggleRight, RefreshCw, X, AlertCircle } from 'lucide-react';
import { Catalyst, CatalystStatus } from '../types';

interface AdminPanelProps {
  catalysts: Catalyst[];
  onUpdateCatalyst: (id: string, updates: Partial<Catalyst>) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({
  catalysts,
  onUpdateCatalyst,
  addNotification,
  isOpen,
  onClose
}: AdminPanelProps) {
  if (!isOpen) return null;

  const handleToggleVerified = (cat: Catalyst) => {
    const newValue = !cat.isVerified;
    onUpdateCatalyst(cat.id, { isVerified: newValue });
    addNotification(
      '权限变更',
      `成功将 $${cat.token.symbol} 标记为 ${newValue ? '官方验证 [Verified]' : '未验证'}`,
      'success'
    );
  };

  const handleToggleEscrowed = (cat: Catalyst) => {
    const newValue = !cat.isEscrowed;
    onUpdateCatalyst(cat.id, { isEscrowed: newValue });
    addNotification(
      '资金托管变更',
      `成功将 $${cat.token.symbol} 奖池状态更新为 ${newValue ? '多签托管中 [Escrowed]' : '未托管'}`,
      'success'
    );
  };

  const handleStatusChange = (id: string, symbol: string, status: CatalystStatus) => {
    onUpdateCatalyst(id, { status });
    addNotification(
      '状态调整成功',
      `成功将 $${symbol} 的催化阶段调整为：${
        status === 'Active' ? '竞标中' : status === 'Voting' ? '投票期' : status === 'Completed' ? '已完成' : '即将开始'
      }`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <div 
        className="relative w-full max-w-lg h-[92vh] overflow-hidden rounded-2xl border border-[#ffd285]/20 bg-[#0c0e14] p-6 shadow-2xl z-10 flex flex-col justify-between"
        id="admin-sandbox-drawer"
      >
        {/* Glow effects inside panel */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#f52329]/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#ffd285]/10 blur-[80px]" />

        <div className="z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffd285]/10 border border-[#ffd285]/20">
                <Shield className="h-4 w-4 text-[#ffd285]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  KAIRO 开发者沙箱控制台
                </h3>
                <p className="text-[10px] text-white/40 font-mono">ADMIN TESTNET PLAYGROUND</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-2.5 rounded-xl border border-[#ffd285]/10 bg-[#ffd285]/5 p-3 text-xs text-[#ffd285]/90 leading-relaxed">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>此终端仅用于测试目的。调整状态会即时同步至主面板、催化列表与排行榜，供功能验证。</span>
          </div>

          {/* List of Projects to Manage */}
          <div className="mt-5 flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-none">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">项目催化状态微调</h4>
            
            {catalysts.map((cat) => (
              <div 
                key={cat.id}
                className="rounded-xl border border-white/5 bg-[#121622]/40 p-4 space-y-3.5"
              >
                {/* Project ID & Symbol */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#ffd285]">${cat.token.symbol}</span>
                    <span className="text-[10px] text-white/40 font-semibold truncate max-w-[160px]">{cat.token.name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-white/30">ID: {cat.id}</span>
                </div>

                {/* Verification & Escrow Toggles */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 pt-1">
                  {/* Verified Switch */}
                  <button
                    onClick={() => handleToggleVerified(cat)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      cat.isVerified
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-[#07090e] border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    <span>官方验证 (Verified)</span>
                    {cat.isVerified ? (
                      <ToggleRight className="h-5 w-5 text-green-400 flex-shrink-0 ml-1" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-white/20 flex-shrink-0 ml-1" />
                    )}
                  </button>

                  {/* Escrowed Switch */}
                  <button
                    onClick={() => handleToggleEscrowed(cat)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      cat.isEscrowed
                        ? 'bg-[#ffd285]/10 border-[#ffd285]/20 text-[#ffd285]'
                        : 'bg-[#07090e] border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    <span>托管奖池 (Escrow)</span>
                    {cat.isEscrowed ? (
                      <ToggleRight className="h-5 w-5 text-[#ffd285] flex-shrink-0 ml-1" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-white/20 flex-shrink-0 ml-1" />
                    )}
                  </button>
                </div>

                {/* Stage selector dropdown */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono text-white/40 block">催化资助状态 (Funding Status)</label>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-1 rounded-lg bg-[#07090e] p-1 border border-white/5">
                    {(['Active', 'Voting', 'Completed', 'Upcoming'] as CatalystStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(cat.id, cat.token.symbol, status)}
                        className={`rounded-md py-1.5 text-[10px] font-bold tracking-wide transition-all ${
                          cat.status === status
                            ? 'bg-gradient-to-r from-[#ffd285] to-[#f52329]/90 text-black shadow-md'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {status === 'Active' ? '投标中' : status === 'Voting' ? '投票期' : status === 'Completed' ? '已结束' : '即将开启'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer info line */}
        <div className="z-10 mt-4 border-t border-white/5 pt-3.5 text-center flex items-center justify-center space-x-1">
          <RefreshCw className="h-3 w-3 text-green-400 animate-spin" />
          <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">
            KAIRO LOCAL RECONCILIATION ENGINE ONLINE
          </span>
        </div>

      </div>
    </div>
  );
}

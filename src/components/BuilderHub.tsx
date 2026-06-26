import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Code, Award, CheckCircle, RefreshCw, Send, Play, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { Bid, UserState } from '../types';

interface BuilderHubProps {
  bids: Bid[];
  userState: UserState;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  onAddRewards: (amount: number) => void;
}

const MOCK_SOL_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KairoCatalystReceiver {
    address public kairoHub;
    address public dormantToken;
    address public builder;
    uint256 public rewardPool;
    bool public isRevived;

    event MomentumBoosted(uint256 totalMomentum);
    event RewardClaimed(address indexed builder, uint256 amount);

    constructor(address _hub, address _dormant, address _builder) {
        kairoHub = _hub;
        dormantToken = _dormant;
        builder = _builder;
        isRevived = false;
    }

    // 自动接收 Boost 势能并销毁 5%
    function injectMomentum(uint256 _amount) external {
        require(msg.sender == kairoHub, "Only KairoHub can call");
        IERC20(dormantToken).transferFrom(builder, address(this), _amount);
        
        // 销毁 5% 到黑洞地址
        uint256 burnAmount = (_amount * 5) / 100;
        IERC20(dormantToken).transfer(address(0), burnAmount);
        
        emit MomentumBoosted(_amount);
    }
}`;

export default function BuilderHub({
  bids,
  userState,
  addNotification,
  onAddRewards
}: BuilderHubProps) {
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['kairo-cli v1.4.2 initialized.', 'Ready to audit KairoCatalystReceiver.sol.']);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  // Filter bids owned by this builder
  const myBids = bids.filter(b => b.builderName === (userState.walletName || 'Alex Rivers (0xAlex)'));

  const simulateCompileAndAudit = () => {
    if (!userState.walletAddress) {
      addNotification('未连接钱包', '请先在右上角连接您的 Web3 钱包再运行编译器。', 'error');
      return;
    }

    setIsCompiling(true);
    setCompileSuccess(false);
    setTerminalLogs(['$ kairo-cli compile --contract ./contracts/KairoCatalystReceiver.sol']);

    const steps = [
      { text: '[AUDIT] 正在解析 Solidity AST 结构树...', delay: 600 },
      { text: '[LINK] 成功加载并链接 @openzeppelin/contracts/token/ERC20/IERC20.sol', delay: 1200 },
      { text: '[GUARD] 正在通过 KAIR-VM 安全策略（检测溢出、重入漏洞及重签名安全保护）...', delay: 1800 },
      { text: '[COMPILER] 优化器已启用 (runs=200). 字节码生成中: 0x6080604052348015610010...', delay: 2400 },
      { text: '[TESTNET] 正在启动 5 项链上单元模拟测试 (UnitTest)...', delay: 3000 },
      { text: '[✓] 1. Test_Constructor: 初始化主网合约成功', delay: 3400 },
      { text: '[✓] 2. Test_InjectMomentum: 注入 1,000 $DORM 势能成功', delay: 3800 },
      { text: '[✓] 3. Test_BurnMechanism: 黑洞多签销毁 5.0% DORM 安全触发', delay: 4200 },
      { text: '[SUCCESS] 5项测试完全通过！审计结果: SECURED. 零安全隐患 (CertiK Audit Score: 98/100)', delay: 4800 },
      { text: '[LAUNCH] 字节码已准备好上线。已在 KAIRO 测试网生成部署交易凭证。', delay: 5400 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, step.text]);
        if (idx === steps.length - 1) {
          setIsCompiling(false);
          setCompileSuccess(true);
          onAddRewards(100); // add some mock KAIRO tokens
          addNotification('智能审计通过！', '获得 100 KAIRO Builder 积分奖励！', 'success');
        }
      }, step.delay);
    });
  };

  return (
    <div className="space-y-6" id="builder-terminal">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5 backdrop-blur-md">
          <div className="text-xs text-white/40 font-mono">MY SUBMITTED BIDS</div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {myBids.length} <span className="text-xs text-white/50">个方案</span>
          </div>
          <p className="mt-1 text-[10px] text-white/30">已签署并在 KAIRO 链上登记的方案</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5 backdrop-blur-md">
          <div className="text-xs text-white/40 font-mono">BUILDER CREDIT REWARDS</div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#ffd285] flex items-center space-x-1.5">
            <span>{userState.balanceKairo.toLocaleString()}</span>
            <span className="text-xs text-white/60">KAIR</span>
          </div>
          <p className="mt-1 text-[10px] text-green-400">已获得 500 个 Boost 累积奖励积分</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5 backdrop-blur-md">
          <div className="text-xs text-white/40 font-mono">SECURED SMART CONTRACTS</div>
          <div className="mt-2 text-2xl font-mono font-bold text-green-400 flex items-center space-x-1">
            <span>{compileSuccess ? '1' : '0'}</span>
            <span className="text-xs text-white/50">个通过</span>
          </div>
          <p className="mt-1 text-[10px] text-white/30">通过 KAIRO 智能合约自动化测试审计的数量</p>
        </div>
      </div>

      {/* Code Editor and Terminal Simulator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Solidity Code Preview (Left 7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5 backdrop-blur-md flex flex-col justify-between" id="solidity-editor">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="h-4.5 w-4.5 text-[#ffd285]" />
                <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">KairoCatalystReceiver.sol</h3>
              </div>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-mono text-white/40 uppercase">SOLIDITY v0.8.20</span>
            </div>

            <div className="mt-4 rounded-xl bg-[#07090e] p-4 border border-white/5 font-mono text-xs overflow-x-auto text-green-300 max-h-96 leading-relaxed select-all">
              <pre>{MOCK_SOL_CODE}</pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-white/40 font-mono flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-[#ffd285]" />
              <span>开发模板由 KAIRO Web3 SDK 提供支持</span>
            </span>
            <button
              id="compiler-run-btn"
              disabled={isCompiling}
              onClick={simulateCompileAndAudit}
              className="flex items-center space-x-1.5 rounded-xl bg-[#ffd285] px-4 py-2 text-xs font-bold text-black hover:bg-white transition-colors disabled:opacity-50"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{isCompiling ? '正在编译审计...' : '运行编译并安全审计'}</span>
            </button>
          </div>
        </div>

        {/* Terminal Logs Output (Right 5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#07090e]/80 p-5 backdrop-blur-md flex flex-col justify-between" id="compiler-terminal">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4.5 w-4.5 text-[#ffd285]" />
                <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">KAIRO Auditing Console</h3>
              </div>
              <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-mono text-green-400 font-semibold">TERMINAL</span>
            </div>

            <div className="mt-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto" id="terminal-logs">
              {terminalLogs.map((log, index) => (
                <div key={index} className={`leading-relaxed ${
                  log.startsWith('[✓]') 
                    ? 'text-green-400' 
                    : log.startsWith('[SUCCESS]') || log.startsWith('获得')
                    ? 'text-[#ffd285] font-bold' 
                    : log.startsWith('$')
                    ? 'text-white font-semibold'
                    : 'text-white/60'
                }`}>
                  {log}
                </div>
              ))}
              {isCompiling && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block h-4 w-2 bg-green-400"
                />
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <span className="text-[10px] text-white/30 font-mono block text-center">
              使用 KAIRO 审计脚手架发布可以大幅提高您的提案评分
            </span>
          </div>

        </div>

      </div>

      {/* My Submitted proposals tracker table */}
      <div className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md" id="builder-bids-tracker">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">我的复兴方案进度面板</h3>
            <p className="text-[10px] text-white/40 mt-0.5">点击方案行展开查看高保真智能合约状态机进度图表</p>
          </div>
          <span className="rounded-full bg-[#ffd285]/10 px-2.5 py-0.5 text-[10px] font-mono text-[#ffd285]">
            4-STAGE CONTRACT LIFECYCLE
          </span>
        </div>
        
        {/* State for expanded row */}
        {(() => {
          const [expandedBidId, setExpandedBidId] = useState<string | null>(null);
          
          const getStepInfo = (votes: number) => {
            if (votes < 50) {
              return { step: 1, label: 'Submitted (已提交)', desc: '提案已进入链上，待多签验证', statusText: '已收录' };
            }
            if (votes < 150) {
              return { step: 2, label: 'Reviewing (审核评估)', desc: 'Ka-VM 安全审计与技术评分中', statusText: '审计评估中' };
            }
            if (votes < 300) {
              return { step: 3, label: 'Milestone Met (目标达成)', desc: '社区势能符合条件，解锁首期资金', statusText: '里程碑达成' };
            }
            return { step: 4, label: 'Paid (完成赏金汇出)', desc: '智能托管合约完成多签打款，圆满成功', statusText: '资助已到账' };
          };

          return (
            <div className="overflow-x-auto mt-4">
              {myBids.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-medium text-white/40 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">投标任务ID</th>
                      <th className="py-3 px-4">方案名称</th>
                      <th className="py-3 px-4 font-mono">申请资助 (Reward)</th>
                      <th className="py-3 px-4">获得 Boost 投票</th>
                      <th className="py-3 px-4 text-right">审核阶段</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myBids.map((bid) => {
                      const { step, desc, statusText } = getStepInfo(bid.votes);
                      const isExpanded = expandedBidId === bid.id;
                      return (
                        <React.Fragment key={bid.id}>
                          <tr 
                            onClick={() => setExpandedBidId(isExpanded ? null : bid.id)}
                            className={`text-xs hover:bg-white/[0.015] cursor-pointer transition-all ${isExpanded ? 'bg-white/[0.01]' : ''}`}
                          >
                            <td className="py-4 px-4 font-mono font-bold text-[#ffd285]">#{bid.catalystId}</td>
                            <td className="py-4 px-4 font-bold text-white">
                              <div className="flex items-center space-x-2">
                                <span>{bid.title}</span>
                                <span className="text-[10px] text-white/30 font-normal">(点击查看状态机)</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-white/80">{bid.requestedFunding}</td>
                            <td className="py-4 px-4 font-mono font-semibold text-white/80">
                              <span className="text-amber-400 font-bold">★ {bid.votes}</span> Votes
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`rounded px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                                step === 1 ? 'bg-blue-500/10 border border-blue-500/15 text-blue-400' :
                                step === 2 ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400' :
                                step === 3 ? 'bg-indigo-500/10 border border-indigo-500/15 text-indigo-400' :
                                'bg-green-500/10 border border-green-500/15 text-green-400'
                              }`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>

                          {/* Expandable Stepper View */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0 bg-[#07090e]/40 border-b border-white/5">
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-6 py-5 overflow-hidden"
                                >
                                  {/* Stepper Header */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-6">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
                                      <span className="text-xs font-bold text-white font-mono">
                                        提案当前状态：<span className="text-[#ffd285]">{desc}</span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-white/40 font-mono">
                                      提示: 当提案 Boost 票数分别达到 50, 150, 300 时，状态机会随之自动进阶！
                                    </span>
                                  </div>

                                  {/* Progress Visual Track */}
                                  <div className="relative flex items-center justify-between py-2 max-w-3xl mx-auto">
                                    {/* Line connector backgrounds */}
                                    <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-white/5 -translate-y-1/2 rounded z-0" />
                                    <div 
                                      className="absolute left-0 top-1/2 h-[3px] bg-gradient-to-r from-[#ffd285] to-[#f52329] -translate-y-1/2 rounded transition-all duration-700 z-0" 
                                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                                    />

                                    {/* 4 Steps */}
                                    {([
                                      { num: 1, title: 'Submitted', desc: '已提交方案' },
                                      { num: 2, title: 'Reviewing', desc: 'Ka-VM 审计评估' },
                                      { num: 3, title: 'Milestone Met', desc: '首期里程碑' },
                                      { num: 4, title: 'Paid', desc: '赏金发放' }
                                    ]).map((s) => {
                                      const isCompleted = step >= s.num;
                                      const isActive = step === s.num;
                                      return (
                                        <div key={s.num} className="relative z-10 flex flex-col items-center">
                                          {/* Circle Outer Frame */}
                                          <div 
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
                                              isActive 
                                                ? 'bg-[#0c0e14] border-[#ffd285] text-[#ffd285] ring-4 ring-[#ffd285]/20 shadow-[0_0_15px_rgba(255,210,133,0.4)]'
                                                : isCompleted
                                                ? 'bg-gradient-to-br from-[#ffd285] to-[#f52329] border-transparent text-black font-black'
                                                : 'bg-[#0c0e14] border-white/5 text-white/20'
                                            }`}
                                          >
                                            {isCompleted && !isActive ? (
                                              <span className="text-xs">✓</span>
                                            ) : (
                                              <span className="text-xs font-bold font-mono">{s.num}</span>
                                            )}
                                          </div>

                                          {/* Step Info Below */}
                                          <div className="text-center mt-2">
                                            <span className={`block text-[10px] font-bold tracking-wide font-mono ${
                                              isActive ? 'text-[#ffd285]' : isCompleted ? 'text-white' : 'text-white/30'
                                            }`}>
                                              {s.title}
                                            </span>
                                            <span className="hidden sm:block text-[9px] text-white/40 mt-0.5">
                                              {s.desc}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center border border-dashed border-white/5 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-white/20 mx-auto" />
                  <p className="mt-3 text-xs text-white/40">您当前尚未提交任何产品竞标方案。</p>
                  <p className="text-[10px] text-[#ffd285] mt-1 cursor-pointer hover:underline">
                    前往 [复兴催化剂] 浏览挑战，一键上传您的方案以开启 Builder 之旅！
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
}

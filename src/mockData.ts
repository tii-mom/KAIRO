import { Catalyst, Bid, ProjectToken, PriceHistoryPoint } from './types';

// Helper to generate a realistic price history with an initial spike, crash, and a slight recent revival
export function generatePriceHistory(symbol: string, days: number = 30, currentPrice: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    
    // Create a trend: slow decline, stabilization, and dynamic fluctuations
    let multiplier = 1;
    if (i > 20) {
      // decline phase
      multiplier = 1.3 + Math.sin(i / 5) * 0.15;
    } else if (i > 10) {
      // flat bottom
      multiplier = 0.9 + Math.cos(i / 3) * 0.08;
    } else {
      // slight revival
      multiplier = 1.0 + (10 - i) * 0.02 + Math.sin(i) * 0.05;
    }
    
    points.push({
      time: dateStr,
      price: parseFloat((currentPrice * multiplier).toFixed(8))
    });
  }
  
  return points;
}

// 1. $DORM (Dormant Yields)
const dormPriceHistory = generatePriceHistory('DORM', 30, 0.000124);
const dormToken: ProjectToken = {
  name: 'Dormant Yields',
  symbol: 'DORM',
  originalPeakMc: 182000000,
  currentMc: 124000,
  holdersCount: 41205,
  burnRate: 4.8,
  priceChange24h: 14.82,
  priceHistory: dormPriceHistory
};

// 2. $PEPE2 (Pepe 2.0 Reloaded)
const pepe2PriceHistory = generatePriceHistory('PEPE2', 30, 0.00000085);
const pepe2Token: ProjectToken = {
  name: 'Pepe 2.0 Reloaded',
  symbol: 'PEPE2',
  originalPeakMc: 45000000,
  currentMc: 95000,
  holdersCount: 12480,
  burnRate: 12.5,
  priceChange24h: 32.41,
  priceHistory: pepe2PriceHistory
};

// 3. $RETRO (Retro Arcade)
const retroPriceHistory = generatePriceHistory('RETRO', 30, 0.00185);
const retroToken: ProjectToken = {
  name: 'Retro Arcade Game',
  symbol: 'RETRO',
  originalPeakMc: 89000000,
  currentMc: 185000,
  holdersCount: 8940,
  burnRate: 2.1,
  priceChange24h: -2.35,
  priceHistory: retroPriceHistory
};

// 4. $NEURA (NeuraNodes)
const neuraPriceHistory = generatePriceHistory('NEURA', 30, 0.0345);
const neuraToken: ProjectToken = {
  name: 'NeuraNodes GPU',
  symbol: 'NEURA',
  originalPeakMc: 125000000,
  currentMc: 345000,
  holdersCount: 15302,
  burnRate: 1.5,
  priceChange24h: 8.94,
  priceHistory: neuraPriceHistory
};

// 5. $SPATIAL (SpatialFi VR)
const spatialPriceHistory = generatePriceHistory('SPATIAL', 30, 0.00042);
const spatialToken: ProjectToken = {
  name: 'SpatialFi MetaCity',
  symbol: 'SPATIAL',
  originalPeakMc: 64000000,
  currentMc: 42000,
  holdersCount: 6510,
  burnRate: 0.8,
  priceChange24h: 24.15,
  priceHistory: spatialPriceHistory
};

// 6. $SHIBE (Shibe Inu Classic)
const shibePriceHistory = generatePriceHistory('SHIBE', 30, 0.0000215);
const shibeToken: ProjectToken = {
  name: 'Shibe Inu Classic',
  symbol: 'SHIBE',
  originalPeakMc: 215000000,
  currentMc: 215000,
  holdersCount: 84320,
  burnRate: 18.2,
  priceChange24h: 11.20,
  priceHistory: shibePriceHistory
};

export const INITIAL_CATALYSTS: Catalyst[] = [
  {
    id: 'cat-1',
    title: '开发以 $DORM 驱动的 Telegram 单键智能挖矿聚合器',
    description: 'Dormant Yields 是 Arbitrum 上曾经的明星收益聚合协议，锁仓量曾达 1 亿美金。创始人离队后，智能合约代码依然完好，拥有 4.1 万持币者。我们急需一款贴近用户的 Telegram Mini App 挖矿聚合器，重新盘活其余温。',
    background: 'Dormant Yields 在 2021 年曾经大火。然而，因为创始人将合约权限完全丢弃（Renounced）且锁仓到期，项目缺少持续运营，沦为休眠代币。由于流动性充足且持有人基数大，它是最具备复兴潜力的 DeFi 代币。',
    requirements: [
      '构建一个基于 React/Next.js 的 Telegram Mini App，前端设计符合 Web3 简约高级美学。',
      '集成 $DORM 的单键挖矿（1-Click Zap Buy & Stake）功能，自动将 Arbitrum 上的 ETH 换为 $DORM 并质押。',
      '设计动态收益率 (Dynamic APY) 计算面板，让用户直观看到复兴能量对收益的倍增效应。',
      '提供邀请好友机制（Referral System）和返佣计算页面。'
    ],
    rewardPool: {
      amount: 15000000,
      tokenSymbol: 'DORM',
      usdValue: 18600
    },
    token: dormToken,
    momentum: 8420,
    totalBids: 3,
    creator: '0xAlpha...e34b',
    createdAt: '2026-06-01',
    deadline: '2026-07-15',
    category: 'DeFi',
    status: 'Active'
  },
  {
    id: 'cat-2',
    title: '发布 $PEPE2 Meme 挂机小游戏与通缩销毁引擎',
    description: 'Pepe 2.0 Reloaded 是社区 100% 自主运行的 Meme，虽然持有人遍布全球（1.2 万人），但一直由于缺乏通缩场景难以二次起飞。我们需要一款具备社交裂变、轻量好玩、且深度绑定 $PEPE2 销毁引擎的 TG Clicker 游戏。',
    background: '2023 年模因热潮期间诞生的 Pepe 2.0 经历了暴涨，随着创始团队退出，现在完全由民间自治基金会接管。代币税为 0% 且已销毁黑洞。如果能为它量身定制通缩场景，其社区势必能瞬间爆发。',
    requirements: [
      '开发一款 Telegram “Click-to-Burn” 挂机小游戏。用户通过点击收集 Pepe 金币，并用 $PEPE2 代币购买超级道具或升级倍率。',
      '购买游戏内限定皮肤或排行榜挑战门票的 $PEPE2 费用，将直接打入 0x000...000 销毁地址（在前端展示模拟销毁动画）。',
      '设计全球 Builder 邀请码绑定与社区贡献裂变海报生成。',
      '集成实时排行榜，向贡献前 10 名的 Builders 与点击者空投 KAIRO 专属积分。'
    ],
    rewardPool: {
      amount: 8000000000,
      tokenSymbol: 'PEPE2',
      usdValue: 6800
    },
    token: pepe2Token,
    momentum: 12540,
    totalBids: 4,
    creator: 'Pepe2DAO...771e',
    createdAt: '2026-06-05',
    deadline: '2026-07-10',
    category: 'Meme',
    status: 'Active'
  },
  {
    id: 'cat-3',
    title: '重构并分布式托管 Retro Arcade 的 3 款经典网页街机游戏',
    description: 'Retro Arcade 曾在 2022 年掀起复古街机风，其代币 $RETRO 用于支付游戏门票。由于原本的 AWS 中心化服务器欠费，游戏被迫下线。我们需要开发者将游戏重构并托管至 IPFS/Arweave 等去中心化网络，并修改游戏合约使门票结算重连。',
    background: '游戏前端与智能合约实际上都是开源完备的，只因原开发团队无钱维护服务器而下架。8900 名持币持有者和狂热街机玩家迫切希望看到游戏重回人间。去中心化托管是最好的答案。',
    requirements: [
      '将 3 款原 WebGL 街机游戏打包成可以在 IPFS/Arweave 顺畅运行的单页面 HTML5。',
      '使用智能合约前端库（Wagmi/Viem）编写门票扣减交互，玩家需通过签名 $RETRO 扣除门票开始游戏。',
      '在首页内嵌复古霓虹街机画风（Cyberpunk Retro）的游戏模拟体验框，提供键盘及手柄适配。',
      '提供历史最高分（High Score）和玩家排行榜。'
    ],
    rewardPool: {
      amount: 5000000,
      tokenSymbol: 'RETRO',
      usdValue: 9250
    },
    token: retroToken,
    momentum: 4120,
    totalBids: 2,
    creator: 'ArcadeFan...fa83',
    createdAt: '2026-06-10',
    deadline: '2026-07-28',
    category: 'GameFi',
    status: 'Active'
  },
  {
    id: 'cat-4',
    title: '基于 Docker 开发 NeuraNodes 去中心化 GPU 节点轻量级调度客户端',
    description: 'NeuraNodes 曾试图建立去中心化 GPU 算力租赁，后由于中心化调度算法在 2024 年底崩溃且团队流失，项目归零。该项目其实有极强的算力提供者和 GPU 囤积群体。我们发布此任务，希望重写轻量级调度工具。',
    background: '算力硬件需求现在正值 AI 爆发期。NeuraNodes 的硬件供应端一直存在，瓶颈仅在于调度软件失效。通过重写分布式算力管理端，可以让 $NEURA 币重拾 “AI 算力代币” 的光环，带来百倍复兴可能。',
    requirements: [
      '设计并实现一个极简炫酷的开源 GPU 状态监控与调度前端面板。',
      '展示节点连接状态（模拟 P2P 握手、延迟、节点温度、算力跑分）。',
      '用 TypeScript 模拟 Docker daemon 通讯接口，让节点能轻松一键“出租”本地空闲算力。',
      '展示算力收益曲线和由 $NEURA 发放的租金收益分析图。'
    ],
    rewardPool: {
      amount: 450000,
      tokenSymbol: 'NEURA',
      usdValue: 15525
    },
    token: neuraToken,
    momentum: 9810,
    totalBids: 2,
    creator: 'GPU_Lord...01cf',
    createdAt: '2026-06-08',
    deadline: '2026-08-01',
    category: 'AI',
    status: 'Active'
  },
  {
    id: 'cat-5',
    title: '开发 SpatialFi 虚拟大都市 3D 网页浏览器轻量版 (Spatial Light)',
    description: 'SpatialFi 曾承诺一个宏大的 3D 虚拟世界，但由于客户端体积超 2GB 且加载缓慢，很快失去了用户。本催化剂需要开发者将现有的 3D 高模素材导出并基于 WebGL / Three.js 制作一个低于 20MB 的网页即开轻量体验版。',
    background: '该项目留存下了极高精度的 3D 模型资产（Blender/OBJ）。这些资产是其最大价值。只需将其压缩转换、在浏览器中重现，并让持有 $SPATIAL 的用户能直接登录领地，就能让持有者重新感到希望。',
    requirements: [
      '使用 Three.js、React Three Fiber 或是 PlayCanvas 构建 20MB 以内的 3D 精致展厅。',
      '支持 WASD + 鼠标视角漫游，以及移动端虚拟摇杆。',
      '支持用户连接钱包，识别其持有的 $SPATIAL 代币数量，并在其虚拟头像（Avatar）头顶显示对应的尊贵头衔。',
      '一键截图、生成专属明信片分享至 Twitter / Lens。'
    ],
    rewardPool: {
      amount: 20000000,
      tokenSymbol: 'SPATIAL',
      usdValue: 8400
    },
    token: spatialToken,
    momentum: 3500,
    totalBids: 1,
    creator: 'MetaRealist...32da',
    createdAt: '2026-06-12',
    deadline: '2026-07-20',
    category: 'Infra',
    status: 'Voting'
  },
  {
    id: 'cat-6',
    title: '重塑 Shibe Inu Classic ($SHIBE) 社区专属的去中心化 meme 募资平台',
    description: 'Shibe Inu Classic 作为曾经红极一时的搞笑 Meme，拥有 8.4 万超级忠实的持有粉丝。由于缺少代币功能，粉丝们各自为战。我们发布这个任务，需要开发者为他们开发一个 Meme-funding（小额 meme 社区募资提案）平台。',
    background: '该代币在 2021 年达到了惊人的 2.15 亿美元市值。虽然目前几乎静止，但其持币地址极其分散，流动性充裕。一旦有了能将粉丝行动汇聚的工具（类似 Snapshot 但内嵌小额打赏募资），很容易重燃狂欢。',
    requirements: [
      '设计并实现类似 Kickstarter 与 Snapshot 结合的 Meme 募资发起前端。',
      '提案必须通过锁定或销毁少量 $SHIBE 才能发起。',
      '其他持币人可以用 $SHIBE 进行打赏众筹（Micro-crowdfund），募资成功的项目将由多签钱包保管发放。',
      '展示炫酷的狗狗卡通动画、募资进度条、以及极具张力的分享推特效果。'
    ],
    rewardPool: {
      amount: 120000000,
      tokenSymbol: 'SHIBE',
      usdValue: 25800
    },
    token: shibeToken,
    momentum: 18450,
    totalBids: 0,
    creator: 'WoofDAO...11a2',
    createdAt: '2026-06-15',
    deadline: '2026-08-15',
    category: 'SocialFi',
    status: 'Upcoming'
  }
];

export const INITIAL_BIDS: Bid[] = [
  {
    id: 'bid-1-1',
    catalystId: 'cat-1',
    builderName: 'Alex Rivers (0xAlex)',
    builderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'DormApp Lite: 一键 Zap Eth 质押并生成 TG Bot 控制台',
    description: '我计划设计一款基于 Vite-React 和 Tailwind 的 Telegram WebApp。通过接入 Uniswap V3 SDK 模拟计算，玩家能够将 Arbitrum ETH 一键闪兑换为 $DORM 并质押，质押所得收益通过 Telegram 每日推送。我已完成了大部分的 UI 交互及智能合约脚手架。',
    demoUrl: 'https://dorm-zap-lite.demo.kairo.dev',
    githubUrl: 'https://github.com/alexriverdev/dorm-zap-lite',
    videoUrl: 'https://youtube.com/watch?v=mock_dormapp',
    requestedFunding: '2,000,000 DORM',
    votes: 345,
    createdAt: '2026-06-03',
    status: 'UnderReview'
  },
  {
    id: 'bid-1-2',
    catalystId: 'cat-1',
    builderName: 'ZettaBytes Studio',
    builderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'DormCore: 高收益矿池看板与高级多链 Zap 连接器',
    description: '我们不仅要盘活 Arbitrum，还计划把 DORM 桥接扩展到 Base 与 Optimism。本项目提供多链资产看板，用户不仅可以用 ETH 挖矿，还可以使用 USDC/USDT 等稳定币一键 Zap。前端完全遵循 Glassmorphism（磨砂玻璃）美学，并带有高频动态行情卡片。',
    demoUrl: 'https://dormcore-multichain.kairo.dev',
    githubUrl: 'https://github.com/zettabytes-studio/dormcore-client',
    videoUrl: 'https://youtube.com/watch?v=mock_dormcore',
    requestedFunding: '3,500,000 DORM',
    votes: 512,
    createdAt: '2026-06-05',
    status: 'Approved'
  },
  {
    id: 'bid-1-3',
    catalystId: 'cat-1',
    builderName: 'Elena Rostova',
    builderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'DormZap-Mini: 专为电报优化的极致极简挖矿页面',
    description: '大而全往往会拖慢加载速度，降低转化率。我的设计主打 3 秒内极速打开。省去一切多余文字，只保留 [钱包连接] - [滑块确认挖矿] - [收益提现] 两个主屏幕。通过纯净拟物化（Neumorphic）按钮和酷炫的硬币掉落动效，大幅提升用户质押意愿。',
    demoUrl: 'https://dormzap-mini.vercel.app',
    githubUrl: 'https://github.com/elenarost/dormzap-mini-tg',
    requestedFunding: '1,500,000 DORM',
    votes: 198,
    createdAt: '2026-06-07',
    status: 'UnderReview'
  },
  
  // pepe2 bids
  {
    id: 'bid-2-1',
    catalystId: 'cat-2',
    builderName: 'MemeHype Team',
    builderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Pepe2Clicker: 疯狂暴击与代币销毁排行榜',
    description: '这是一个高度使人上瘾的点击游戏。通过融入 Pepe 表情包元素，玩家疯狂点击屏幕即可获得能量。每次暴击奖励将以 $PEPE2 进行销毁作为加速条件，同时提供实时销毁仪表盘，向全世界宣告销毁战绩！已完成 Telegram H5 适配及 WebGL 像素风粒子动画。',
    demoUrl: 'https://pepe2clicker.fun',
    githubUrl: 'https://github.com/memehype/pepe2-clicker',
    videoUrl: 'https://youtube.com/watch?v=mock_clicker',
    requestedFunding: '1,000,000,000 PEPE2',
    votes: 890,
    createdAt: '2026-06-06',
    status: 'Approved'
  },
  {
    id: 'bid-2-2',
    catalystId: 'cat-2',
    builderName: 'ChainPainter AI',
    builderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Pepe2MemeGPT: 基于 AI 的表情包生成及销毁机',
    description: '利用大语言模型微调而成的 Pepe 表情包生成器。用户只需输入一句话，就能生成绝无仅有的恶搞 Pepe 图片。普通清晰度免费，如果要生成 4K 超清或者带有专属持币证明（NFT）的水印，则需要燃烧价值 1 美元的 $PEPE2。这不仅是一个产品，还是一个每日可产生几千万销毁的飞轮！',
    demoUrl: 'https://pepe2gpt.ai',
    githubUrl: 'https://github.com/chainpainter/pepe2-memegpt',
    requestedFunding: '2,500,000,000 PEPE2',
    votes: 620,
    createdAt: '2026-06-08',
    status: 'UnderReview'
  }
];

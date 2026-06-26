/**
 * KAIRO Web3 Hub Types
 */

export type CategoryType = 'DeFi' | 'SocialFi' | 'GameFi' | 'AI' | 'Meme' | 'Infra';
export type CatalystStatus = 'Active' | 'Voting' | 'Completed' | 'Upcoming';
export type BidStatus = 'UnderReview' | 'Approved' | 'Declined' | 'Winner';

export interface PriceHistoryPoint {
  time: string;
  price: number;
}

export interface ProjectToken {
  name: string;
  symbol: string;
  originalPeakMc: number; // in USD
  currentMc: number;      // in USD
  holdersCount: number;
  burnRate: number;       // e.g., 2.5 (%) or tokens burned
  priceChange24h: number;  // percentage
  priceHistory: PriceHistoryPoint[];
}

export interface Catalyst {
  id: string;
  title: string;
  description: string;
  background: string;     // Why token is dormant / backstory
  requirements: string[]; // Specific tasks to revive token
  rewardPool: {
    amount: number;
    tokenSymbol: string;
    usdValue: number;
  };
  token: ProjectToken;
  momentum: number;       // Boost power
  totalBids: number;
  creator: string;
  createdAt: string;
  deadline: string;
  category: CategoryType;
  status: CatalystStatus;
  isVerified?: boolean;
  isEscrowed?: boolean;
}

export interface Bid {
  id: string;
  catalystId: string;
  builderName: string;
  builderAvatar: string;
  title: string;
  description: string;
  demoUrl: string;
  githubUrl: string;
  videoUrl?: string;
  requestedFunding?: string;
  votes: number;
  createdAt: string;
  status: BidStatus;
}

export interface UserState {
  walletAddress: string | null;
  walletName: string | null;
  balanceEth: number;
  balanceSol: number;
  balanceKairo: number;
  boostedCatalysts: string[]; // Set of catalystIds boosted
  boostedBids: string[];      // Set of bidIds boosted
  ownedTokens: Record<string, number>; // symbol -> amount
}

export interface SwapTx {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
  txHash: string;
}

export interface WalletOption {
  name: string;
  icon: string;
  installed: boolean;
}

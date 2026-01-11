
export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'ELITE';

export interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  creator: string;
  socialScore: number;
  logoUrl?: string;
  isBonding?: boolean;
  address?: string;
  decimals?: number;
  description?: string;
  tags?: string[];
}

export interface Trade {
  id: string;
  wallet: string;
  type: 'buy' | 'sell' | 'lp_add' | 'ath';
  tokenSymbol: string;
  amount: number;
  valueUsd: number;
  timestamp: number;
  rank: 'Alpha' | 'Degen' | 'Whale' | 'Newbie';
  reputationScore: number;
}

export interface UserProfile {
  address: string;
  fid?: number;
  username: string;
  xp: number; 
  pendingXp: number;
  level: number;
  tier: Tier;
  reputation: number; // 0-1000
  badges: string[];
  followers: number;
  winRate: number;
  totalVolume: number;
  pnlNet: number;
  lastGm?: number;
}

export type ViewState = 'feed' | 'terminal' | 'profile' | 'leaderboard' | 'checkout' | 'launcher';

export interface PortfolioHistory {
  timestamp: string;
  value: number;
}

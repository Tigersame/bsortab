
import { Token, Trade, UserProfile, PortfolioHistory } from './types';

export const XP_REWARDS = {
  SWAP: 50,
  DAILY_GM: 10,
  BUY_ALPHA: 100,
  SHARE: 25,
  SHARE_PNL: 40,
  FOLLOW: 15,
};

export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 5000,
  GOLD: 25000,
  ELITE: 100000,
};

export const MOCK_TOKENS: Token[] = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    price: 2650.00, 
    change24h: 1.2, 
    marketCap: 320000000000, 
    volume24h: 15000000000, 
    creator: 'Vitalik', 
    socialScore: 99,
    address: '', // Native
    decimals: 18,
    logoUrl: 'https://token-icons.s3.amazonaws.com/eth.png',
    description: "The L1 foundation. Unshakable, decentralized, and the bedrock of Base.",
    tags: ['L1', 'BlueChip', 'Safe']
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    price: 1.00, 
    change24h: 0.01, 
    marketCap: 5000000000, 
    volume24h: 500000000, 
    creator: 'Circle', 
    socialScore: 95,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logoUrl: 'https://token-icons.s3.amazonaws.com/usdc.png',
    description: "Digital Dollar. Stable, liquid, and ready for deployment.",
    tags: ['Stable', 'Utility']
  },
  { 
    symbol: 'WETH', 
    name: 'Wrapped Ether', 
    price: 2650.00, 
    change24h: 1.2, 
    marketCap: 1000000000, 
    volume24h: 50000000, 
    creator: 'Protocol', 
    socialScore: 90,
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    description: "ERC-20 compliant Ether. Essential for trading on Base dApps.",
    tags: ['Utility', 'DeFi']
  },
  { 
    symbol: 'DEGEN', 
    name: 'Degen', 
    price: 0.008, 
    change24h: -5.4, 
    marketCap: 100000000, 
    volume24h: 2000000, 
    creator: '0xDegen', 
    socialScore: 88,
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    decimals: 18,
    description: "The community token of Farcaster. Born from a /channel, now a movement. High volatility, high vibes.",
    tags: ['Community', 'Farcaster', 'Meme']
  },
  { 
    symbol: 'BRETT', 
    name: 'Brett', 
    price: 0.07, 
    change24h: 12.1, 
    marketCap: 700000000, 
    volume24h: 15000000, 
    creator: '0xBrett', 
    socialScore: 94,
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    decimals: 18,
    description: "Pepe's best friend on Base. The mascot of the blue chain.",
    tags: ['Meme', 'Mascot', 'Trending']
  },
  { 
    symbol: 'CLANKER', 
    name: 'Clanker Alpha', 
    price: 12.4, 
    change24h: 22.5, 
    marketCap: 12000000, 
    volume24h: 1500000, 
    creator: '0xAl...ph', 
    socialScore: 92,
    address: '0x1bc182e4c5b425717647207622616f94747c3561', // Placeholder
    decimals: 18,
    description: "AI-deployed token experiment. The machines are winning, and they are profitable.",
    tags: ['AI', 'Experimental', 'Alpha']
  },
];

export const MOCK_TRADES: Trade[] = [
  { id: '1', wallet: '0xAlpha...92', type: 'buy', tokenSymbol: 'DEGEN', amount: 500000, valueUsd: 22500, timestamp: Date.now() - 60000, rank: 'Alpha', reputationScore: 940 },
  { id: '2', wallet: '0xWhale...ff', type: 'lp_add', tokenSymbol: 'CLANKER', amount: 100, valueUsd: 50000, timestamp: Date.now() - 300000, rank: 'Whale', reputationScore: 880 },
  { id: '4', wallet: '0xTop...12', type: 'ath', tokenSymbol: 'BRETT', amount: 0, valueUsd: 0, timestamp: Date.now() - 900000, rank: 'Alpha', reputationScore: 999 },
];

export const INITIAL_USER: UserProfile = {
  address: '0x38...2b1a',
  fid: 12842,
  username: 'BaseExplorer_42',
  xp: 12500,
  pendingXp: 450,
  level: 12,
  tier: 'SILVER',
  reputation: 842,
  badges: ['Early Adopter', 'Alpha Hunter', 'Clanker Pro'],
  followers: 452,
  winRate: 68.2,
  totalVolume: 125000,
  pnlNet: 4200.50,
};

export const MOCK_LEADERBOARD: UserProfile[] = [
  { address: '0x71...f2a1', fid: 1, username: 'Vitalik', xp: 999999, pendingXp: 0, level: 99, tier: 'ELITE', reputation: 999, badges: ['God Tier'], followers: 1000000, winRate: 99.9, totalVolume: 10000000, pnlNet: 5000000 },
  { address: '0x12...99ee', fid: 88, username: 'BaseAlpha', xp: 85000, pendingXp: 120, level: 45, tier: 'ELITE', reputation: 940, badges: ['Whale', 'Degen'], followers: 12400, winRate: 72.1, totalVolume: 2500000, pnlNet: 120000 },
  { address: '0xabc...1234', fid: 420, username: 'DegenKing', xp: 52000, pendingXp: 50, level: 28, tier: 'GOLD', reputation: 880, badges: ['Risk Taker'], followers: 5200, winRate: 58.4, totalVolume: 800000, pnlNet: 45000 },
  INITIAL_USER,
  { address: '0xfee...4421', fid: 1024, username: 'NewDegen', xp: 8400, pendingXp: 200, level: 5, tier: 'BRONZE', reputation: 420, badges: ['Newbie'], followers: 12, winRate: 45.0, totalVolume: 1500, pnlNet: -200 },
];

export const PORTFOLIO_HISTORY: PortfolioHistory[] = [
  { timestamp: '08:00', value: 3800 },
  { timestamp: '12:00', value: 4100 },
  { timestamp: '16:00', value: 3950 },
  { timestamp: '20:00', value: 4500 },
  { timestamp: '00:00', value: 4200.50 },
];

import { Token, Trade, UserProfile, PortfolioHistory } from './types';

export const XP_REWARDS = {
  SWAP: 50,
  DAILY_GM: 10,
  BUY_ALPHA: 100,
  SHARE: 25,
  SHARE_PNL: 40,
  FOLLOW: 15,
  ENABLE_NOTIFICATIONS: 150,
  VIEW_CHART: 5,
  GENERATE_METADATA: 20,
  SAVE_PRECLANK: 75,
  DEPLOY_TOKEN: 500,
  CONNECT_WALLET: 50,
  CHECK_LEADERBOARD: 5,
  OPEN_TOKEN_DETAILS: 10,
  SWITCH_TAB: 2
};

export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 5000,
  GOLD: 25000,
  ELITE: 100000,
};

// Real Base Mainnet Tokens
export const BASE_TOKENS: Token[] = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    price: 0, // Dynamic fetch required in prod
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Vitalik', 
    socialScore: 99,
    address: '', // Native
    decimals: 18,
    logoUrl: 'https://token-icons.s3.amazonaws.com/eth.png',
    description: "The L1 foundation. Unshakable, decentralized, and the bedrock of Base.",
    tags: ['L1', 'BlueChip', 'Gas']
  },
  { 
    symbol: 'WETH', 
    name: 'Wrapped Ether', 
    price: 0, 
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Protocol', 
    socialScore: 95,
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    logoUrl: 'https://token-icons.s3.amazonaws.com/eth.png',
    description: "ERC-20 compliant Ether. Essential for trading on Base dApps.",
    tags: ['Utility', 'DeFi']
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    price: 1.00, 
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Circle', 
    socialScore: 98,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logoUrl: 'https://token-icons.s3.amazonaws.com/usdc.png',
    description: "Digital Dollar. Stable, liquid, and ready for deployment.",
    tags: ['Stable', 'Liquidity']
  },
  { 
    symbol: 'DEGEN', 
    name: 'Degen', 
    price: 0, 
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Jacek', 
    socialScore: 92,
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    decimals: 18,
    logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png',
    description: "The community token of Farcaster. Born from a /channel, now a movement.",
    tags: ['Community', 'Farcaster', 'Social']
  },
  { 
    symbol: 'BRETT', 
    name: 'Brett', 
    price: 0, 
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Based', 
    socialScore: 94,
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    decimals: 18,
    logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x532f27101965dd16442e59d40670faf5ebb142e4.png',
    description: "Pepe's best friend on Base. The mascot of the blue chain.",
    tags: ['Meme', 'Mascot', 'BlueChip']
  },
  { 
    symbol: 'AERO', 
    name: 'Aerodrome', 
    price: 0, 
    change24h: 0, 
    marketCap: 0, 
    volume24h: 0, 
    creator: 'Aerodrome', 
    socialScore: 90,
    address: '0x940181a94a35a45bdc333bf04718c3c1b1e292ba',
    decimals: 18,
    logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x940181a94a35a45bdc333bf04718c3c1b1e292ba.png',
    description: "The central liquidity hub of Base. Vote, bribe, and earn.",
    tags: ['DeFi', 'Dex', 'Yield']
  }
];

// Empty initial state for production
export const EMPTY_USER: UserProfile = {
  address: '',
  username: '',
  xp: 0,
  pendingXp: 0,
  level: 1,
  tier: 'BRONZE',
  reputation: 100,
  badges: [],
  followers: 0,
  winRate: 0,
  totalVolume: 0,
  pnlNet: 0,
  notificationsEnabled: false,
  xpHistory: [],
};

// Placeholder for UI initialization, replaced by real data on load
export const LEADERBOARD_PLACEHOLDERS: UserProfile[] = [];

export const MOCK_LEADERBOARD: UserProfile[] = [
  {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    username: 'vitalik.eth',
    xp: 154200,
    pendingXp: 0,
    level: 99,
    tier: 'ELITE',
    reputation: 999,
    badges: ['OG', 'Verified'],
    followers: 105000,
    winRate: 85,
    totalVolume: 5000000,
    pnlNet: 250000,
    xpHistory: []
  },
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    username: 'jesse.base',
    xp: 125000,
    pendingXp: 0,
    level: 85,
    tier: 'ELITE',
    reputation: 950,
    badges: ['Builder', 'Based'],
    followers: 55000,
    winRate: 72,
    totalVolume: 1200000,
    pnlNet: 45000,
    xpHistory: []
  },
  {
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    username: 'based_pepe',
    xp: 85000,
    pendingXp: 1200,
    level: 60,
    tier: 'GOLD',
    reputation: 800,
    badges: ['Meme'],
    followers: 25000,
    winRate: 45,
    totalVolume: 800000,
    pnlNet: 12000,
    xpHistory: []
  },
  {
    address: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
    username: 'uniswap_pro',
    xp: 42000,
    pendingXp: 0,
    level: 35,
    tier: 'SILVER',
    reputation: 600,
    badges: ['DeFi'],
    followers: 12000,
    winRate: 60,
    totalVolume: 2500000,
    pnlNet: 8000,
    xpHistory: []
  },
  {
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    username: 'degen_intern',
    xp: 15000,
    pendingXp: 500,
    level: 15,
    tier: 'BRONZE',
    reputation: 420,
    badges: [],
    followers: 5000,
    winRate: 35,
    totalVolume: 50000,
    pnlNet: -2500,
    xpHistory: []
  }
];
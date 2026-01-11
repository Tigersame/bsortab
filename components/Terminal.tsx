
import React, { useState, useEffect, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Swap, SwapAmountInput, SwapToggleButton, SwapButton, SwapMessage } from '@coinbase/onchainkit/swap';
import { MOCK_TOKENS, INITIAL_USER, XP_REWARDS } from '../constants';
import EarnVault from './EarnVault';
import { sdk } from "../farcasterSdk";

interface TerminalProps {
  onSwap: () => void;
  onSharePnL: () => void;
  onEarnSuccess: () => void;
  onInteraction: (action: string) => void;
}

// ----------------------------------------------------------------------
// Optimized Sub-Components for Mini App Performance
// ----------------------------------------------------------------------

const TokenRow = memo(({ token, isSelected, onClick }: { token: any, isSelected: boolean, onClick: (t: any) => void }) => (
  <button
    onClick={() => onClick(token)}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all min-h-[44px] border border-transparent ${isSelected ? 'bg-blue-900/20 border-blue-500/30' : 'active:bg-[#111c33]'}`}
  >
    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-800 shrink-0">
       <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">{token.symbol}</span>
            {token.chainId === 8453 && <span className="text-[9px] font-black bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded-md">BASE</span>}
        </div>
        <span className="text-[11px] font-medium text-slate-500">{token.name}</span>
    </div>
    <div className="text-right">
       <span className="block text-sm font-medium text-white">0.00</span>
    </div>
  </button>
));

const generateOrderBook = (basePrice: number) => {
  const bids = Array.from({ length: 6 }).map((_, i) => ({
    price: basePrice * (1 - (i + 1) * 0.002),
    amount: Math.random() * 1000 + 500,
    total: 0
  }));
  const asks = Array.from({ length: 6 }).map((_, i) => ({
    price: basePrice * (1 + (i + 1) * 0.002),
    amount: Math.random() * 1000 + 500,
    total: 0
  })).reverse();
  return { bids, asks };
};

const Terminal: React.FC<TerminalProps> = ({ onSwap, onSharePnL, onEarnSuccess, onInteraction }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'portfolio' | 'earn'>('swap');
  const [selectedChart, setSelectedChart] = useState<string>('ETH');
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M'>('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [slippage, setSlippage] = useState(0.5);
  
  const [selectorType, setSelectorType] = useState<'from' | 'to' | null>(null);

  const swappableTokens = useMemo(() => MOCK_TOKENS.map(t => ({
    name: t.name,
    symbol: t.symbol,
    address: (t.address || '') as `0x${string}` | '',
    decimals: t.decimals ?? 18,
    image: t.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.symbol}`,
    chainId: 8453
  })), []);

  const [fromToken, setFromToken] = useState<any>(swappableTokens.find(t => t.symbol === 'ETH') || swappableTokens[0]);
  const [toToken, setToToken] = useState<any>(swappableTokens.find(t => t.symbol === 'USDC') || swappableTokens[1]);
  
  useEffect(() => {
    let basePrice = 0;
    if (selectedChart === 'PORTFOLIO') {
      basePrice = INITIAL_USER.totalVolume;
    } else {
      const token = MOCK_TOKENS.find(t => t.symbol === selectedChart);
      basePrice = token ? token.price : 0;
    }

    if (basePrice > 0) {
      const data = [];
      const now = Date.now();
      let price = basePrice;
      const points = timeframe === '1H' ? 60 : timeframe === '1D' ? 24 : 30;
      const interval = timeframe === '1H' ? 60000 : 3600000;
      
      for (let i = points; i >= 0; i--) {
        const volatility = timeframe === '1H' ? 0.005 : 0.05; 
        const change = 1 + (Math.random() - 0.5) * volatility;
        price = price * change;
        data.push({
          timestamp: new Date(now - i * interval).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: price
        });
      }
      setChartData(data);
    }
  }, [selectedChart, timeframe]);

  const currentToken = MOCK_TOKENS.find(t => t.symbol === selectedChart);
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const startValue = chartData.length > 0 ? chartData[0].value : 1;
  const isPositive = latestValue >= startValue;
  const percentChange = ((latestValue - startValue) / startValue) * 100;

  const handleSwapSuccess = () => {
    onSwap();
  };

  const handleSelectToken = (token: any) => {
    if (selectorType === 'from') setFromToken(token);
    if (selectorType === 'to') setToToken(token);
    setSelectorType(null);
  };

  return (
    <div className="p-4 space-y-4 pb-32 relative">
      {/* 
        -----------------------------------------------------------------------
        TOKEN SELECTOR PORTAL (Bottom Sheet) 
        Fixed inset-0 backdrop, absolute bottom sheet.
        -----------------------------------------------------------------------
      */}
      {selectorType && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999]" style={{ zIndex: 9999 }}>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" 
              onClick={() => setSelectorType(null)} 
            />
            
            {/* Sheet */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-[#0b1220] rounded-t-[20px] p-4 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[70vh]"
            >
                <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-base font-bold text-white">Select Token</h3>
                    <button onClick={() => setSelectorType(null)} className="p-2 bg-[#111c33] rounded-full text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="overflow-y-auto overscroll-contain no-scrollbar space-y-1 pb-8" style={{ maxHeight: '520px' }}>
                    {swappableTokens.map((t) => (
                        <TokenRow 
                            key={t.symbol} 
                            token={t} 
                            isSelected={(selectorType === 'from' && fromToken?.symbol === t.symbol) || (selectorType === 'to' && toToken?.symbol === t.symbol)}
                            onClick={handleSelectToken}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.body
      )}

      {/* Navigation Tabs (Top) */}
      <div className="flex bg-[#0b1220] p-1 rounded-2xl border border-slate-800/50 sticky top-0 z-20 shadow-md">
        <button onClick={() => setActiveTab('swap')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'swap' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Trade</button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Assets</button>
        <button onClick={() => setActiveTab('earn')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'earn' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Earn</button>
      </div>

      {activeTab === 'swap' && (
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-300">
          
          {/* Chart Preview */}
          <div className="w-full max-w-[420px] h-32 bg-[#0b1220] rounded-[20px] overflow-hidden relative border border-white/5">
             <div className="absolute top-3 left-4 z-10">
                <h3 className="text-xl font-bold text-white tracking-tight">${latestValue.toLocaleString()}</h3>
                <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0.2}/>
                     <stop offset="95%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="value" stroke={isPositive ? "#3b82f6" : "#ef4444"} strokeWidth={2} fill="url(#colorVal2)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>

          {/* 
             -------------------------------------------------------------------
             SWAP CARD - BASE SPEC 
             Max-width: 420px, Padding: 16px, Radius: 20px
             BG: Linear Gradient #0b1220 -> #060b16
             -------------------------------------------------------------------
          */}
          <div 
             className="w-full max-w-[420px] p-4 rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.45)] relative"
             style={{ background: 'linear-gradient(180deg, #0b1220, #060b16)' }}
          >
             <div className="flex justify-between items-center mb-4 px-1">
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Swap</h2>
                 <div className="flex gap-1">
                    {[0.5, 1, 3].map(v => (
                        <button key={v} onClick={() => setSlippage(v)} className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${slippage === v ? 'bg-[#111c33] text-blue-400 border border-blue-500/30' : 'text-slate-600 hover:text-slate-400'}`}>{v}%</button>
                    ))}
                 </div>
             </div>

             <Swap className="!p-0 !bg-transparent !border-none !space-y-0" onSuccess={handleSwapSuccess}>
                
                {/* 
                    SWAP WRAPPER 
                    Contains both inputs to allow relative positioning of the arrow 
                */}
                <div className="relative flex flex-col gap-2">
                    
                    {/* INPUT ROW 1: Sell */}
                    <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-[#0e1627] border border-transparent">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Sell</span>
                            <span className="text-[11px] font-mono text-slate-500">Bal: 4.204</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <SwapAmountInput
                                label=""
                                swappableTokens={[fromToken]}
                                token={fromToken}
                                type="from"
                                className="!w-full !flex-1 !bg-transparent !border-none !p-0 !text-[28px] !font-[600] !tracking-[-0.02em] !text-white !outline-none placeholder:!text-slate-700 !shadow-none min-h-[44px]"
                            />
                            {/* Token Pill Button */}
                            <button 
                                onClick={() => setSelectorType('from')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111c33] hover:bg-[#1a2845] transition-colors shrink-0 min-h-[36px]"
                            >
                                <img src={fromToken.image} className="w-5 h-5 rounded-full" alt="" />
                                <span className="text-sm font-bold text-white">{fromToken.symbol}</span>
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                        </div>
                        <span className="text-xs text-slate-600 font-mono">≈ $12,450.20</span>
                    </div>

                    {/* 
                        SWAP ARROW
                        Absolute centered relative to the wrapper containing both inputs.
                    */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <div className="w-9 h-9 rounded-xl bg-[#111c33] border-4 border-[#0b1220] flex items-center justify-center shadow-lg pointer-events-auto">
                            <SwapToggleButton className="!w-5 !h-5 !text-blue-400 !bg-transparent !border-none hover:!text-white" />
                        </div>
                    </div>

                    {/* INPUT ROW 2: Buy */}
                    <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-[#0e1627] border border-transparent">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Buy</span>
                            <span className="text-[11px] font-mono text-slate-500">Bal: 0.00</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <SwapAmountInput
                                label=""
                                swappableTokens={[toToken]}
                                token={toToken}
                                type="to"
                                className="!w-full !flex-1 !bg-transparent !border-none !p-0 !text-[28px] !font-[600] !tracking-[-0.02em] !text-white !outline-none placeholder:!text-slate-700 !shadow-none min-h-[44px]"
                            />
                            <button 
                                onClick={() => setSelectorType('to')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111c33] hover:bg-[#1a2845] transition-colors shrink-0 min-h-[36px]"
                            >
                                <img src={toToken.image} className="w-5 h-5 rounded-full" alt="" />
                                <span className="text-sm font-bold text-white">{toToken.symbol}</span>
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                        </div>
                        <span className="text-xs text-slate-600 font-mono">≈ $0.00</span>
                    </div>

                </div>

                <div className="pt-2">
                    <SwapButton className="!w-full !min-h-[48px] !bg-[#0052ff] !text-white !rounded-[16px] !font-bold !text-base !normal-case !tracking-normal !shadow-lg hover:!bg-blue-600 active:!scale-[0.98] transition-all" />
                </div>
                
                <SwapMessage className="!text-red-400 !text-xs !font-medium !text-center !bg-red-900/10 !p-2 !rounded-lg !mt-3 !mx-1" />
             </Swap>
          </div>

          <div className="flex gap-2 w-full max-w-[420px] justify-center text-[10px] text-slate-500 font-medium">
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Gas: Low</span>
             <span>•</span>
             <span>Route: Uniswap V3</span>
          </div>

        </div>
      )}

      {activeTab === 'portfolio' && (
         <div className="space-y-4 animate-in fade-in">
             <div className="w-full p-4 rounded-[20px] bg-[#0b1220] border border-white/5">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Assets</h3>
                 <div className="space-y-2">
                    {MOCK_TOKENS.map((t) => (
                        <div key={t.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <img src={t.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.symbol}`} className="w-8 h-8 rounded-full" alt="" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-bold text-white">{t.symbol}</div>
                                        {t.socialScore && (
                                            <div className="flex items-center gap-0.5 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                <span className="text-[8px] font-black text-blue-400 uppercase">Score</span>
                                                <span className="text-[9px] font-bold text-white">{t.socialScore}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-500">{t.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white">$0.00</div>
                                <div className="text-[10px] text-slate-500">0.00 {t.symbol}</div>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
         </div>
      )}

      {activeTab === 'earn' && (
        <EarnVault onSuccess={onEarnSuccess} />
      )}
    </div>
  );
};

export default Terminal;

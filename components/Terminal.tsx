
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Swap, SwapAmountInput, SwapToggleButton, SwapButton, SwapMessage } from '@coinbase/onchainkit/swap';
import { MOCK_TOKENS, PORTFOLIO_HISTORY, INITIAL_USER } from '../constants';
import EarnVault from './EarnVault';
import { sdk } from "@farcaster/miniapp-sdk";

interface TerminalProps {
  onSwap: () => void;
  onSharePnL: () => void;
  onEarnSuccess: () => void;
}

// Helper: Generate Mock Order Book Data
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

const Terminal: React.FC<TerminalProps> = ({ onSwap, onSharePnL, onEarnSuccess }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'portfolio' | 'earn'>('portfolio');
  const [selectedChart, setSelectedChart] = useState<string>('PORTFOLIO');
  const [chartData, setChartData] = useState<any[]>([]);
  const [slippage, setSlippage] = useState(0.5);
  const [orderBook, setOrderBook] = useState<{bids: any[], asks: any[]}>({ bids: [], asks: [] });
  
  // 1. Initialize Chart Data (Mock History)
  useEffect(() => {
    let basePrice = 0;
    
    if (selectedChart === 'PORTFOLIO') {
      basePrice = INITIAL_USER.totalVolume;
    } else {
      const token = MOCK_TOKENS.find(t => t.symbol === selectedChart);
      basePrice = token ? token.price : 0;
    }

    // Init Order Book based on price
    setOrderBook(generateOrderBook(basePrice || 1));

    if (basePrice > 0) {
      const data = [];
      const now = Date.now();
      let price = basePrice;
      
      // Generate 60 points of historical data
      for (let i = 60; i >= 0; i--) {
        // Random walk volatility
        const volatility = 0.02; // 2% range
        const change = 1 + (Math.random() - 0.5) * volatility;
        price = price * change;
        
        data.push({
          timestamp: new Date(now - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: price
        });
      }
      setChartData(data);
    }
  }, [selectedChart]);

  // 2. Live Updates Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(currentData => {
        if (currentData.length === 0) return currentData;

        const lastPoint = currentData[currentData.length - 1];
        const volatility = 0.005; // 0.5% volatility per tick
        const change = 1 + (Math.random() - 0.5) * volatility;
        const newPrice = lastPoint.value * change;
        
        const newPoint = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: newPrice
        };

        // Update Order Book occasionally
        if (Math.random() > 0.7) {
          setOrderBook(generateOrderBook(newPrice));
        }

        // Keep window size constant (remove first, add last)
        const newData = [...currentData.slice(1), newPoint];
        return newData;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [selectedChart]); // Restart interval on chart change

  // Map MOCK_TOKENS to OnchainKit Swappable Tokens with Real Addresses
  const swappableTokens = MOCK_TOKENS.map(t => ({
    name: t.name,
    symbol: t.symbol,
    address: (t.address || '') as `0x${string}` | '',
    decimals: t.decimals ?? 18,
    image: t.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.symbol}`,
    chainId: 8453
  }));

  const currentToken = MOCK_TOKENS.find(t => t.symbol === selectedChart);
  
  // Calculate dynamic stats based on chart data
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const startValue = chartData.length > 0 ? chartData[0].value : 1;
  const isPositive = latestValue >= startValue;
  const percentChange = ((latestValue - startValue) / startValue) * 100;

  // Derived Pro Stats
  const high24h = Math.max(...chartData.map(d => d.value)) * 1.02;
  const low24h = Math.min(...chartData.map(d => d.value)) * 0.98;

  return (
    <div className="p-4 space-y-6">
      {/* Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-4 shadow-xl relative overflow-hidden">
        {/* Token Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           <button 
             onClick={() => setSelectedChart('PORTFOLIO')}
             className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedChart === 'PORTFOLIO' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
           >
             Portfolio
           </button>
           {MOCK_TOKENS.map(t => (
             <button 
               key={t.symbol}
               onClick={() => setSelectedChart(t.symbol)}
               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedChart === t.symbol ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
             >
               ${t.symbol}
             </button>
           ))}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {selectedChart === 'PORTFOLIO' ? 'Net Worth' : `${currentToken?.name} Price`}
                </span>
                {currentToken && (
                    <button 
                        onClick={() => sdk.actions.openUrl(`https://basescan.org/token/${currentToken.address || '0x4200000000000000000000000000000000000006'}`)}
                        className="text-slate-600 hover:text-blue-400 transition-colors"
                        title="View on Explorer"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </button>
                )}
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white font-mono tracking-tighter">
                ${latestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </h2>
              <span className={`font-bold text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mx-1"></div>
             <span className="text-[9px] font-black text-green-400 uppercase tracking-widest pr-2">Live</span>
          </div>
        </div>

        <div className="h-48 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', padding: '0.5rem' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#3b82f6" : "#ef4444"} 
                fillOpacity={1} 
                fill="url(#colorVal)" 
                strokeWidth={3} 
                animationDuration={500}
                isAnimationActive={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
        <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500'}`}>Positions</button>
        <button onClick={() => setActiveTab('swap')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'swap' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500'}`}>Trade OS</button>
        <button onClick={() => setActiveTab('earn')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'earn' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500'}`}>Vaults</button>
      </div>

      {activeTab === 'swap' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          
          {/* Pro Header Stats */}
          <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black">24h High</span>
              <p className="text-[10px] text-white font-mono">${high24h.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black">24h Low</span>
              <p className="text-[10px] text-white font-mono">${low24h.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black">Vol (24h)</span>
              <p className="text-[10px] text-blue-400 font-mono">1.2M</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black">Mkt Cap</span>
              <p className="text-[10px] text-green-400 font-mono">42M</p>
            </div>
          </div>

          <div className="bg-slate-900/40 p-2 rounded-[2.5rem] border border-slate-800 relative">
             {/* Settings / Slippage */}
             <div className="absolute top-6 right-6 z-10">
               <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
                  {[0.5, 1, 3].map(val => (
                    <button 
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={`px-2 py-1 rounded text-[9px] font-black ${slippage === val ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {val}%
                    </button>
                  ))}
               </div>
             </div>

             <Swap className="!bg-transparent !border-none !p-0" onSuccess={onSwap}>
                <SwapAmountInput
                  label="Sell"
                  swappableTokens={swappableTokens}
                  type="from"
                  className="!bg-slate-900 !border !border-slate-800 !rounded-[2rem] !p-5 !shadow-inner"
                />
                <div className="flex justify-center -my-6 relative z-10">
                  <SwapToggleButton className="!bg-slate-950 !border-4 !border-slate-900 !rounded-2xl !p-3 !text-blue-500 hover:!scale-110 !transition-transform shadow-xl" />
                </div>
                <SwapAmountInput
                  label="Buy"
                  swappableTokens={swappableTokens}
                  type="to"
                  className="!bg-slate-900 !border !border-slate-800 !rounded-[2rem] !p-5 !shadow-inner"
                />
                <div className="mt-4 px-2">
                  <SwapButton className="!w-full !py-4 !bg-blue-600 !text-white !rounded-3xl !font-black !text-sm !uppercase !tracking-widest !transition-all !shadow-2xl !active:scale-95 hover:!bg-blue-500" />
                </div>
                <SwapMessage className="!text-slate-500 !text-[10px] !mt-4 !text-center !pb-4" />
             </Swap>
          </div>

          {/* Pro Features: Order Book & Recent Trades */}
          <div className="grid grid-cols-2 gap-4">
             {/* Order Book */}
             <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 overflow-hidden">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between">
                 <span>Order Book</span>
                 <span>Spread: 0.2%</span>
               </h3>
               <div className="space-y-1 font-mono text-[9px]">
                 {orderBook.asks.slice(-5).map((ask: any, i: number) => (
                   <div key={`ask-${i}`} className="flex justify-between items-center relative group">
                     <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-300" style={{ width: `${(ask.amount / 1500) * 100}%` }}></div>
                     <span className="text-rose-400 relative z-10 font-bold">{ask.price.toFixed(4)}</span>
                     <span className="text-slate-400 relative z-10">{ask.amount.toFixed(2)}</span>
                   </div>
                 ))}
                 <div className="h-px bg-slate-800 my-2"></div>
                 {orderBook.bids.slice(0, 5).map((bid: any, i: number) => (
                   <div key={`bid-${i}`} className="flex justify-between items-center relative group">
                     <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300" style={{ width: `${(bid.amount / 1500) * 100}%` }}></div>
                     <span className="text-emerald-400 relative z-10 font-bold">{bid.price.toFixed(4)}</span>
                     <span className="text-slate-400 relative z-10">{bid.amount.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Recent Trades */}
             <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Trades</h3>
               <div className="space-y-2 font-mono text-[9px]">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const isBuy = Math.random() > 0.5;
                    return (
                      <div key={i} className="flex justify-between items-center">
                        <span className={isBuy ? 'text-emerald-400' : 'text-rose-400'}>{latestValue.toFixed(4)}</span>
                        <span className="text-slate-300">{(Math.random() * 1000).toFixed(0)}</span>
                        <span className="text-slate-500">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    )
                  })}
               </div>
             </div>
          </div>

          <button 
            onClick={onSharePnL}
            className="w-full py-4 bg-slate-900/80 border border-slate-700/50 text-slate-300 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg group"
          >
            <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            Broadcast Trade Setup
          </button>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-4 animate-in fade-in duration-300">
           {MOCK_TOKENS.map(t => (
             <div 
               key={t.symbol} 
               onClick={() => setSelectedChart(t.symbol)}
               className={`p-5 rounded-[2rem] border flex justify-between items-center group transition-all cursor-pointer ${selectedChart === t.symbol ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'}`}
             >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-blue-500 text-lg shadow-inner group-hover:scale-105 transition-transform">
                    {t.logoUrl ? <img src={t.logoUrl} alt={t.symbol} className="w-8 h-8 object-contain" /> : t.symbol[0]}
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <h3 className="text-sm font-black text-white">{t.name}</h3>
                     <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                       <span className="text-[8px] font-black text-indigo-300 uppercase tracking-tight">Score</span>
                       <span className="text-[9px] font-black text-indigo-400">{t.socialScore}</span>
                     </div>
                   </div>
                   <span className="text-[11px] font-mono text-slate-500 uppercase">{t.symbol}</span>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-base font-black text-white font-mono">${(t.price * 1250).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                 <span className={`text-[10px] font-black ${t.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.change24h > 0 ? '+' : ''}{t.change24h}%</span>
               </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'earn' && (
        <EarnVault onSuccess={onEarnSuccess} />
      )}
    </div>
  );
};

export default Terminal;

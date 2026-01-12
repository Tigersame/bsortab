import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage, 
  SwapToast, 
  SwapSettings, 
  SwapSettingsSlippageDescription, 
  SwapSettingsSlippageInput, 
  SwapSettingsSlippageTitle 
} from '@coinbase/onchainkit/swap';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import type { Token } from '@coinbase/onchainkit/token';
import { BASE_TOKENS } from '../constants';
import EarnVault from './EarnVault';

interface TerminalProps {
  onSwap: () => void;
  onSharePnL: () => void;
  onEarnSuccess: () => void;
  onInteraction: (action: string) => void;
}

const TimeframeSelector = ({ active, onChange }: { active: string, onChange: (tf: any) => void }) => (
  <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800/50 mb-2">
    {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
      <button
        key={tf}
        onClick={() => onChange(tf)}
        className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
          active === tf ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        {tf}
      </button>
    ))}
  </div>
);

const MarketStats = ({ symbol }: { symbol: string }) => {
    // Mock data generation consistent with symbol
    const hash = useMemo(() => symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [symbol]);
    
    return (
        <div className="grid grid-cols-4 gap-2 py-3 px-1 border-t border-b border-slate-800/50 mb-4">
            <div className="text-center">
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Vol 24h</p>
                <p className="text-[10px] font-mono font-bold text-slate-300">${(hash / 100).toFixed(1)}M</p>
            </div>
             <div className="text-center">
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Mkt Cap</p>
                <p className="text-[10px] font-mono font-bold text-slate-300">${(hash / 10).toFixed(1)}M</p>
            </div>
             <div className="text-center">
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Holders</p>
                <p className="text-[10px] font-mono font-bold text-slate-300">{(hash * 12).toLocaleString()}</p>
            </div>
            <div className="text-center">
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">FDV</p>
                <p className="text-[10px] font-mono font-bold text-slate-300">${(hash / 8).toFixed(1)}M</p>
            </div>
        </div>
    )
}

const Terminal: React.FC<TerminalProps> = ({ onSwap, onSharePnL, onEarnSuccess, onInteraction }) => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'trade' | 'portfolio' | 'earn'>('trade');
  
  // Chart & Market State
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('ETH');
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1D');
  
  // Map App Tokens to OnchainKit Tokens
  const swappableTokens: Token[] = useMemo(() => {
    return BASE_TOKENS.map((t) => ({
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals || 18,
      image: t.logoUrl || '',
      chainId: 8453,
      address: (t.address || '') as "" | `0x${string}`, 
    }));
  }, []);

  const defaultFromToken = swappableTokens.find(t => t.symbol === 'ETH');
  const defaultToToken = swappableTokens.find(t => t.symbol === 'USDC');

  useEffect(() => {
    const data = [];
    const now = Date.now();
    let price = selectedChart === 'ETH' ? 3200 : selectedChart === 'BTC' ? 64000 : 100;
    
    let points = 24;
    let interval = 3600000;
    let volatility = 0.02;

    switch(timeframe) {
        case '1H': points = 60; interval = 60000; volatility = 0.005; break;
        case '1D': points = 24; interval = 3600000; volatility = 0.02; break;
        case '1W': points = 7; interval = 86400000; volatility = 0.05; break;
        case '1M': points = 30; interval = 86400000; volatility = 0.10; break;
        case '1Y': points = 12; interval = 2592000000; volatility = 0.20; break;
    }
    
    for (let i = points; i >= 0; i--) {
      const change = 1 + (Math.random() - 0.5) * volatility;
      price = Math.max(0.01, price * change); // Prevent negative prices
      data.push({
        time: new Date(now - i * interval).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: price
      });
    }
    setChartData(data);
  }, [selectedChart, activeTab, timeframe]);

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const startValue = chartData.length > 0 ? chartData[0].value : 1;
  const isPositive = latestValue >= startValue;
  const percentChange = startValue > 0 ? ((latestValue - startValue) / startValue) * 100 : 0;

  if (!defaultFromToken || !defaultToToken) {
      return <div className="p-8 text-center text-slate-500 text-xs font-mono animate-pulse">Loading Asset Data...</div>;
  }

  return (
    <div className="p-4 space-y-4 pb-32 relative h-full">
      {/* Navigation Tabs */}
      <div className="flex bg-[#0b1220] p-1 rounded-full border border-slate-800/50 sticky top-0 z-20 shadow-xl backdrop-blur-md">
        <button onClick={() => setActiveTab('trade')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'trade' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Trade</button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Assets</button>
        <button onClick={() => setActiveTab('earn')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'earn' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Earn</button>
      </div>

      {activeTab === 'trade' && (
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
            {!isConnected ? (
                 <div className="w-full relative min-h-[450px] flex flex-col items-center justify-center rounded-[2.5rem] bg-[#0b1220] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 mt-4">
                       <div className="absolute inset-0 opacity-20 blur-[3px] pointer-events-none">
                           <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={chartData}>
                                   <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" />
                               </AreaChart>
                           </ResponsiveContainer>
                       </div>
                       
                       <div className="relative z-10 p-8 text-center space-y-6 max-w-[280px] mx-auto">
                            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-white tracking-tight">Pro Trading Portal</h2>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                    Access institutional-grade tools on Base. Real-time charts, deep liquidity, and zero-fee social swaps.
                                </p>
                            </div>
                            <div className="flex justify-center pt-2">
                                <Wallet>
                                    <ConnectWallet className="!bg-blue-600 !text-white !font-black !px-8 !py-4 !rounded-2xl !h-auto hover:!bg-blue-500 !transition-all !shadow-xl !shadow-blue-500/20 !uppercase !tracking-widest !text-xs hover:scale-105" />
                                </Wallet>
                            </div>
                       </div>
                 </div>
            ) : (
                <>
                    <div className="w-full flex justify-between items-end px-2">
                         <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter">{selectedChart}</h1>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">PERP/USD</span>
                            </div>
                            <p className="text-sm font-mono text-slate-400">
                                ${latestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                         </div>
                         <div className={`text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            <p className="text-lg font-black tracking-tighter">{isPositive ? '+' : ''}{percentChange.toFixed(2)}%</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">24H Change</p>
                         </div>
                    </div>

                    <div className="w-full bg-[#0b1220] rounded-[1.5rem] overflow-hidden relative border border-white/5 shadow-lg animate-in fade-in pb-2">
                        <div className="p-4 pb-0">
                            <TimeframeSelector active={timeframe} onChange={setTimeframe} />
                        </div>
                        <div className="h-48 w-full pr-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                    <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0}/>
                                    </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#94a3b8' }}
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={isPositive ? "#3b82f6" : "#ef4444"} 
                                        strokeWidth={2} 
                                        fill="url(#colorVal2)" 
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="px-4">
                            <MarketStats symbol={selectedChart} />
                        </div>
                    </div>

                    <div className="w-full relative animate-in slide-in-from-bottom-2 bg-slate-900/30 rounded-[2rem] border border-white/5 p-1">
                        <Swap 
                            isSponsored={true}
                            onSuccess={onSwap}
                            onStatus={(status) => {
                               // Safeguard against undefined statusData
                               if (status.statusName === 'amountChange' && status.statusData && status.statusData.tokenFrom) {
                                   setSelectedChart(status.statusData.tokenFrom.symbol);
                               }
                            }}
                            className="w-full"
                        >
                            <div className="flex justify-between items-center mb-2 px-4 pt-4">
                                 <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                     Market Order
                                 </h2>
                                 <SwapSettings>
                                    <SwapSettingsSlippageTitle className="text-white font-bold mb-2">Max. Slippage</SwapSettingsSlippageTitle>
                                    <SwapSettingsSlippageDescription className="text-slate-400 mb-4 text-xs">
                                        Revert if price changes by more than %
                                    </SwapSettingsSlippageDescription>
                                    <SwapSettingsSlippageInput className="bg-[#0e1627] border border-slate-700 text-white rounded-xl p-2 outline-none focus:border-blue-500" />
                                </SwapSettings>
                            </div>
                            
                            <div className="flex flex-col gap-1 relative z-10 px-1">
                                <SwapAmountInput 
                                    label="Sell"
                                    swappableTokens={swappableTokens}
                                    token={defaultFromToken}
                                    type="from"
                                    className="bg-[#0e1627] !bg-opacity-80 border border-slate-800/50 rounded-t-[1.5rem] rounded-b-[0.8rem] p-4 pb-6 transition-all hover:bg-[#131b2e] shadow-sm"
                                />
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <SwapToggleButton className="w-10 h-10 rounded-full border-[4px] border-[#020617] bg-[#1e293b] text-white hover:bg-blue-600 hover:scale-110 transition-all shadow-xl flex items-center justify-center" />
                                </div>
                                
                                <SwapAmountInput 
                                    label="Buy"
                                    swappableTokens={swappableTokens}
                                    token={defaultToToken}
                                    type="to"
                                    className="bg-[#0e1627] !bg-opacity-80 border border-slate-800/50 rounded-b-[1.5rem] rounded-t-[0.8rem] p-4 pt-6 transition-all hover:bg-[#131b2e] shadow-sm"
                                />
                            </div>
                            
                            <div className="p-4 pt-6">
                                <SwapButton className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all" />
                            </div>

                            <div className="mx-4 mb-4 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
                                <SwapMessage className="text-[10px] font-medium text-slate-400 text-center" />
                            </div>
                            <SwapToast className="z-[100]" />
                        </Swap>
                    </div>
                </>
            )}
        </div>
      )}

      {activeTab === 'portfolio' && (
         <div className="space-y-4 animate-in fade-in">
             <div className="w-full p-4 rounded-[24px] bg-[#0b1220] border border-white/5">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Assets</h3>
                 <div className="space-y-3">
                    {BASE_TOKENS.map((token) => (
                        <div key={token.symbol} className="flex items-center justify-between p-3 rounded-2xl bg-[#0e1627] border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                                    <img src={token.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`} alt={token.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-white">{token.symbol}</span>
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${token.socialScore >= 90 ? 'bg-green-500/10 border-green-500/20 text-green-400' : token.socialScore >= 70 ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`} title="Social Score">
                                            <span className="text-[10px]">🔥</span>
                                            <span className="text-[9px] font-black tracking-wide">{token.socialScore}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px] block">{token.name}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono font-bold text-white">{isConnected ? (Math.random() * 2).toFixed(4) : "0.0000"}</p>
                                <p className="text-[9px] text-slate-600 font-mono">${isConnected ? (Math.random() * 50).toFixed(2) : "0.00"}</p>
                            </div>
                        </div>
                    ))}
                    
                    {!isConnected && (
                         <div className="mt-4 p-4 text-center">
                            <p className="text-[10px] text-slate-500 mb-3">Connect wallet to view your real positions</p>
                            <Wallet>
                                <ConnectWallet className="!h-8 !min-h-[32px] !px-4 !text-[10px] !font-bold !bg-slate-800 !text-white" />
                            </Wallet>
                        </div>
                    )}
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
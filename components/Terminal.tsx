"use client";

import { useState, useEffect, useMemo, useCallback, type FC } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Swap, 
  SwapAmountInput, 
  SwapButton, 
  SwapMessage, 
  SwapToast, 
} from '@coinbase/onchainkit/swap';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import type { Token } from '@coinbase/onchainkit/token';
import { BASE_TOKENS } from '../constants';
import EarnVault from './EarnVault';

// --- Types ---
interface TerminalProps {
  onSwap: () => void;
  onSharePnL: () => void;
  onEarnSuccess: () => void;
  onInteraction: (action: string) => void;
}

// --- Icons ---
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// --- Components ---

const TokenChip = ({ token, onClick }: { token: Token; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] active:scale-95 transition-all pl-1 pr-3 py-1.5 rounded-full cursor-pointer select-none group border border-transparent shadow-sm"
  >
    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-950 border border-slate-700/50">
        <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
    </div>
    <span className="text-base font-bold text-white tracking-tight group-hover:text-blue-200">{token.symbol}</span>
    <span className="text-slate-400 group-hover:text-white transition-colors">
        <ChevronDownIcon />
    </span>
  </button>
);

const TokenSelectorModal = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    tokens 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (token: Token) => void; 
    tokens: Token[];
}) => {
    const [search, setSearch] = useState('');
    
    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = tokens.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="bg-[#0f172a] w-full sm:w-[400px] sm:rounded-[2rem] rounded-t-[2rem] border-t border-x border-white/10 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/5 space-y-4 shrink-0">
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden mb-2" />
                    <h3 className="text-lg font-bold text-white text-center">Select Token</h3>
                    
                    {/* Search Input */}
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                            <SearchIcon />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search name or address"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#1e293b] border border-transparent rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:bg-[#262f45] transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Token List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                    {filtered.map((token) => (
                        <button
                            key={token.symbol}
                            onClick={() => { onSelect(token); onClose(); }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
                                    <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{token.name}</div>
                                    <div className="text-xs font-mono font-medium text-slate-500">{token.symbol}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono text-white">0.00</div>
                                <div className="text-xs font-medium text-slate-500">$0.00</div>
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                            No tokens found
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const TimeframeSelector = ({ active, onChange }: { active: string, onChange: (tf: any) => void }) => (
  <div className="flex bg-[#1e293b] p-0.5 rounded-xl border border-slate-800/50 mb-2">
    {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
      <button
        key={tf}
        onClick={() => onChange(tf)}
        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all ${
          active === tf ? 'bg-[#262f45] text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        {tf}
      </button>
    ))}
  </div>
);

const MarketStats = ({ symbol }: { symbol: string }) => {
    const hash = useMemo(() => symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [symbol]);
    return (
        <div className="grid grid-cols-4 gap-2 py-4 px-2 border-t border-slate-800/50">
            <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-semibold mb-1">Vol 24h</p>
                <p className="text-xs font-mono font-bold text-slate-200">${(hash / 100).toFixed(1)}M</p>
            </div>
             <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-semibold mb-1">Mkt Cap</p>
                <p className="text-xs font-mono font-bold text-slate-200">${(hash / 10).toFixed(1)}M</p>
            </div>
             <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-semibold mb-1">Holders</p>
                <p className="text-xs font-mono font-bold text-slate-200">{(hash * 12).toLocaleString()}</p>
            </div>
            <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-semibold mb-1">FDV</p>
                <p className="text-xs font-mono font-bold text-slate-200">${(hash / 8).toFixed(1)}M</p>
            </div>
        </div>
    )
}

const Terminal: FC<TerminalProps> = ({ onSwap, onSharePnL, onEarnSuccess, onInteraction }) => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'trade' | 'portfolio' | 'earn'>('trade');
  
  // Data State
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('ETH');
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1D');
  
  // Token State
  const swappableTokens: Token[] = useMemo(() => BASE_TOKENS.map((t) => ({
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals || 18,
      image: t.logoUrl || '',
      chainId: 8453,
      address: (t.address || '') as "" | `0x${string}`, 
  })), []);

  const [fromToken, setFromToken] = useState<Token>(swappableTokens.find(t => t.symbol === 'ETH') || swappableTokens[0]);
  const [toToken, setToToken] = useState<Token>(swappableTokens.find(t => t.symbol === 'USDC') || swappableTokens[1]);
  
  // Modal State
  const [modalType, setModalType] = useState<'from' | 'to' | null>(null);

  // Sync chart with From Token
  useEffect(() => {
    setSelectedChart(fromToken.symbol);
  }, [fromToken]);

  // Chart Data Simulation
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
      price = Math.max(0.01, price * change); 
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

  const handleManualSwap = useCallback(() => {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
  }, [fromToken, toToken]);

  return (
    <div className="flex flex-col h-full bg-[#020617]">
      {/* Modals */}
      <TokenSelectorModal 
        isOpen={modalType === 'from'}
        onClose={() => setModalType(null)}
        onSelect={(token) => { setFromToken(token); }}
        tokens={swappableTokens}
      />
      <TokenSelectorModal 
        isOpen={modalType === 'to'}
        onClose={() => setModalType(null)}
        onSelect={(token) => { setToToken(token); }}
        tokens={swappableTokens}
      />

      {/* Fixed Header Tabs */}
      <div className="px-4 pt-4 pb-2 bg-[#020617] sticky top-0 z-30">
        <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-slate-800">
          <button onClick={() => setActiveTab('trade')} className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${activeTab === 'trade' ? 'bg-[#0052FF] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Trade</button>
          <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#0052FF] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Assets</button>
          <button onClick={() => setActiveTab('earn')} className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${activeTab === 'earn' ? 'bg-[#0052FF] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Earn</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 space-y-4">
      {activeTab === 'trade' && (
        <div className="animate-in fade-in duration-300 space-y-4">
            {!isConnected ? (
                 <div className="w-full relative min-h-[420px] flex flex-col items-center justify-center rounded-[2rem] bg-[#0b1220] border border-slate-800/50 overflow-hidden shadow-2xl mt-4">
                       <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none">
                           <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={chartData}>
                                   <Area type="monotone" dataKey="value" stroke="#0052FF" fill="#0052FF" />
                               </AreaChart>
                           </ResponsiveContainer>
                       </div>
                       
                       <div className="relative z-10 p-8 text-center space-y-6 max-w-[260px] mx-auto">
                            <div className="w-20 h-20 bg-[#0052FF]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-2 border border-[#0052FF]/20 shadow-[0_0_30px_rgba(0,82,255,0.15)] animate-pulse">
                                    <svg className="w-10 h-10 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-white tracking-tighter">Start Trading</h2>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                    Connect your wallet to access institutional-grade swap routes and social alpha.
                                </p>
                            </div>
                            <div className="flex justify-center pt-2 w-full">
                                <Wallet>
                                    <ConnectWallet className="!w-full !bg-[#0052FF] !text-white !font-bold !px-6 !py-4 !rounded-2xl !h-auto hover:!bg-blue-600 !transition-all !shadow-lg !shadow-blue-600/20 !text-sm !uppercase !tracking-wider" />
                                </Wallet>
                            </div>
                       </div>
                 </div>
            ) : (
                <>
                    {/* Chart Card */}
                    <div className="w-full bg-[#0b1220] rounded-[2rem] overflow-hidden relative border border-slate-800 shadow-xl">
                        <div className="p-4 flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">{selectedChart}</h1>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">USD</span>
                                </div>
                                <p className="text-lg font-mono text-slate-300">
                                    ${latestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                             </div>
                             <div className={`text-right ${isPositive ? 'text-[#00C853]' : 'text-[#FF3D00]'}`}>
                                <p className="text-sm font-bold tracking-tight">{isPositive ? '+' : ''}{percentChange.toFixed(2)}%</p>
                             </div>
                        </div>

                        <div className="h-40 w-full pr-0 -mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#0052FF" : "#FF3D00"} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={isPositive ? "#0052FF" : "#FF3D00"} stopOpacity={0}/>
                                    </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '10px' }}
                                        itemStyle={{ color: '#94a3b8' }}
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={isPositive ? "#0052FF" : "#FF3D00"} 
                                        strokeWidth={2} 
                                        fill="url(#colorVal)" 
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="px-4 pb-2">
                            <TimeframeSelector active={timeframe} onChange={setTimeframe} />
                            <MarketStats symbol={selectedChart} />
                        </div>
                    </div>

                    {/* Swap Module */}
                    <div className="w-full relative">
                        <Swap 
                            isSponsored={true}
                            onSuccess={onSwap}
                            className="w-full space-y-2"
                        >
                            <div className="flex flex-col relative gap-1">
                                {/* Sell Card */}
                                <div className="bg-[#0f172a] rounded-[1.25rem] p-4 border border-transparent hover:border-white/5 transition-colors relative z-10">
                                     <div className="flex justify-between mb-3">
                                         <label className="text-sm font-medium text-slate-400">Sell</label>
                                     </div>
                                     <div className="flex justify-between items-center gap-3">
                                         <div className="flex-1 min-w-0">
                                              <SwapAmountInput 
                                                  label=""
                                                  token={fromToken}
                                                  type="from"
                                                  className="w-full !bg-transparent !border-none !p-0 [&_button]:!hidden !text-4xl !font-medium !text-white placeholder:!text-slate-600 font-mono"
                                              />
                                         </div>
                                         <TokenChip token={fromToken} onClick={() => setModalType('from')} />
                                     </div>
                                     <div className="mt-1 text-sm text-slate-500 font-medium">$0.00</div>
                                </div>

                                {/* Floating Swap Action */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <button 
                                        onClick={handleManualSwap}
                                        className="w-10 h-10 bg-[#020617] border-[3px] border-[#020617] rounded-xl text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-lg active:scale-95 group"
                                    >
                                        <div className="group-hover:rotate-180 transition-transform duration-500">
                                            <ArrowDownIcon />
                                        </div>
                                    </button>
                                </div>
                                
                                {/* Buy Card */}
                                <div className="bg-[#0f172a] rounded-[1.25rem] p-4 border border-transparent hover:border-white/5 transition-colors relative z-10">
                                     <div className="flex justify-between mb-3">
                                         <label className="text-sm font-medium text-slate-400">Buy</label>
                                     </div>
                                     <div className="flex justify-between items-center gap-3">
                                         <div className="flex-1 min-w-0">
                                              <SwapAmountInput 
                                                  label=""
                                                  token={toToken}
                                                  type="to"
                                                  className="w-full !bg-transparent !border-none !p-0 [&_button]:!hidden !text-4xl !font-medium !text-white placeholder:!text-slate-600 font-mono"
                                              />
                                         </div>
                                         <TokenChip token={toToken} onClick={() => setModalType('to')} />
                                     </div>
                                     <div className="mt-1 text-sm text-slate-500 font-medium">$0.00</div>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <SwapButton className="w-full !py-4 !bg-[#0052FF] hover:!bg-[#0040DD] !text-white !rounded-[1.25rem] !font-black !text-base !uppercase !tracking-widest !shadow-lg !shadow-blue-600/20 active:!scale-[0.98] transition-all" />
                            </div>

                            <div className="mt-2">
                                <SwapMessage className="text-xs font-medium text-slate-400 text-center" />
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
             <div className="w-full p-4 rounded-[2rem] bg-[#0b1220] border border-slate-800">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Assets</h3>
                 <div className="space-y-3">
                    {BASE_TOKENS.map((token) => (
                        <div key={token.symbol} className="flex items-center justify-between p-3 rounded-2xl bg-[#1e293b] border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                                    <img src={token.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`} alt={token.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{token.symbol}</span>
                                        {/* Enhanced Social Score Badge */}
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                                            token.socialScore >= 90 
                                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                                                : token.socialScore >= 70 
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                                                    : 'bg-slate-800 border-slate-700 text-slate-500'
                                        }`} title={`Social Score: ${token.socialScore}/100`}>
                                            <span className="text-[9px]">{token.socialScore >= 90 ? '🔥' : token.socialScore >= 70 ? '⚡' : '💧'}</span>
                                            <span className="text-[9px] font-black tracking-wide">{token.socialScore}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px] block">{token.name}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono font-bold text-white">{isConnected ? (Math.random() * 2).toFixed(4) : "0.0000"}</p>
                                <p className="text-[10px] text-slate-500 font-mono">${isConnected ? (Math.random() * 50).toFixed(2) : "0.00"}</p>
                            </div>
                        </div>
                    ))}
                    
                    {!isConnected && (
                         <div className="mt-4 p-4 text-center">
                            <p className="text-xs text-slate-400 mb-3">Connect wallet to view your real positions</p>
                            <Wallet>
                                <ConnectWallet className="!h-9 !px-4 !text-xs !font-bold !bg-slate-800 !text-white !rounded-lg" />
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
    </div>
  );
};

export default Terminal;
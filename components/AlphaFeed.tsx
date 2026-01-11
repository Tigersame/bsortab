
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_TOKENS } from '../constants';
import { Token } from '../types';
import { sdk } from "../farcasterSdk";

interface AlphaFeedProps {
  onBuyAlpha: () => void;
  onShare: () => void;
  onInteraction: (action: string) => void;
}

const AlphaFeed: React.FC<AlphaFeedProps> = ({ onBuyAlpha, onShare, onInteraction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});
  const [loadingSub, setLoadingSub] = useState<string | null>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      setActiveIndex(index);
    }
  };

  const handleOpenToken = (e: React.MouseEvent, address?: string) => {
    e.stopPropagation();
    // Default to WETH address if mock token has none, for demo purposes
    const target = address || '0x4200000000000000000000000000000000000006';
    sdk.actions.openUrl(`https://basescan.org/token/${target}`);
    onInteraction('OPEN_TOKEN_DETAILS');
  };

  const handleOpenProfile = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    // Clean username and open Warpcast profile
    const handle = username.replace('@', '');
    sdk.actions.openUrl(`https://warpcast.com/${handle}`);
  };

  const handleSubscribe = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (subscribed[symbol] || loadingSub) return;
    
    setLoadingSub(symbol);
    try {
        const result = await sdk.actions.addMiniApp();
        if (result.added) {
            setSubscribed(prev => ({...prev, [symbol]: true}));
            onInteraction('ENABLE_NOTIFICATIONS');
        }
    } catch (err) {
        console.error("Failed to subscribe", err);
    } finally {
        setLoadingSub(null);
    }
  };

  const CreatorCard = ({ token, isActive }: { token: Token, isActive: boolean }) => (
    <div className="h-full w-full snap-center relative flex flex-col justify-between overflow-hidden bg-slate-950 flex-shrink-0">
       {/* Immersive Background */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950"></div>
          {/* Simulated abstract dynamic background based on token name */}
          <div className={`w-full h-full opacity-30 bg-[url('https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}&scale=200')] bg-cover bg-center blur-xl transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent opacity-50"></div>
       </div>

       {/* Top Bar */}
       <div className="relative z-10 p-6 flex justify-between items-start pt-8">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={(e) => handleOpenToken(e, token.address)}
          >
             <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-black shadow-lg group-hover:scale-105 transition-transform group-hover:border-blue-400">
                <img src={token.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`} className="w-full h-full object-cover" alt={token.name} />
             </div>
             <div>
                <h3 className="text-white font-black text-sm drop-shadow-md flex items-center gap-1">
                    {token.name}
                    <svg className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </h3>
                <span 
                    onClick={(e) => handleOpenProfile(e, token.creator)}
                    className="text-blue-400 font-mono text-xs font-bold bg-blue-500/10 px-2 py-0.5 rounded-full backdrop-blur-md hover:bg-blue-500/20 transition-colors"
                >
                    @{token.creator}
                </span>
             </div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className={`text-lg font-black font-mono drop-shadow-md ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.change24h > 0 ? '+' : ''}{token.change24h}%
             </span>
             
             {/* Bell / Subscribe Button */}
             <button 
                onClick={(e) => handleSubscribe(e, token.symbol)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${subscribed[token.symbol] ? 'bg-yellow-500 border-yellow-400 text-slate-950' : 'bg-slate-900/50 border-white/20 text-white hover:bg-white/20'}`}
             >
                {loadingSub === token.symbol ? (
                   <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                   <svg className="w-4 h-4" fill={subscribed[token.symbol] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                   </svg>
                )}
             </button>
          </div>
       </div>

       {/* Center Content / Chart Visual (Simplified) */}
       <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
           {isActive && (
              <div className="text-center space-y-2 animate-in zoom-in-95 duration-700">
                  <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter drop-shadow-2xl">
                    ${token.symbol}
                  </h1>
                  <div className="flex gap-2 justify-center">
                    {token.tags?.map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900/40 px-2 py-1 rounded-lg border border-white/5">#{tag}</span>
                    ))}
                  </div>
              </div>
           )}
       </div>

       {/* Bottom Actions & Info */}
       <div className="relative z-10 p-6 pb-24 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent space-y-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Alpha Signal</span>
             </div>
             <p className="text-sm font-medium text-slate-100 leading-relaxed drop-shadow-sm max-w-[90%]">
               {token.description || "Awaiting signal analysis..."}
             </p>
             <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                <span>Mkt Cap: <span className="text-white">${(token.marketCap / 1000000).toFixed(1)}M</span></span>
                <span>Vol: <span className="text-white">${(token.volume24h / 1000).toFixed(1)}K</span></span>
             </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
             <button 
                onClick={onBuyAlpha}
                className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
             >
                <span>Ape In</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </button>
             <button 
                onClick={onShare}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 active:scale-95 transition-all hover:bg-slate-800 hover:text-white"
             >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
             </button>
          </div>
       </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black"
      style={{ height: 'calc(100vh - 140px)' }} // Adjust for Layout header/footer
    >
       {MOCK_TOKENS.map((token, index) => (
          <CreatorCard key={token.symbol} token={token} isActive={index === activeIndex} />
       ))}
       <div className="h-24 w-full snap-center flex items-center justify-center text-slate-600 font-mono text-xs">
          End of Feed
       </div>
    </div>
  );
};

export default AlphaFeed;


import React, { useState } from 'react';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onClaim: () => void;
  onGm: () => boolean;
  onShare: () => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onClaim, onGm, onShare, isAuthenticated, onSignIn }) => {
  const [claiming, setClaiming] = useState(false);
  const levelProgress = ((user.xp % 500) / 500) * 100;

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => {
      onClaim();
      setClaiming(false);
    }, 2000);
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'ELITE': return 'from-amber-400 via-amber-500 to-amber-700';
      case 'GOLD': return 'from-yellow-300 via-yellow-500 to-yellow-600';
      case 'SILVER': return 'from-slate-300 via-slate-400 to-slate-500';
      default: return 'from-orange-400 via-orange-500 to-orange-600';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Identity Card */}
      <div className={`p-8 rounded-[3rem] bg-gradient-to-br ${getTierColor(user.tier)} text-slate-950 relative overflow-hidden shadow-2xl border-4 border-slate-950/20 shadow-blue-500/10`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"></path></svg>
        </div>
        <div className="relative z-10 space-y-8">
           <Identity address={user.address as `0x${string}`} className="!flex-row !gap-6">
             <Avatar className="!w-24 !h-24 !rounded-[2.5rem] !border-4 !border-white/30 !p-1 !bg-slate-950/20 !backdrop-blur-xl shadow-2xl" />
             <div className="flex flex-col justify-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Base Identity</span>
               <Name className="!text-3xl !font-black !tracking-tighter !leading-none !text-slate-950" />
               <Address className="!text-[11px] !font-mono !font-bold !opacity-60 !text-slate-950 mt-1" />
             </div>
           </Identity>
           
           <div className="flex flex-wrap gap-2 items-center">
             {user.badges.map((badge) => (
               <div 
                  key={badge} 
                  className="px-3 py-1.5 rounded-xl bg-slate-950/40 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-slate-950" 
               >
                 {badge}
               </div>
             ))}
             {!isAuthenticated && (
                <button 
                  onClick={onSignIn}
                  className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-[9px] font-black uppercase tracking-widest text-slate-950 hover:bg-white/40 transition-colors animate-pulse"
                >
                  + Verify Farcaster
                </button>
             )}
           </div>

           <div className="flex justify-between items-end border-t border-slate-950/20 pt-6">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Social Reputation</p>
               <p className="text-5xl font-black tracking-tighter leading-none">{user.reputation}</p>
             </div>
             <div className="bg-slate-950 text-white px-5 py-2.5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl border border-white/10">
               {user.tier} TIER
             </div>
           </div>
        </div>
      </div>

      {/* Social Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onGm} className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-800 group transition-all text-center active:scale-95">
          <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform">☀️</span>
          <p className="text-[11px] font-black uppercase tracking-widest text-white">Daily GM</p>
          <span className="text-[9px] font-mono text-slate-500">+10 XP</span>
        </button>
        <button onClick={onShare} className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-800 group transition-all text-center active:scale-95">
          <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform">🚀</span>
          <p className="text-[11px] font-black uppercase tracking-widest text-white">Share OS</p>
          <span className="text-[9px] font-mono text-slate-500">+25 XP</span>
        </button>
      </div>

      {/* XP Engine */}
      <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-blue-500/20 space-y-6 shadow-xl">
        <div className="flex justify-between items-center">
           <div>
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">On-Chain Pending</span>
             <p className="text-4xl font-black text-white font-mono">{user.pendingXp} XP</p>
           </div>
           <button 
             onClick={handleClaim}
             disabled={user.pendingXp === 0 || claiming}
             className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${claiming ? 'bg-slate-800 text-blue-400 cursor-wait' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 active:scale-95 active:glow'}`}
           >
             {claiming && <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
             {claiming ? 'SYNCING...' : 'SYNC ON-CHAIN'}
           </button>
        </div>
        
        <div className="space-y-3 pt-2">
           <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase">
             <span>Level {user.level}</span>
             <span className="text-slate-400">Total: {user.xp.toLocaleString()}</span>
           </div>
           <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
             <div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
           </div>
           <p className="text-[9px] text-slate-600 text-center uppercase font-bold tracking-tighter">Current progress to Level {user.level + 1}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

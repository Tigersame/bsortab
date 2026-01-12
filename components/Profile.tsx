"use client";

import { useState, type FC } from 'react';
import { Identity, Avatar, Name } from '@coinbase/onchainkit/identity';
import { UserProfile } from '../types';
import { XP_REWARDS } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onClaim: () => void;
  onGm: () => boolean;
  onShare: () => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onEnableNotifications: () => void;
  onInteraction: (action: string) => void;
}

const Profile: FC<ProfileProps> = ({ user, onClaim, onGm, onShare, isAuthenticated, onSignIn, onEnableNotifications, onInteraction }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [claiming, setClaiming] = useState(false);
  
  const levelProgress = ((user.xp % 500) / 500) * 100;
  const nextLevelXp = (Math.floor(user.xp / 500) + 1) * 500;

  // Use a fallback zero address to prevent Avatar crash if user is not connected
  const validAddress = (user.address && user.address.startsWith('0x')) 
    ? user.address as `0x${string}` 
    : '0x0000000000000000000000000000000000000000';

  const handleClaim = () => {
    if (user.pendingXp === 0) return;
    setClaiming(true);
    // Simulation of Onchain Transaction
    setTimeout(() => {
      onClaim();
      setClaiming(false);
      onInteraction('CLAIM_XP');
    }, 2500);
  };

  const handleGm = () => {
    if (onGm()) {
        // success handled by parent
    }
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
    <div className="p-4 space-y-6 pb-32 w-full max-w-full overflow-x-hidden">
      {/* Identity Card */}
      <div className={`p-8 rounded-[3rem] bg-gradient-to-br ${getTierColor(user.tier)} text-slate-950 relative overflow-hidden shadow-2xl border-4 border-slate-950/20`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"></path></svg>
        </div>
        <div className="relative z-10 space-y-8">
           <Identity address={validAddress} className="!flex-row !gap-6">
             <Avatar className="!w-24 !h-24 !rounded-[2.5rem] !border-4 !border-white/30 !p-1 !bg-slate-950/20 !backdrop-blur-xl shadow-2xl" />
             <div className="flex flex-col justify-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Base Identity</span>
               {user.username ? (
                   <span className="text-3xl font-black tracking-tighter leading-none text-slate-950">@{user.username}</span>
               ) : (
                   <Name className="!text-3xl !font-black !tracking-tighter !leading-none !text-slate-950" />
               )}
             </div>
           </Identity>
           
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

      {/* Profile Details Portal */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
        {/* Portal Header */}
        <div className="p-1 m-1 bg-slate-950 rounded-[2rem] flex sticky top-0 z-20">
           <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Overview</button>
           <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>History</button>
        </div>

        <div className="p-6">
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                     {/* XP Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Experience</h3>
                                <p className="text-4xl font-black text-white font-mono">{user.xp.toLocaleString()} <span className="text-sm text-slate-500">XP</span></p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level {user.level}</span>
                                <p className="text-xs font-bold text-slate-400">{nextLevelXp - user.xp} XP to next level</p>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Pending Claims */}
                    <div className="p-5 rounded-3xl bg-indigo-900/20 border border-indigo-500/20 space-y-4 relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Unclaimed XP</span>
                                <p className="text-3xl font-black text-white font-mono">{user.pendingXp} XP</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Network Fee</span>
                                <span className="text-xs font-mono text-slate-400">~0.00005 ETH</span>
                            </div>
                        </div>

                        {/* Onchain Fee Visual */}
                        <div className="flex items-center gap-2 p-2 bg-slate-950/50 rounded-xl border border-indigo-500/10">
                           <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                           </div>
                           <p className="text-[9px] text-slate-400 font-medium">Claiming syncs your social graph on-chain. Gas fees apply.</p>
                        </div>

                        <button 
                             onClick={handleClaim}
                             disabled={user.pendingXp === 0 || claiming}
                             className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10 ${claiming ? 'bg-slate-800 text-indigo-400 cursor-wait' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 active:scale-95 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                             {claiming ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying Onchain...</span>
                                </>
                             ) : (
                                <>
                                    <span>Claim Rewards</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </>
                             )}
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Win Rate</span>
                            <span className="text-xl font-black text-white">{user.winRate}%</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Followers</span>
                            <span className="text-xl font-black text-white">{user.followers}</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4 animate-in fade-in">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Recent Gains</h3>
                     <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pb-10">
                        {user.xpHistory.length === 0 ? (
                            <div className="text-center py-12 text-[10px] text-slate-600 font-mono border-2 border-dashed border-slate-800 rounded-2xl">
                                No history yet. Start trading to earn XP!
                            </div>
                        ) : (
                            [...user.xpHistory].reverse().map((entry) => (
                                 <div key={entry.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs">✨</div>
                                         <div>
                                             <p className="text-[10px] font-black text-white uppercase">{entry.action.replace(/_/g, ' ')}</p>
                                             <p className="text-[9px] text-slate-500 font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                                         </div>
                                     </div>
                                     <span className="text-xs font-black text-green-400">+{entry.amount} XP</span>
                                 </div>
                            ))
                        )}
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
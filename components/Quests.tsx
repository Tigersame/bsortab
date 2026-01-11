
import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { XP_REWARDS } from '../constants';

interface QuestsProps {
  user: UserProfile;
  onInteraction: (action: string) => void;
  onNavigate: (view: ViewState) => void;
  onClaim: () => void;
}

const Quests: React.FC<QuestsProps> = ({ user, onInteraction, onNavigate, onClaim }) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = () => {
    if (user.pendingXp === 0) return;
    setClaiming(true);
    setTimeout(() => {
      onClaim();
      setClaiming(false);
      onInteraction('CLAIM_XP');
    }, 2500);
  };

  const handleTaskAction = (key: string) => {
    switch (key) {
        case 'SWAP':
            onNavigate('terminal');
            break;
        case 'BUY_ALPHA':
            onNavigate('feed');
            break;
        case 'DEPLOY_TOKEN':
        case 'GENERATE_METADATA':
        case 'SAVE_PRECLANK':
            onNavigate('launcher');
            break;
        case 'DAILY_GM':
            onInteraction('DAILY_GM');
            break;
        case 'CHECK_LEADERBOARD':
            onNavigate('leaderboard');
            break;
        default:
            onInteraction(key); // Just trigger interaction for generic tasks
            break;
    }
  };

  const getTaskLabel = (key: string) => {
    const labels: Record<string, string> = {
        SWAP: "Execute a Trade",
        DAILY_GM: "Say GM",
        BUY_ALPHA: "Ape into Alpha",
        SHARE: "Share on Farcaster",
        SHARE_PNL: "Flex your PnL",
        FOLLOW: "Follow Creator",
        ENABLE_NOTIFICATIONS: "Turn on Notifs",
        VIEW_CHART: "Analyze a Chart",
        GENERATE_METADATA: "Dream a Token",
        SAVE_PRECLANK: "Config Preclank",
        DEPLOY_TOKEN: "Launch on Clanker",
        CONNECT_WALLET: "Link Wallet",
        CHECK_LEADERBOARD: "Scout Rankings",
        OPEN_TOKEN_DETAILS: "Do Your Research",
        SWITCH_TAB: "Explore App"
    };
    return labels[key] || key.replace(/_/g, ' ');
  };

  const getTaskIcon = (key: string) => {
      // Map keys to emojis or icons
      if (key.includes('SWAP')) return '💸';
      if (key.includes('GM')) return '☀️';
      if (key.includes('ALPHA')) return '🦍';
      if (key.includes('SHARE')) return '📣';
      if (key.includes('DEPLOY') || key.includes('LAUNCH')) return '🚀';
      if (key.includes('CHART')) return '📈';
      return '💎';
  };

  return (
    <div className="p-4 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between pt-2">
           <div>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Earn XP</h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complete Quests • Level Up • Get Airdrops</p>
           </div>
           <div className="w-12 h-12 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center">
               <span className="text-xl">⚡</span>
           </div>
       </div>

       {/* Pending Claim Card */}
       <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-slate-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Unclaimed Rewards</span>
                        <h3 className="text-4xl font-black text-white font-mono tracking-tighter">{user.pendingXp} <span className="text-sm">XP</span></h3>
                    </div>
                    {user.pendingXp > 0 && (
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20 animate-pulse">
                            Ready
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-6 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">Network Fee: ~0.00005 ETH (Syncs Social Graph)</span>
                </div>

                <button 
                    onClick={handleClaim}
                    disabled={user.pendingXp === 0 || claiming}
                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${claiming ? 'bg-slate-800 text-indigo-400 cursor-wait' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 active:scale-95 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                >
                    {claiming ? (
                        <>
                            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            <span>Verifying Onchain...</span>
                        </>
                    ) : (
                        <span>Claim Onchain</span>
                    )}
                </button>
            </div>
       </div>

       {/* Daily Check-in Highlight */}
       <div className="p-1 rounded-[2rem] bg-gradient-to-r from-yellow-500 to-orange-500">
           <div className="bg-slate-950 rounded-[1.9rem] p-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                   <div className="text-3xl">☀️</div>
                   <div>
                       <h4 className="text-sm font-black text-white uppercase">Daily GM</h4>
                       <p className="text-[9px] text-slate-400">Streak: 3 Days</p>
                   </div>
               </div>
               <button 
                   onClick={() => handleTaskAction('DAILY_GM')}
                   className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-white hover:bg-slate-800 hover:border-yellow-500 transition-colors"
               >
                   Check In
               </button>
           </div>
       </div>

       {/* Task List */}
       <div className="space-y-3 pb-8">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Available Quests</h3>
           {Object.entries(XP_REWARDS).map(([key, value]) => {
               if (key === 'DAILY_GM') return null; // Handled above
               return (
                   <div key={key} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-blue-500/30 transition-colors group">
                       <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-xl shadow-inner">
                               {getTaskIcon(key)}
                           </div>
                           <div>
                               <h4 className="text-xs font-black text-white">{getTaskLabel(key)}</h4>
                               <p className="text-[9px] text-blue-400 font-bold">+{value} XP</p>
                           </div>
                       </div>
                       <button 
                           onClick={() => handleTaskAction(key)}
                           className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors"
                       >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                       </button>
                   </div>
               );
           })}
       </div>
    </div>
  );
};

export default Quests;

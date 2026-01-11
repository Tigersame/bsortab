
import React, { useState } from 'react';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
import { MOCK_LEADERBOARD } from '../constants';

const Leaderboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<'xp' | 'reputation'>('xp');

  const sortedUsers = [...MOCK_LEADERBOARD].sort((a, b) => b[sortBy] - a[sortBy]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return { color: 'text-yellow-400', label: '1ST', bg: 'bg-yellow-400/20 border-yellow-400/40' };
      case 1: return { color: 'text-slate-300', label: '2ND', bg: 'bg-slate-300/20 border-slate-300/40' };
      case 2: return { color: 'text-amber-600', label: '3RD', bg: 'bg-amber-600/20 border-amber-600/40' };
      default: return { color: 'text-slate-500', label: `${index + 1}TH`, bg: 'bg-slate-800/40 border-slate-800/60' };
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Global Rankings</h2>
        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">The elite of BSORTAB Social OS</p>
      </div>

      {/* Sort Toggle */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
        <button 
          onClick={() => setSortBy('xp')} 
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${sortBy === 'xp' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          By XP
        </button>
        <button 
          onClick={() => setSortBy('reputation')} 
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${sortBy === 'reputation' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          By Reputation
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {sortedUsers.map((user, index) => {
          const rank = getRankBadge(index);
          return (
            <div 
              key={user.address} 
              className={`group flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 ${index < 3 ? 'bg-slate-900/80 border-blue-500/20 shadow-xl shadow-blue-500/5' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Indicator */}
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-[10px] transition-transform group-hover:scale-110 ${rank.bg} ${rank.color}`}>
                  {rank.label}
                </div>

                {/* OnchainKit Identity */}
                <div className="flex items-center gap-3">
                  <Identity address={user.address as `0x${string}`} className="!flex-row !gap-3">
                    <Avatar className="!w-10 !h-10 !rounded-xl !bg-slate-800" />
                    <div className="flex flex-col">
                      <Name className="!text-sm !font-black !text-white" />
                      <Address className="!text-[9px] !font-mono !text-slate-500" />
                    </div>
                  </Identity>
                </div>
              </div>

              {/* Value Display */}
              <div className="text-right">
                <p className="text-sm font-black text-blue-400 font-mono tracking-tighter">
                  {sortBy === 'xp' ? `${user.xp.toLocaleString()} XP` : `${user.reputation} REP`}
                </p>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                  Tier: {user.tier}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 text-center">
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          Rankings are updated every epoch. High Reputation users unlock boosted social alpha features and lower swap fees.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;

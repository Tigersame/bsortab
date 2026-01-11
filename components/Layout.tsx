
import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeView, onNavigate, children }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border-x border-slate-800 bg-slate-950 text-slate-50 relative overflow-hidden font-sans selection:bg-blue-500/30 shadow-2xl">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3" onClick={() => onNavigate('feed')}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer">B</div>
          <div className="cursor-pointer">
            <h1 className="text-xl font-black tracking-tighter text-white font-mono leading-none">BASELINES</h1>
            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Social Trading OS</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 ${activeView === 'feed' ? 'overflow-hidden' : 'overflow-y-auto pb-32'} scroll-smooth no-scrollbar`}>
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-panel border-t border-slate-800 px-4 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem]">
        <NavButton active={activeView === 'feed'} icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h10M7 12h10M7 16h10" label="Tok" onClick={() => onNavigate('feed')} />
        <NavButton active={activeView === 'terminal'} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" label="Trade" onClick={() => onNavigate('terminal')} />
        
        {/* Launch Button (Center/Prominent) */}
        <button onClick={() => onNavigate('launcher')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeView === 'launcher' ? 'text-blue-500 scale-110' : 'text-slate-400 hover:text-white'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${activeView === 'launcher' ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-slate-800 border border-slate-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
        </button>

        <NavButton active={activeView === 'quests'} icon="M13 10V3L4 14h7v7l9-11h-7z" label="Earn" onClick={() => onNavigate('quests')} />
        <NavButton active={activeView === 'profile'} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Social" onClick={() => onNavigate('profile')} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick, className = "" }: { active: boolean, icon: string, label: string, onClick: () => void, className?: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'} ${className}`}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default Layout;

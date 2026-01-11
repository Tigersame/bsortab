
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { sdk } from "./farcasterSdk";
import Layout from './components/Layout';
import AlphaFeed from './components/AlphaFeed';
import Terminal from './components/Terminal';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import BaseCheckout from './components/BaseCheckout';
import CreatorLauncher from './components/CreatorLauncher';
import Quests from './components/Quests';
import Onboarding from './components/Onboarding';
import { ViewState, UserProfile } from './types';
import { EMPTY_USER, XP_REWARDS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // XP Notification State
  const [xpNotification, setXpNotification] = useState<{amount: number, label: string} | null>(null);

  const queryClient = useMemo(() => new QueryClient(), []);
  
  // Production Config for Base Mainnet
  const wagmiConfig = useMemo(() => createConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
  }), []);

  useEffect(() => {
    const init = async () => {
      // Check onboarding status
      const onboardingSeen = localStorage.getItem('baselines_onboarding_v1');
      if (!onboardingSeen) {
        setShowOnboarding(true);
      }

      // Load Farcaster Context
      try {
        const context = await sdk.context; 
        if (context && context.user) {
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            fid: context.user.fid,
            username: context.user.username || prev.username,
          }));
        }
      } catch (e) {
        console.warn("Farcaster context unavailable");
      }
      
      setIsReady(true);
    };
    init();
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('baselines_onboarding_v1', 'true');
    setShowOnboarding(false);
    awardXp('CONNECT_WALLET');
  };

  const apiKey = process.env.API_KEY || '';

  const awardXp = useCallback((action: string) => {
      const amount = XP_REWARDS[action as keyof typeof XP_REWARDS] || 0;
      if (amount === 0) return;

      setUser(prev => ({ 
          ...prev, 
          pendingXp: prev.pendingXp + amount,
          xpHistory: [...prev.xpHistory, { id: Math.random().toString(), action, amount, timestamp: Date.now() }]
      }));

      setXpNotification({ amount, label: action.replace(/_/g, ' ') });
      setTimeout(() => setXpNotification(null), 3000);
  }, []);

  const handleShare = useCallback((type: string, data?: any) => {
    const text = type === 'pnl' 
      ? `BASELINES Trade OS: Just locked in profit on Base! 🚀`
      : `Found Alpha on BASELINES. Don't fade the social signals. 🔥`;
    
    try {
      sdk.actions.composeCast({
        text,
        embeds: ['https://baselines.app']
      });
      awardXp(type === 'pnl' ? 'SHARE_PNL' : 'SHARE');
    } catch (e) {
      console.error("Share failed", e);
    }
  }, [awardXp]);

  const signIn = async () => {
    try {
      const { token } = await sdk.quickAuth.getToken();
      if (token) {
        setIsAuthenticated(true);
        setUser(prev => ({
          ...prev,
          badges: [...prev.badges.filter(b => b !== 'Verified'), 'Verified'],
          reputation: prev.reputation + 100 
        }));
        awardXp('CONNECT_WALLET');
      }
    } catch (e) {
      console.error("Authentication failed:", e);
    }
  };

  const handleEnableNotifications = () => {
    setUser(prev => ({
        ...prev,
        notificationsEnabled: true,
        badges: prev.badges.includes('Notified') ? prev.badges : [...prev.badges, 'Notified'],
    }));
    awardXp('ENABLE_NOTIFICATIONS');
  };

  const claimOnChainXp = () => {
    setUser(prev => ({
      ...prev,
      xp: prev.xp + prev.pendingXp,
      pendingXp: 0,
      level: Math.floor((prev.xp + prev.pendingXp) / 500) + 1,
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'feed': return <AlphaFeed onBuyAlpha={() => awardXp('BUY_ALPHA')} onShare={() => handleShare('alpha')} onInteraction={awardXp} />;
      case 'terminal': return <Terminal onSwap={() => awardXp('SWAP')} onSharePnL={() => handleShare('pnl')} onEarnSuccess={() => awardXp('SWAP')} onInteraction={awardXp} />;
      case 'leaderboard': return <Leaderboard onInteraction={awardXp} />;
      case 'checkout': return <BaseCheckout />;
      case 'quests': return <Quests user={user} onInteraction={awardXp} onNavigate={setCurrentView} onClaim={claimOnChainXp} />;
      case 'launcher': return <CreatorLauncher onLaunch={() => { awardXp('DEPLOY_TOKEN'); setCurrentView('feed'); }} onInteraction={awardXp} isAuthenticated={isAuthenticated} />;
      case 'profile': return (
        <Profile 
          user={user} 
          onClaim={claimOnChainXp} 
          onGm={() => { awardXp('DAILY_GM'); return true; }} 
          onShare={() => handleShare('profile')} 
          isAuthenticated={isAuthenticated} 
          onSignIn={signIn}
          onEnableNotifications={handleEnableNotifications}
          onInteraction={awardXp}
        />
      );
      default: return <AlphaFeed onBuyAlpha={() => awardXp('BUY_ALPHA')} onShare={() => handleShare('alpha')} onInteraction={awardXp} />;
    }
  };

  if (!isReady) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Initializing BASELINES...</p>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider chain={base} apiKey={apiKey}>
           {showOnboarding ? (
             <Onboarding onComplete={handleOnboardingComplete} />
           ) : (
             <Layout activeView={currentView} onNavigate={setCurrentView}>
               {renderContent()}
               
               {/* XP Toast Notification */}
               {xpNotification && (
                   <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-md border border-blue-500/30 px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-3 pointer-events-none">
                       <span className="text-xl">✨</span>
                       <div>
                           <p className="text-xs font-black text-white uppercase tracking-wider">{xpNotification.label}</p>
                           <p className="text-[10px] font-bold text-blue-400">+{xpNotification.amount} XP</p>
                       </div>
                   </div>
               )}
             </Layout>
           )}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

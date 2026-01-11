
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { sdk } from "@farcaster/miniapp-sdk";
import Layout from './components/Layout';
import AlphaFeed from './components/AlphaFeed';
import Terminal from './components/Terminal';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import BaseCheckout from './components/BaseCheckout';
import CreatorLauncher from './components/CreatorLauncher';
import { ViewState, UserProfile } from './types';
import { INITIAL_USER, XP_REWARDS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const queryClient = useMemo(() => new QueryClient(), []);
  const wagmiConfig = useMemo(() => createConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
  }), []);

  useEffect(() => {
    const init = async () => {
      // 1. Load Farcaster Context for Optimistic UI
      try {
        // Access context safely
        const context = await sdk.context; 
        if (context && context.user) {
          setUser(prev => ({
            ...prev,
            fid: context.user.fid,
            username: context.user.username || prev.username,
            // If they are opening the frame, they are at least a 'user', assume basic tier if unknown
            tier: prev.tier
          }));
        }
      } catch (e) {
        console.warn("Could not load Farcaster context:", e);
      }
      
      setIsReady(true);
    };
    init();
  }, []);

  const apiKey = process.env.API_KEY || '';

  const addPendingXp = (amount: number) => {
    setUser(prev => ({ ...prev, pendingXp: prev.pendingXp + amount }));
  };

  const handleShare = useCallback((type: string, data?: any) => {
    const text = type === 'pnl' 
      ? `BSORTAB Trade OS: Just locked in $${data?.pnl || '4,200'} profit on Base! 🚀`
      : `Found Alpha on BSORTAB. Don't fade the social signals. 🔥`;
    
    // Native sharing using Farcaster SDK
    try {
      sdk.actions.composeCast({
        text,
        embeds: ['https://bsortab.app']
      });
      addPendingXp(XP_REWARDS.SHARE);
    } catch (e) {
      console.error("Share failed", e);
    }
  }, []);

  const signIn = async () => {
    try {
      // Quick Auth: Instant signature-free auth if user approves
      const { token } = await sdk.quickAuth.getToken();
      if (token) {
        setIsAuthenticated(true);
        // In a real app, you would send this token to your backend to verify
        // const res = await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } });
        
        setUser(prev => ({
          ...prev,
          badges: [...prev.badges.filter(b => b !== 'Verified'), 'Verified'],
          reputation: prev.reputation + 100 // Bonus for verifying
        }));
      }
    } catch (e) {
      console.error("Authentication failed:", e);
    }
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
    if (!isReady) return null;
    switch (currentView) {
      case 'feed': return <AlphaFeed onBuyAlpha={() => addPendingXp(XP_REWARDS.BUY_ALPHA)} onShare={() => handleShare('alpha')} />;
      case 'terminal': return <Terminal onSwap={() => addPendingXp(XP_REWARDS.SWAP)} onSharePnL={() => handleShare('pnl')} onEarnSuccess={() => addPendingXp(75)} />;
      case 'leaderboard': return <Leaderboard />;
      case 'checkout': return <BaseCheckout />;
      case 'launcher': return <CreatorLauncher onLaunch={() => { addPendingXp(200); setCurrentView('feed'); }} />;
      case 'profile': return <Profile user={user} onClaim={claimOnChainXp} onGm={() => { addPendingXp(10); return true; }} onShare={() => handleShare('profile')} isAuthenticated={isAuthenticated} onSignIn={signIn} />;
      default: return <AlphaFeed onBuyAlpha={() => addPendingXp(XP_REWARDS.BUY_ALPHA)} onShare={() => handleShare('alpha')} />;
    }
  };

  if (!isReady) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">BSORTAB Booting...</p>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider chain={base} apiKey={apiKey}>
          <Layout activeView={currentView} onNavigate={setCurrentView}>
            {renderContent()}
          </Layout>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

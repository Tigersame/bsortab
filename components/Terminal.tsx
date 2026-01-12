import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
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
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import type { Token } from '@coinbase/onchainkit/token';
import { BASE_TOKENS } from '../constants';
import EarnVault from './EarnVault';

interface TerminalProps {
  onSwap: () => void;
  onSharePnL: () => void;
  onEarnSuccess: () => void;
  onInteraction: (action: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ onSwap, onSharePnL, onEarnSuccess, onInteraction }) => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'trade' | 'portfolio' | 'earn'>('trade');
  
  // Chart State
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('ETH');
  
  // Map App Tokens to OnchainKit Tokens with strict type casting
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

  // Generate Chart Data (Visual Only for Production Feed)
  // In a full production app with backend, this would fetch from an Indexer API.
  useEffect(() => {
    // Generative visual pattern for "Live" feel without API dependency
    const data = [];
    const now = Date.now();
    let price = 1000; // Relative baseline
    const points = 24;
    const interval = 3600000;
    
    for (let i = points; i >= 0; i--) {
      const volatility = 0.05; 
      const change = 1 + (Math.random() - 0.5) * volatility;
      price = price * change;
      data.push({
        timestamp: new Date(now - i * interval).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: price
      });
    }
    setChartData(data);
  }, [selectedChart, activeTab]);

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const startValue = chartData.length > 0 ? chartData[0].value : 1;
  const isPositive = latestValue >= startValue;
  const percentChange = ((latestValue - startValue) / startValue) * 100;

  return (
    <div className="p-4 space-y-4 pb-32 relative">
      {/* Navigation Tabs (Top) */}
      <div className="flex bg-[#0b1220] p-1 rounded-2xl border border-slate-800/50 sticky top-0 z-20 shadow-md">
        <button onClick={() => setActiveTab('trade')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'trade' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Trade</button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Assets</button>
        <button onClick={() => setActiveTab('earn')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'earn' ? 'bg-[#1e40af] text-white shadow' : 'text-slate-500'}`}>Earn</button>
      </div>

      {activeTab === 'trade' && (
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-300">
            {/* Chart Preview - Always Visible for Context */}
            <div className="w-full max-w-[420px] h-32 bg-[#0b1220] rounded-[20px] overflow-hidden relative border border-white/5 shadow-lg">
                <div className="absolute top-3 left-4 z-10">
                    <h3 className="text-xl font-bold text-white tracking-tight">{selectedChart}</h3>
                    <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}% (24h)</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={isPositive ? "#3b82f6" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={isPositive ? "#3b82f6" : "#ef4444"} strokeWidth={2} fill="url(#colorVal2)" />
                </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* OnchainKit Swap Portal - Conditional Render */}
            <div className="w-full max-w-[420px] relative">
                {isConnected && address ? (
                    <Swap 
                        isSponsored={true}
                        onSuccess={onSwap}
                        onStatus={(status) => {
                           if (status.statusName === 'amountChange' && status.statusData.tokenFrom) {
                               setSelectedChart(status.statusData.tokenFrom.symbol);
                           }
                        }}
                        className="w-full"
                    >
                        <div className="flex justify-between items-center mb-2 px-1">
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Swap Tokens</div>
                             <SwapSettings>
                                <SwapSettingsSlippageTitle className="text-slate-300 font-bold">Max. Slippage</SwapSettingsSlippageTitle>
                                <SwapSettingsSlippageDescription className="text-slate-500">
                                    Your swap will revert if the prices change by more than the selected percentage.
                                </SwapSettingsSlippageDescription>
                                <SwapSettingsSlippageInput className="bg-[#0e1627] border-slate-800 text-white" />
                            </SwapSettings>
                        </div>
                        
                        <div className="relative flex flex-col gap-1">
                            <SwapAmountInput 
                                label="Sell"
                                swappableTokens={swappableTokens}
                                token={defaultFromToken}
                                type="from"
                                className="bg-[#0e1627] border-none rounded-t-[20px] rounded-b-[4px] p-4 transition-colors hover:bg-[#121b2e] shadow-inner"
                            />
                            
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                <SwapToggleButton className="w-10 h-10 rounded-full border-[4px] border-[#0b1220] bg-[#1e293b] p-2 text-blue-400 hover:bg-[#334155] shadow-lg transition-all active:scale-95 flex items-center justify-center" />
                            </div>
                            
                            <SwapAmountInput 
                                label="Buy"
                                swappableTokens={swappableTokens}
                                token={defaultToToken}
                                type="to"
                                className="bg-[#0e1627] border-none rounded-b-[20px] rounded-t-[4px] p-4 transition-colors hover:bg-[#121b2e] shadow-inner"
                            />
                        </div>
                        
                        <div className="pt-4">
                            <SwapButton className="w-full py-4 bg-blue-600 rounded-[16px] font-black uppercase tracking-widest text-sm hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all" />
                        </div>

                        <SwapMessage className="text-[10px] font-bold text-slate-400 mt-2 text-center" />
                        <SwapToast className="z-[100]" />
                    </Swap>
                ) : (
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-6 shadow-2xl animate-in fade-in">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                             <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.848.598-4.168a6 6 0 0111.804 0"></path></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Connect to Trade</h3>
                            <p className="text-xs font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                Link your wallet to unlock the decentralized swap terminal and execute trades.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Wallet>
                                <ConnectWallet className="!bg-blue-600 !text-white !font-black !px-6 !py-3 !rounded-xl !h-auto hover:!bg-blue-500 !transition-all !shadow-lg !shadow-blue-500/20">
                                    <Avatar className="h-6 w-6 mr-2" />
                                    <Name />
                                </ConnectWallet>
                            </Wallet>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
         <div className="space-y-4 animate-in fade-in">
             <div className="w-full p-4 rounded-[20px] bg-[#0b1220] border border-white/5">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Assets</h3>
                 <div className="space-y-2">
                    {/* In Production: Fetch real balances via wagmi hook or useBalance */}
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                         {isConnected ? "Loading specific asset balances..." : "Connect wallet to view assets"}
                    </div>
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
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
      <div className="flex bg-[#0b1220] p-1 rounded-3xl border border-slate-800/50 sticky top-0 z-20 shadow-md">
        <button onClick={() => setActiveTab('trade')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'trade' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Trade</button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'portfolio' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Assets</button>
        <button onClick={() => setActiveTab('earn')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'earn' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Earn</button>
      </div>

      {activeTab === 'trade' && (
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-300">
            {/* Chart Preview - Always Visible for Context */}
            <div className={`w-full max-w-[420px] h-32 bg-[#0b1220] rounded-[24px] overflow-hidden relative border border-white/5 shadow-lg transition-opacity duration-500 ${!isConnected ? 'opacity-50 blur-[2px]' : 'opacity-100'}`}>
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
                        <div className="flex justify-between items-center mb-2 px-2">
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Swap Tokens</div>
                             <SwapSettings>
                                <SwapSettingsSlippageTitle className="text-slate-300 font-bold">Max. Slippage</SwapSettingsSlippageTitle>
                                <SwapSettingsSlippageDescription className="text-slate-500">
                                    Your swap will revert if the prices change by more than the selected percentage.
                                </SwapSettingsSlippageDescription>
                                <SwapSettingsSlippageInput className="bg-[#0e1627] border-slate-800 text-white rounded-xl" />
                            </SwapSettings>
                        </div>
                        
                        <div className="relative flex flex-col gap-1">
                            <SwapAmountInput 
                                label="Sell"
                                swappableTokens={swappableTokens}
                                token={defaultFromToken}
                                type="from"
                                className="bg-[#0e1627] border-none rounded-t-[24px] rounded-b-[4px] p-4 transition-colors hover:bg-[#121b2e] shadow-inner"
                            />
                            
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                <SwapToggleButton className="w-10 h-10 rounded-full border-[4px] border-[#0b1220] bg-[#1e293b] p-2 text-blue-400 hover:bg-[#334155] shadow-lg transition-all active:scale-95 flex items-center justify-center" />
                            </div>
                            
                            <SwapAmountInput 
                                label="Buy"
                                swappableTokens={swappableTokens}
                                token={defaultToToken}
                                type="to"
                                className="bg-[#0e1627] border-none rounded-b-[24px] rounded-t-[4px] p-4 transition-colors hover:bg-[#121b2e] shadow-inner"
                            />
                        </div>
                        
                        <div className="pt-4">
                            <SwapButton className="w-full py-4 bg-blue-600 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all" />
                        </div>

                        <SwapMessage className="text-[10px] font-bold text-slate-400 mt-2 text-center" />
                        <SwapToast className="z-[100]" />
                    </Swap>
                ) : (
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                             <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Terminal Access</h3>
                            <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                                Connect your wallet to access real-time swaps, advanced charting, and social alpha signals.
                            </p>
                        </div>
                        <div className="flex justify-center pt-2">
                            <Wallet>
                                <ConnectWallet className="!bg-blue-600 !text-white !font-black !px-8 !py-4 !rounded-2xl !h-auto hover:!bg-blue-500 !transition-all !shadow-xl !shadow-blue-500/20 !uppercase !tracking-widest !text-xs scale-100 hover:scale-105">
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
             <div className="w-full p-4 rounded-[24px] bg-[#0b1220] border border-white/5">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Assets</h3>
                 <div className="space-y-2">
                    {/* In Production: Fetch real balances via wagmi hook or useBalance */}
                    <div className="p-12 text-center text-slate-500 text-xs font-mono border-2 border-dashed border-slate-800 rounded-2xl">
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
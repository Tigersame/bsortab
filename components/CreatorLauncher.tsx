
import React, { useState, useEffect, useRef } from 'react';
import { generateTokenMetadata } from '../geminiService';
import { sdk } from "@farcaster/miniapp-sdk";

interface CreatorLauncherProps {
  onLaunch: () => void;
}

const CreatorLauncher: React.FC<CreatorLauncherProps> = ({ onLaunch }) => {
  const [prompt, setPrompt] = useState('');
  const [viewState, setViewState] = useState<'input' | 'thinking' | 'review' | 'deploying' | 'success'>('input');
  
  const [tokenData, setTokenData] = useState<{name: string, symbol: string, description: string}>({
    name: '', symbol: '', description: ''
  });
  
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const DEFAULT_SUPPLY = "1,000,000,000";

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setViewState('thinking');
    setLogs([]);
    
    const thoughts = [
      "Connecting to neural lattice...",
      `Analyzing intent: "${prompt.substring(0, 15)}..."`,
      "Synthesizing meme vectors...",
      "Querying Base chain sentiment...",
      "Optimizing ticker symbol...",
      "Generating asset metadata..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < thoughts.length) {
        setLogs(prev => [...prev, thoughts[i]]);
        i++;
      }
    }, 800);

    try {
      // Parallel execution: Wait for AI + minimum time for effect
      const [data] = await Promise.all([
        generateTokenMetadata(prompt),
        new Promise(resolve => setTimeout(resolve, 3500))
      ]);
      
      clearInterval(interval);
      setTokenData(data);
      setViewState('review');
    } catch (e) {
      clearInterval(interval);
      setLogs(prev => [...prev, "Error: Neural link failed. Retrying..."]);
      setTimeout(() => setViewState('input'), 2000);
    }
  };

  const handleDeploy = () => {
    setViewState('deploying');
    setLogs([]);
    
    const deploySteps = [
      `Compiling ${tokenData.symbol} contract...`,
      "Verifying source code on Etherscan...",
      "Initializing Uniswap V3 Pool...",
      "Seeding initial liquidity (Clanker Lock)...",
      "Renouncing ownership...",
      "Token deployed successfully."
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < deploySteps.length) {
        setLogs(prev => [...prev, deploySteps[step]]);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => setViewState('success'), 800);
      }
    }, 1000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderInput = () => (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-sm mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">AI Agent Online</span>
          </div>
          <h1 className="text-4xl font-black text-white font-mono tracking-tighter">
            CLANKER<span className="text-blue-500">.AI</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Describe your token. I will handle the rest.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A coin for people who love retro gaming and pizza..."
              className="w-full h-32 bg-transparent text-lg font-medium text-white placeholder:text-slate-700 outline-none resize-none font-sans"
              autoFocus
            />
            <div className="flex justify-between items-center mt-4 border-t border-slate-800 pt-4">
               <span className="text-[10px] text-slate-600 font-mono uppercase">{prompt.length}/280 CHARS</span>
               <button 
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="px-6 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
              >
                Launch
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {['Meme', 'Utility', 'DAO', 'Cat', 'Dog', 'AI'].map(tag => (
            <button 
              key={tag} 
              onClick={() => setPrompt(prev => prev + (prev ? ' ' : '') + tag)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500 hover:text-white hover:border-blue-500/50 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderThinking = () => (
    <div className="flex flex-col h-full justify-center items-center space-y-8 animate-in fade-in duration-500 max-w-sm mx-auto w-full">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-slate-800/50 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="text-4xl animate-pulse">🧠</div>
      </div>
      
      <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs h-48 overflow-hidden relative shadow-inner">
         <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
         <div className="space-y-2">
           {logs.map((log, i) => (
             <p key={i} className="text-blue-400/80 animate-in slide-in-from-left-2 fade-in">
               <span className="text-slate-600 mr-2">{'>'}</span>{log}
             </p>
           ))}
           <div ref={logsEndRef} />
         </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="flex flex-col h-full justify-center space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight">Ready to Deploy</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest">Base Chain • Gasless</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative group">
        <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-800 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        <div className="px-6 pb-6 relative">
           <div className="w-24 h-24 -mt-12 mx-auto bg-slate-950 rounded-2xl border-4 border-slate-900 shadow-xl flex items-center justify-center overflow-hidden mb-4">
              <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${tokenData.symbol}`} 
                alt="Token" 
                className="w-full h-full object-cover"
              />
           </div>
           
           <div className="text-center space-y-1 mb-6">
              <h3 
                onClick={() => handleCopy(tokenData.name, 'name')}
                className="text-2xl font-black text-white tracking-tight cursor-pointer hover:text-blue-400 transition-colors"
              >
                {tokenData.name}
              </h3>
              <p 
                onClick={() => handleCopy(tokenData.symbol, 'symbol')}
                className="text-sm font-mono font-bold text-blue-500 cursor-pointer hover:text-blue-400 transition-colors"
              >
                ${tokenData.symbol}
              </p>
           </div>

           <div className="space-y-4">
              <div 
                 onClick={() => handleCopy(tokenData.description, 'description')}
                 className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 leading-relaxed text-center italic hover:bg-slate-950 transition-colors cursor-pointer relative"
              >
                 "{tokenData.description}"
                 {copiedField === 'description' && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-xl text-green-400 font-bold text-[10px] uppercase tracking-widest">
                     Copied
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 uppercase block mb-1">Total Supply</span>
                    <span className="text-xs font-mono font-bold text-white">{DEFAULT_SUPPLY}</span>
                 </div>
                 <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 uppercase block mb-1">Liquidity</span>
                    <span className="text-xs font-mono font-bold text-green-400">Locked 🔒</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => setViewState('input')}
          className="flex-1 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-colors"
        >
          Edit
        </button>
        <button 
          onClick={handleDeploy}
          className="flex-[2] py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/10 flex justify-center items-center gap-2 active:scale-95"
        >
          Deploy Contract
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </button>
      </div>
    </div>
  );

  const renderDeploying = () => (
    <div className="flex flex-col h-full justify-center space-y-6 animate-in fade-in duration-500 max-w-sm mx-auto w-full">
      <div className="text-center space-y-2">
         <div className="w-16 h-16 mx-auto bg-slate-900 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-2 border-green-500 border-r-transparent animate-spin"></div>
            <span className="text-xl">⚙️</span>
         </div>
         <h2 className="text-lg font-black text-white font-mono uppercase tracking-tight">Deploying to Base</h2>
         <p className="text-[10px] text-slate-500 font-mono">Confirming transaction...</p>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-[10px] shadow-2xl">
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
               <span className="text-slate-300">{log}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col h-full justify-center items-center space-y-8 animate-in zoom-in-95 duration-700 max-w-sm mx-auto w-full">
       <div className="relative">
          <div className="absolute inset-0 bg-green-500 blur-[80px] opacity-20"></div>
          <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] border-2 border-green-500/50 flex flex-col items-center justify-center shadow-2xl relative z-10 overflow-hidden group">
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${tokenData.symbol}`} 
                alt="Token" 
                className="w-24 h-24 rounded-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform duration-500"
              />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border-2 border-slate-900 shadow-lg whitespace-nowrap">
            Deployed on Base
          </div>
       </div>

       <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tighter">{tokenData.name}</h1>
          <p className="text-slate-400 text-sm font-mono">${tokenData.symbol} is live.</p>
       </div>

       <div className="w-full space-y-3 pt-4">
          <button 
            onClick={() => {
                onLaunch(); 
                sdk.actions.openUrl(`https://basescan.org/token/${tokenData.symbol}`);
            }}
            className="w-full py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
          >
            View Contract
          </button>
          <button 
            onClick={() => sdk.actions.composeCast({
              text: `I just launched $${tokenData.symbol} on Base using BSORTAB! @clanker`,
              embeds: ['https://bsortab.app'] 
            })}
            className="w-full py-4 bg-[#4C2A9E] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#5D34C2] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4C2A9E]/30"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            Cast Launch
          </button>
          <button 
             onClick={() => { onLaunch(); setViewState('input'); setPrompt(''); }}
             className="w-full py-3 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
             Launch Another
          </button>
       </div>
    </div>
  );

  return (
    <div className="p-6 h-full min-h-[600px] flex flex-col">
      {viewState === 'input' && renderInput()}
      {viewState === 'thinking' && renderThinking()}
      {viewState === 'review' && renderReview()}
      {viewState === 'deploying' && renderDeploying()}
      {viewState === 'success' && renderSuccess()}
    </div>
  );
};

export default CreatorLauncher;

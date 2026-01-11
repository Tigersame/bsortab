
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { generateTokenMetadata } from '../geminiService';
import { sdk } from "../farcasterSdk";

interface CreatorLauncherProps {
  onLaunch: () => void;
  onInteraction: (action: string) => void;
  isAuthenticated: boolean;
}

type RewardType = 'paired' | 'clanker' | 'both';

interface Recipient {
  id: string;
  address: string;
  admin: string;
  percentage: number;
  type: RewardType;
}

const CreatorLauncher: React.FC<CreatorLauncherProps> = ({ onLaunch, onInteraction, isAuthenticated }) => {
  const { address } = useAccount();
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenData, setTokenData] = useState<{name: string, symbol: string, description: string, image: string} | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Extensions
  const [creatorBuyAmount, setCreatorBuyAmount] = useState('');
  const [enableCreatorBuy, setEnableCreatorBuy] = useState(false);
  const [enableVault, setEnableVault] = useState(true);
  const [vaultDuration, setVaultDuration] = useState(31);
  const [vaultPercentage, setVaultPercentage] = useState(30);
  
  // Metadata & Config
  const [updatableMetadata, setUpdatableMetadata] = useState(true);
  const [socials, setSocials] = useState({ website: '', telegram: '', twitter: '', farcaster: '' });
  const [feeConfig, setFeeConfig] = useState<'recommended' | 'legacy'>('recommended');
  
  // Rewards
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', address: '', admin: '', percentage: 100, type: 'paired' }
  ]);

  // Preclank
  const [isPreclankMode, setIsPreclankMode] = useState(false);
  const [triggerPhrase, setTriggerPhrase] = useState('');
  const [showManagePreclanks, setShowManagePreclanks] = useState(false);

  const [activeTab, setActiveTab] = useState<'launch' | 'settings'>('launch');
  const [settingsSection, setSettingsSection] = useState<'meta' | 'rewards'>('meta');

  // Auto-fill connected wallet as default recipient
  useEffect(() => {
    if (address && recipients.length === 1 && recipients[0].address === '') {
      setRecipients([{ ...recipients[0], address: address }]);
    }
  }, [address]);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    setIsGenerating(true);
    try {
      const data = await generateTokenMetadata(idea);
      setTokenData({
        ...data,
        image: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.symbol}&backgroundColor=0f172a`
      });
      onInteraction('GENERATE_METADATA');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate deployment delay
    setTimeout(() => {
        setIsDeploying(false);
        onLaunch();
    }, 2500);
  };

  const handleSavePreclank = () => {
    if (!isAuthenticated) {
        alert("You must sign in with Farcaster to save a Preclank.");
        return;
    }
    if (!triggerPhrase) {
        alert("Please enter a unique trigger phrase for your Preclank.");
        return;
    }
    // Simulate saving
    onInteraction('SAVE_PRECLANK');
    alert(`Preclank Saved!\n\nTo deploy, cast on Farcaster:\n"${triggerPhrase} @clanker"`);
    onLaunch(); 
  };

  const addRecipient = () => {
    const remaining = Math.max(0, 100 - recipients.reduce((acc, r) => acc + r.percentage, 0));
    setRecipients([...recipients, { 
      id: Math.random().toString(), 
      address: '', 
      admin: '', 
      percentage: remaining, 
      type: 'paired' 
    }]);
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: any) => {
    setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
       setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  if (showManagePreclanks) {
      return (
          <div className="p-4 space-y-6 h-full overflow-y-auto no-scrollbar pb-24 animate-in slide-in-from-right-2">
              <div className="flex items-center justify-between pt-4">
                  <button onClick={() => setShowManagePreclanks(false)} className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                      Back
                  </button>
                  <h2 className="text-xl font-black text-white">Your Preclanks</h2>
              </div>
              
              <div className="space-y-4">
                  {/* Mock Preclank Item */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 opacity-75">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">😼</div>
                          <div>
                              <h3 className="text-white font-bold text-sm">Based Cat</h3>
                              <p className="text-[9px] text-slate-500 font-mono">Trigger: "Launch Based Cat @clanker"</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">Edit</button>
                          <button className="flex-1 py-2 bg-red-900/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20">Delete</button>
                      </div>
                  </div>
                  
                  <div className="p-8 text-center text-slate-600 text-[10px] font-mono border-2 border-dashed border-slate-800 rounded-2xl">
                      No other active Preclanks found.
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto no-scrollbar pb-24">
      <div className="pt-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             </div>
             <div>
                 <h2 className="text-xl font-black tracking-tighter text-white leading-none">Clanker</h2>
                 <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">Token Launcher</p>
             </div>
         </div>
         <button 
            onClick={() => setShowManagePreclanks(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
         >
            Manage Preclanks
         </button>
      </div>

      {!tokenData ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
           {/* Idea Input */}
           <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Token Concept / Prompt</label>
              <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. @clanker launch a token for builder energy on base"
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-blue-500 outline-none resize-none transition-colors relative z-10 font-mono"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !idea}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 relative z-10"
              >
                {isGenerating ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Dreaming...</span>
                    </>
                ) : (
                    <span>Generate Metadata</span>
                )}
              </button>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
           {/* Preview Card */}
           <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-4">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-950 shadow-2xl overflow-hidden bg-slate-950">
                    <img src={tokenData.image} alt={tokenData.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{tokenData.name}</h3>
                    <div className="flex justify-center gap-2">
                        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20">${tokenData.symbol}</span>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-1.5 rounded-full border border-slate-800">100B Supply</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Navigation Tabs */}
           <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
             <button onClick={() => setActiveTab('launch')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'launch' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Launch Config</button>
             <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Token Settings</button>
           </div>

           {activeTab === 'launch' ? (
             <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
               {/* Basic Info (Network) */}
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network (Chain)</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                     <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">B</div>
                     <span className="text-xs font-bold text-white">Base</span>
                     <span className="ml-auto text-[9px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
                  </div>
               </div>

               {/* Creator Buy Option - Hidden if Preclank is enabled */}
               <div className={`p-4 rounded-2xl border transition-all ${isPreclankMode ? 'bg-slate-900/50 border-slate-800/50 opacity-50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-lg">🛒</div>
                        <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Creator Buy</h4>
                            <p className="text-[9px] text-slate-500">{isPreclankMode ? 'Not supported in Preclank' : 'Snipe first block'}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => !isPreclankMode && setEnableCreatorBuy(!enableCreatorBuy)}
                        disabled={isPreclankMode}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${enableCreatorBuy && !isPreclankMode ? 'bg-blue-600' : 'bg-slate-700 cursor-not-allowed'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enableCreatorBuy && !isPreclankMode ? 'translate-x-4' : ''}`}></div>
                     </button>
                  </div>
                  
                  {enableCreatorBuy && !isPreclankMode && (
                      <div className="animate-in slide-in-from-top-2 pt-4">
                          <input 
                            type="number"
                            value={creatorBuyAmount}
                            onChange={(e) => setCreatorBuyAmount(e.target.value)}
                            placeholder="Amount in ETH (e.g. 0.05)"
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-mono"
                          />
                      </div>
                  )}
               </div>

               {/* Vault Option */}
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-lg">🔒</div>
                        <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Creator Vault</h4>
                            <p className="text-[9px] text-slate-500">Reserve & Lock Supply</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setEnableVault(!enableVault)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${enableVault ? 'bg-purple-600' : 'bg-slate-700'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enableVault ? 'translate-x-4' : ''}`}></div>
                     </button>
                  </div>

                  {enableVault && (
                     <div className="animate-in slide-in-from-top-2 pt-2 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                               <span>Allocation</span>
                               <span className="text-white">{vaultPercentage}% (Max 30%)</span>
                            </div>
                            <input 
                               type="range" 
                               min="1" 
                               max="30" 
                               value={vaultPercentage} 
                               onChange={(e) => setVaultPercentage(Number(e.target.value))}
                               className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                               <span>Lock Duration</span>
                               <span className="text-white">{vaultDuration} Days</span>
                            </div>
                            <input 
                               type="range" 
                               min="31" 
                               max="365" 
                               value={vaultDuration} 
                               onChange={(e) => setVaultDuration(Number(e.target.value))}
                               className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                            />
                        </div>
                     </div>
                  )}
               </div>
             </div>
           ) : (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                 {/* Settings Sub-Tabs */}
                 <div className="flex gap-2 mb-2">
                    <button 
                        onClick={() => setSettingsSection('meta')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${settingsSection === 'meta' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Metadata
                    </button>
                    <button 
                        onClick={() => setSettingsSection('rewards')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${settingsSection === 'rewards' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Rewards & Fees
                    </button>
                 </div>

                 {settingsSection === 'meta' && (
                     <div className="space-y-4 animate-in fade-in">
                         <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                             <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                <textarea 
                                    value={tokenData.description}
                                    onChange={(e) => setTokenData({...tokenData, description: e.target.value})}
                                    className="w-full h-20 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none resize-none"
                                />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Website</label>
                                    <input 
                                        type="text" 
                                        value={socials.website} 
                                        onChange={e => setSocials({...socials, website: e.target.value})}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500" 
                                        placeholder="https://"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Telegram</label>
                                    <input 
                                        type="text" 
                                        value={socials.telegram} 
                                        onChange={e => setSocials({...socials, telegram: e.target.value})}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500" 
                                        placeholder="t.me/"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">X (Twitter)</label>
                                    <input 
                                        type="text" 
                                        value={socials.twitter} 
                                        onChange={e => setSocials({...socials, twitter: e.target.value})}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500" 
                                        placeholder="@handle"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Farcaster</label>
                                    <input 
                                        type="text" 
                                        value={socials.farcaster} 
                                        onChange={e => setSocials({...socials, farcaster: e.target.value})}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500" 
                                        placeholder="@handle"
                                    />
                                 </div>
                             </div>
                         </div>

                         <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                             <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Updatable Metadata</h4>
                                <p className="text-[9px] text-slate-500">Allow changes after launch</p>
                             </div>
                             <button 
                                onClick={() => setUpdatableMetadata(!updatableMetadata)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${updatableMetadata ? 'bg-green-500' : 'bg-slate-700'}`}
                             >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${updatableMetadata ? 'translate-x-4' : ''}`}></div>
                             </button>
                         </div>
                     </div>
                 )}

                 {settingsSection === 'rewards' && (
                     <div className="space-y-4 animate-in fade-in">
                         {/* Fee Config */}
                         <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Fee Configuration</h4>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setFeeConfig('recommended')}
                                    className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all ${feeConfig === 'recommended' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1">Recommended</div>
                                    <div className="text-[9px] opacity-70">Dynamic Base + Volatility</div>
                                </button>
                                <button 
                                    onClick={() => setFeeConfig('legacy')}
                                    className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all ${feeConfig === 'legacy' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1">Legacy</div>
                                    <div className="text-[9px] opacity-70">Fixed % Fees</div>
                                </button>
                             </div>
                         </div>

                         {/* Rewards Config */}
                         <div className="space-y-3">
                             <div className="flex justify-between items-center px-1">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Reward Recipients</h4>
                                <button onClick={addRecipient} className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">+ Add</button>
                             </div>
                             
                             {recipients.map((recipient, idx) => (
                                 <div key={recipient.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                                     {recipients.length > 1 && (
                                         <button onClick={() => removeRecipient(recipient.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                         </button>
                                     )}
                                     
                                     <div className="flex items-center gap-2 mb-1">
                                         <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                                         <span className="text-[10px] font-black text-white">{idx === 0 ? 'You (Creator)' : 'Recipient'}</span>
                                     </div>

                                     <div className="grid grid-cols-[2fr_1fr] gap-2">
                                         <input 
                                            type="text"
                                            placeholder="Wallet Address" 
                                            value={recipient.address}
                                            onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                         />
                                         <div className="relative">
                                            <input 
                                                type="number"
                                                value={recipient.percentage}
                                                onChange={(e) => updateRecipient(recipient.id, 'percentage', Number(e.target.value))}
                                                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-white outline-none focus:border-blue-500 text-right pr-6"
                                            />
                                            <span className="absolute right-2 top-2 text-[10px] text-slate-500">%</span>
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-2">
                                         <input 
                                            type="text"
                                            placeholder="Admin Address (Optional)" 
                                            value={recipient.admin}
                                            onChange={(e) => updateRecipient(recipient.id, 'admin', e.target.value)}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                         />
                                         <select 
                                            value={recipient.type}
                                            onChange={(e) => updateRecipient(recipient.id, 'type', e.target.value)}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 outline-none focus:border-blue-500"
                                         >
                                             <option value="paired">Paired (WETH)</option>
                                             <option value="clanker">Clanker Token</option>
                                             <option value="both">Both</option>
                                         </select>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
             </div>
           )}

           {/* Preclank Toggle & Main Actions */}
           <div className="space-y-4 pt-4 border-t border-slate-800/50">
               <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Enable Preclank</h4>
                        <p className="text-[9px] text-slate-500">Configure now, trigger later via cast</p>
                    </div>
                    <button 
                        onClick={() => setIsPreclankMode(!isPreclankMode)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${isPreclankMode ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isPreclankMode ? 'translate-x-4' : ''}`}></div>
                    </button>
               </div>

               {isPreclankMode && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                       {/* Farcaster Requirement Notice */}
                       <div className="flex items-center gap-2 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
                            <span className="text-lg">🆔</span>
                            <div className="flex-1">
                                <p className="text-[9px] text-indigo-200">
                                    <strong>Requirement:</strong> You must be signed in with Farcaster to manage and trigger Preclanks.
                                </p>
                                {!isAuthenticated && (
                                    <p className="text-[9px] text-red-400 font-bold mt-1">Not signed in.</p>
                                )}
                            </div>
                       </div>

                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger Phrase (Case Sensitive)</label>
                           <input 
                                type="text"
                                value={triggerPhrase}
                                onChange={(e) => setTriggerPhrase(e.target.value)}
                                placeholder="e.g. Launch Based Cat @clanker"
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                           />
                           <p className="text-[9px] text-slate-500">
                               To deploy, you will cast this phrase and tag @clanker exactly as written above.
                           </p>
                       </div>
                   </div>
               )}

               <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={isPreclankMode ? handleSavePreclank : handleDeploy}
                    disabled={isDeploying}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${isPreclankMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-green-500 hover:bg-green-400 text-white shadow-green-500/20'}`}
                  >
                     {isDeploying ? (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                         <>
                            <span>{isPreclankMode ? 'Save Preclank Config' : 'Deploy Now'}</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                         </>
                     )}
                  </button>
               </div>
           </div>
           
           <button 
                onClick={() => setTokenData(null)}
                className="w-full py-2 text-slate-500 font-black text-[9px] uppercase tracking-widest hover:text-slate-300"
            >
                Start Over
           </button>
        </div>
      )}
    </div>
  );
};

export default CreatorLauncher;


import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const screens = [
    {
      title: "Trade Social",
      desc: "Spot viral tokens and trade with your friends on Base.",
      image: "🚀",
      bg: "from-blue-600 to-indigo-900"
    },
    {
      title: "Earn XP & Yield",
      desc: "Get rewards for every trade and interactions in the feed.",
      image: "💎",
      bg: "from-purple-600 to-slate-900"
    },
    {
      title: "Your Terminal",
      desc: "Advanced tools, smart swaps, and alpha signals in one place.",
      image: "⚡",
      bg: "from-slate-800 to-black"
    }
  ];

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-gradient-to-br ${screens[step].bg} text-white transition-all duration-500`}>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500" key={step}>
        <div className="text-8xl animate-bounce">{screens[step].image}</div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase">{screens[step].title}</h1>
          <p className="text-lg font-medium opacity-80 leading-relaxed max-w-xs mx-auto">{screens[step].desc}</p>
        </div>
      </div>
      
      <div className="p-8 pb-12 bg-black/20 backdrop-blur-sm">
        <div className="flex justify-center gap-2 mb-8">
          {screens.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
          ))}
        </div>
        <button 
          onClick={handleNext}
          className="w-full py-4 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-200 active:scale-95 transition-all shadow-xl"
        >
          {step === screens.length - 1 ? "Launch App" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;

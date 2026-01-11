
import React, { useState, useMemo } from 'react';
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';
import { SignInWithBaseButton, BasePayButton } from '@base-org/account-ui/react';

const BaseCheckout: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Initialize Base Account SDK
  // Ideally initialized once at app level, but following the quickstart pattern here for isolation
  const sdk = useMemo(() => createBaseAccountSDK({
    appName: 'BASELINES Social OS',
    appLogoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=BASELINES',
  }), []);

  const handleSignIn = async () => {
    try {
      await sdk.getProvider().request({ method: 'wallet_connect' });
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentStatus('Initiating payment on Base Sepolia...');
      // NOTE: Using testnet=true for demonstration.
      const { id } = await pay({
        amount: '0.01', // 0.01 USD
        to: '0x438621D7159981249b6574944d156565193B675C', 
        testnet: true
      });

      setPaymentId(id);
      setPaymentStatus('Payment initiated! Verifying...');
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('Payment failed or cancelled');
    }
  };

  const handleCheckStatus = async () => {
    if (!paymentId) return;
    setIsCheckingStatus(true);
    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatus(`Payment Status: ${status}`);
    } catch (error) {
      console.error('Status check failed:', error);
      setPaymentStatus('Could not verify status');
    } finally {
        setIsCheckingStatus(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 shadow-2xl">
        <div className="p-8 rounded-[2.4rem] bg-slate-950 text-center space-y-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500 via-slate-950 to-slate-950 pointer-events-none"></div>

            <div className="relative z-10 space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter">Base Checkout</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">One-Tap Crypto Payments</p>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Sign In Section */}
                <div className="w-full space-y-3">
                    <div className="flex justify-center">
                         <SignInWithBaseButton 
                             variant="secondary" 
                             onClick={handleSignIn}
                         />
                    </div>
                    {isSignedIn && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Connected</span>
                        </div>
                    )}
                </div>

                <div className="w-full h-px bg-slate-800/50"></div>

                {/* Pay Section */}
                <div className="w-full space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Amount</span>
                        <span className="text-white text-xl font-mono font-black">$0.01 <span className="text-slate-500 text-xs">USD</span></span>
                    </div>
                    
                    <div className="flex justify-center">
                        <BasePayButton onClick={handlePayment} />
                    </div>
                </div>

                {/* Status Section */}
                {(paymentId || paymentStatus) && (
                    <div className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 animate-in fade-in">
                        <p className="text-[10px] text-slate-300 font-mono text-center">{paymentStatus}</p>
                        {paymentId && (
                            <button 
                                onClick={handleCheckStatus}
                                disabled={isCheckingStatus}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isCheckingStatus && <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                                Refresh Status
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="px-6 text-center">
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
            Powered by Base Account SDK. Experience gasless transactions and passkey authentication on Base Sepolia.
        </p>
      </div>
    </div>
  );
};

export default BaseCheckout;

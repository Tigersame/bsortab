import React from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';

// Mock recipient for demo payment
const PAYMENT_RECIPIENT = '0x438621D7159981249b6574944d156565193B675C';
const PAYMENT_AMOUNT_ETH = '0.0001';

const BaseCheckout: React.FC = () => {
  const { isConnected, address } = useAccount();

  // Create simple transaction call
  const calls = [{
    to: PAYMENT_RECIPIENT as `0x${string}`,
    value: parseEther(PAYMENT_AMOUNT_ETH),
    data: '0x' as `0x${string}`
  }];

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
                {/* Connection Status / Wallet */}
                <div className="w-full space-y-3">
                    <div className="flex justify-center">
                         <Wallet>
                            <ConnectWallet className="!bg-slate-800 !text-white !font-bold !rounded-2xl hover:!bg-slate-700 transition-colors">
                                <Avatar className="h-6 w-6" />
                                <Name />
                            </ConnectWallet>
                         </Wallet>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-800/50"></div>

                {/* Pay Section */}
                <div className="w-full space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Total</span>
                        <div className="text-right">
                             <span className="text-white text-xl font-mono font-black">{PAYMENT_AMOUNT_ETH} <span className="text-slate-500 text-xs">ETH</span></span>
                             <p className="text-[9px] text-slate-500">~ $0.35 USD</p>
                        </div>
                    </div>
                    
                    {isConnected ? (
                        <Transaction 
                            calls={calls} 
                            chainId={base.id}
                            className="w-full"
                        >
                            <TransactionButton 
                                className="!w-full !py-4 !bg-blue-600 !text-white !rounded-2xl !font-black !text-sm !uppercase !tracking-widest !shadow-lg !shadow-blue-600/20 active:!scale-95 hover:!bg-blue-500 transition-all"
                                text="Pay Now" 
                            />
                            <TransactionStatus className="mt-4">
                                <TransactionStatusLabel className="!text-slate-400 !text-[10px]" />
                                <TransactionStatusAction className="!text-blue-400 !text-[10px] !font-bold" />
                            </TransactionStatus>
                        </Transaction>
                    ) : (
                        <button disabled className="w-full py-4 bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed">
                            Connect to Pay
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      <div className="px-6 text-center">
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
            Powered by OnchainKit. Experience gas-efficient transactions on Base.
        </p>
      </div>
    </div>
  );
};

export default BaseCheckout;
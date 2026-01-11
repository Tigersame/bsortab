
import { useCallback } from 'react';

export function useMiniApp() {
  const addMiniApp = useCallback(async () => {
    console.log('[Mock Neynar] Requesting to add Mini App...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate user accepting the prompt
    // In a real app, this triggers the client-side modal
    const success = confirm("Allow BASELINES to send you notifications via Neynar?");
    
    if (success) {
        console.log('[Mock Neynar] Mini App Added successfully.');
        return {
            added: true,
            notificationDetails: {
                token: 'mock-neynar-token-' + Math.random().toString(36).substring(7),
                url: 'https://api.neynar.com/webhook/endpoint'
            }
        };
    }
    
    return { added: false };
  }, []);

  return {
    isSDKLoaded: true,
    addMiniApp
  };
}

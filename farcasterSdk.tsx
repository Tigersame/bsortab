
export const sdk = {
  context: Promise.resolve({
    user: {
      fid: 1337,
      username: 'base_god',
      displayName: 'Based God',
      pfpUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=base',
    },
    client: {
      clientFid: 9152,
      added: true,
    }
  }),
  actions: {
    openUrl: (url: string) => {
      console.log('[MockSDK] Opening URL:', url);
      window.open(url, '_blank');
    },
    composeCast: (opts: { text: string; embeds?: string[] }) => {
      console.log('[MockSDK] Compose Cast:', opts);
      alert(`[Mock SDK] Cast composed:\n\n${opts.text}\n\n${opts.embeds ? 'Embeds: ' + opts.embeds.join(', ') : ''}`);
    },
    viewCast: (url: string) => {
      console.log('[MockSDK] View Cast:', url);
      alert(`[Mock SDK] Viewing cast: ${url}`);
    },
    addMiniApp: async () => {
      console.log('[MockSDK] Requesting to add Mini App...');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = confirm("Allow BASELINES to send you notifications?");
      
      if (success) {
          return {
              added: true,
              notificationDetails: {
                  token: 'mock-token-' + Math.random().toString(36).substring(7),
                  url: 'https://api.example.com/webhook'
              }
          };
      }
      return { added: false };
    }
  },
  quickAuth: {
    getToken: async () => {
      console.log('[MockSDK] Getting Token...');
      return { token: 'mock-jwt-token-signed-by-farcaster' };
    },
    fetch: async (url: string, init: any) => {
        console.log('[MockSDK] Fetch:', url, init);
        return {
            json: async () => ({ fid: 1337, username: 'base_god' })
        };
    }
  }
};

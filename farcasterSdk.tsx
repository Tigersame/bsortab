
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
  },
  quickAuth: {
    getToken: async () => {
      console.log('[MockSDK] Getting Token...');
      return { token: 'mock-jwt-token-signed-by-farcaster' };
    },
    fetch: async (url: string, init: any) => {
        console.log('[MockSDK] Fetch:', url
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Property 'cwd' does not exist on type 'Process'.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills({
        protocolImports: true,
      }),
    ],
    define: {
      // Expose specific API keys safely
      // Fix: Expose API_KEY as per Google GenAI SDK guidelines, fallback to GEMINI_API_KEY if present
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.ONCHAINKIT_API_KEY': JSON.stringify(env.ONCHAINKIT_API_KEY),
      
      // Polyfill process.env for libs that expect it
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        API_KEY: JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
        GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY),
        ONCHAINKIT_API_KEY: JSON.stringify(env.ONCHAINKIT_API_KEY),
      },
    },
  };
});

import { GoogleGenAI } from "@google/genai";

export async function analyzeAlphaFeed(trades: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Alpha feed initialization in progress...";
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this on-chain trade activity into a sharp, viral-style 2-sentence alpha alert for a social trading app. Mention potential whale movements or trends. Data: ${trades}`,
      config: {
        systemInstruction: "You are an elite on-chain analyst for BSORTAB. Your goal is to find 'Alpha' (profitable insights). Use a confident, professional trader tone with a hint of Degen energy.",
        temperature: 0.7,
      },
    });
    
    return response.text || "Scanning for new signals...";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Market analysis engine syncing. Watch the feed.";
  }
}

export async function checkTokenSafety(tokenName: string, creator: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Safety engine warming up...";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quick vibe check for token ${tokenName} by ${creator}. Is this high risk, a potential moonshot, or a typical community token? Be concise.`,
      config: {
        systemInstruction: "You are BSORTAB's safety protocol. Be blunt, fast, and use trader slang.",
      }
    });
    
    return response.text || "Vibe: Neutral.";
  } catch (error) {
    console.error("Vibe Check Error:", error);
    return "Vibe: Uncertain.";
  }
}

export async function generateTokenManifesto(name: string, symbol: string, theme: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Manifesto generation unavailable.";

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, viral, 1-sentence manifesto (max 15 words) for a new crypto token named "${name}" ($${symbol}). The theme/vibe is: "${theme}". Use emoji to make it pop. It should feel like a TikTok caption.`,
       config: {
        systemInstruction: "You are a crypto marketing genius creating the next big meme coin on Base. Hype it up! Keep it short and punchy.",
      }
    });
    return response.text || "To the moon! 🚀";
  } catch (error) {
    return "Ready for launch! 🚀";
  }
}

export async function generateTokenMetadata(prompt: string): Promise<{ name: string; symbol: string; description: string }> {
  const apiKey = process.env.API_KEY;
  
  // Default fallback if no key
  const fallback = {
    name: "Based Token",
    symbol: "BASED",
    description: "A community token launched on Base."
  };

  if (!apiKey) return fallback;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a viral crypto token profile based on this user idea: "${prompt}". Return a JSON object with keys: 'name' (creative name), 'symbol' (max 5 chars), 'description' (max 100 chars, funny/engaging).`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an AI Token Launcher (Clanker-style). You create meme-worthy, degen-friendly, or serious token profiles based on short prompts. Be creative and concise.",
      }
    });

    const text = response.text;
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (error) {
    console.error("Metadata Gen Error:", error);
    return fallback;
  }
}


import { GoogleGenAI } from "@google/genai";

export async function analyzeAlphaFeed(trades: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Alpha feed initialization in progress...";
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this on-chain trade activity into a sharp, viral-style 2-sentence alpha alert for a social trading app. Mention potential whale movements or trends. Data: ${trades}`,
      config: {
        systemInstruction: "You are an elite on-chain analyst for BASELINES. Your goal is to find 'Alpha' (profitable insights). Use a confident, professional trader tone with a hint of Degen energy.",
        temperature: 0.7,
      },
    });
    
    return response.text || "Scanning for new signals...";
  } catch (error) {
    // Suppress console spam for expected environment issues
    return "Market analysis engine syncing. Watch the feed.";
  }
}

export async function checkTokenSafety(tokenName: string, creator: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Safety engine warming up...";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quick vibe check for token ${tokenName} by ${creator}. Is this high risk, a potential moonshot, or a typical community token? Be concise.`,
      config: {
        systemInstruction: "You are BASELINES's safety protocol. Be blunt, fast, and use trader slang.",
      }
    });
    
    return response.text || "Vibe: Neutral.";
  } catch (error) {
    return "Vibe: Uncertain.";
  }
}

export async function generateTokenManifesto(name: string, symbol: string, theme: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Manifesto generation unavailable.";

  try {
    const ai = new GoogleGenAI({ apiKey });
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
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Default fallback if no key
  const fallback = {
    name: "Based Token",
    symbol: "BASED",
    description: "A community token launched on Base."
  };

  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a creative crypto token based on this user idea: "${prompt}". 
      
      Return ONLY a JSON object with these fields:
      - name: Token Name
      - symbol: Ticker (3-5 letters)
      - description: Short catchy description (max 120 chars)
      
      Example: {"name": "Super Base", "symbol": "BASE", "description": "The best token on chain."}`,
      config: {
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "";
    // Strip potential markdown code blocks
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (error) {
    // Silent fail to fallback
    return fallback;
  }
}

import { GoogleGenAI } from "@google/genai";

// Initialization with direct process.env access for Vite define to replace
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
const MODEL_NAME = "gemini-3-flash-preview";

export async function getChatResponse(message: string, history: { role: string, parts: { text: string }[] }[]) {
  try {
    const contents = [...history, { role: 'user', parts: [{ text: message }] }];
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: `You are a helpful customer service assistant for Q&H LUMINA, a premium skincare and beauty store.
Your name is Lumina AI. You are professional, friendly, and knowledgeable about skincare.
You can help customers with:
1. Product recommendations based on skin type (oily, dry, sensitive).
2. Information about Q&H LUMINA's categories: Skincare, Makeup, Fragrance, Bodycare.
3. General skincare routines and tips.
4. Information about store policies (privacy, shipping, returns - though for specific order tracking you should guide them to the 'Tra cứu đơn hàng' page).

Keep your answers concise and formatted nicely with bullet points if needed.
Speak in Vietnamese as the primary language.
If you don't know something specific about an order, ask them to check the tracking page or contact support at contact@qhskinlab.com.`,
        temperature: 0.7,
      },
    });

    return response.text || "Xin lỗi, hiện tại Lumina đang bận một chút. Bạn thử lại sau nhé!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, hiện tại Lumina AI đang bận một chút hoặc gặp lỗi kết nối. Bạn vui lòng thử lại sau giây lát nhé!";
  }
}


import { GoogleGenAI } from "@google/genai";

export const getShoppingAdvice = async (items: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const validItems = items.filter(i => i.weight > 0 && i.priceEur > 0);
  if (validItems.length === 0) return "Please enter some product details first!";

  const prompt = `
    As a shopping expert, analyze these grocery options and tell me which is the best value and why.
    Pay special attention to quantities (multipacks vs. single items). 
    Explain the math simply, showing the price per kilogram or liter.
    
    Items:
    ${validItems.map(i => `- ${i.name}: ${i.quantity} pack of ${i.weight}${i.unit} (Total: ${(i.unit === 'g' ? (i.weight * i.quantity) / 1000 : i.weight * i.quantity).toFixed(2)}kg) for €${i.priceEur}`).join('\n')}
    
    Format the response with a friendly tone, highlighting the winner clearly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble thinking right now. But look at the calculated labels below for the best price per kg!";
  }
};

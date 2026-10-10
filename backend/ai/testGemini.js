import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "Say hello in one sentence.",
  });

  console.log("Gemini response:");
  console.log(response.text);
} catch (error) {
  console.error("Gemini test failed:");
  console.error(error);
}

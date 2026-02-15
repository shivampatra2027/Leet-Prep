import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

let geminiModel = null;

export function getGeminiModel() {
  if (!apiKey) return null;
  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use widely available stable models first to avoid 404s
    const modelIds = ["gemini-pro", "gemini-1.0-pro"];
    for (const id of modelIds) {
      try {
        geminiModel = genAI.getGenerativeModel({ model: id });
        break;
      } catch (e) {
        console.error(`Gemini model ${id} init failed:`, e.message);
      }
    }
    if (!geminiModel) {
      console.error("No Gemini model could be initialized. Check API key/model availability.");
    }
  }
  return geminiModel;
}

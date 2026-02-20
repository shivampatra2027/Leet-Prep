import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

let geminiModel = null;
let initializing = null;

const MODEL_PRIORITY = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function initModel() {
  if (!apiKey) {
    console.error("Missing GOOGLE_GENAI_API_KEY");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const id of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: id });

      // verification call (tiny cheap request)
      await model.generateContent("ping");

      console.log(`Gemini model initialized: ${id}`);
      return model;
    } catch (err) {
      console.warn(`Model ${id} unavailable:`, err.message);
    }
  }

  console.error("No Gemini model available for this API key");
  return null;
}

export async function getGeminiModel() {
  if (geminiModel) return geminiModel;

  if (!initializing) {
    initializing = initModel().then(model => {
      geminiModel = model;
      return model;
    });
  }

  return initializing;
}

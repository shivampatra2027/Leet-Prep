import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

let geminiModel = null;
let initializing = null;

// Ordered by availability + cost. Use stable aliases that work with v1beta.
const MODEL_PRIORITY = [
  "gemini-2.0-flash",          // fastest + cheapest, preferred if quota exists
  "gemini-1.5-flash-latest",   // legacy alias that maps to latest 1.5 Flash
  "gemini-1.5-pro-latest",     // higher quality fallback
  "gemini-1.0-pro",            // last-resort baseline model
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
      // Reduce noise: brief reason only.
      const status = err.status ?? err.response?.status ?? err.code ?? "unknown";
      console.warn(`Model ${id} unavailable (status ${status}): ${err.message}`);

      // If quota is exhausted, no other models will work with this key; stop early.
      if (String(err.message || "").includes("quota") || status === 429) {
        break;
      }
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

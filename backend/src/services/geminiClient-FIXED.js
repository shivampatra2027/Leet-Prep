import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim();

let gemini = null;
let geminiFacade = null;

const MODEL_PRIORITY = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

function getClient() {
  if (!apiKey) return null;
  if (!gemini) {
    gemini = new GoogleGenerativeAI(apiKey);
  }
  return gemini;
}

function extractRetryAfterSeconds(err) {
  const retryDelay =
    err?.errorDetails?.find?.((item) => item?.["@type"]?.includes("RetryInfo"))
      ?.retryDelay ||
    err?.details?.find?.((item) => item?.["@type"]?.includes("RetryInfo"))
      ?.retryDelay ||
    "";

  const seconds = parseInt(String(retryDelay).replace(/[^\d.]/g, ""), 10);
  if (Number.isFinite(seconds) && seconds > 0) return seconds;

  const message = String(err?.message || "");
  const match = message.match(/retry in\s+([\d.]+)s/i);
  if (match) return Math.max(1, Math.ceil(Number(match[1])));

  return null;
}

function isQuotaError(err) {
  const status = err?.status ?? err?.response?.status ?? err?.code;
  const message = String(err?.message || "").toLowerCase();
  return (
    status === 429 ||
    message.includes("quota exceeded") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted")
  );
}

function isModelError(err) {
  const status = err?.status ?? err?.response?.status ?? err?.code;
  const message = String(err?.message || "").toLowerCase();
  return status === 404 || message.includes("not found") || message.includes("model");
}

function normalizeGeminiError(err) {
  if (isQuotaError(err)) {
    const retryAfter = extractRetryAfterSeconds(err);
    const error = new Error(
      retryAfter
        ? `Gemini quota exceeded (free tier). Retry in ${retryAfter}s or upgrade to paid key.`
        : "Gemini free quota exceeded. Upgrade API key.",
    );
    error.statusCode = 429;
    error.extra = {
      code: "GEMINI_QUOTA_EXCEEDED",
      retryAfter,
    };
    return error;
  }

  if (isModelError(err)) {
    const error = new Error("Gemini model unavailable. Using offline mode.");
    error.statusCode = 503;
    error.extra = { code: "GEMINI_MODEL_UNAVAILABLE", offline: true };
    return error;
  }

  const message = err?.message || "Gemini request failed. Check API key.";
  const error = new Error(message);
  error.statusCode = err?.status ?? err?.response?.status ?? 503;
  return error;
}

async function generateWithFallback(prompt) {
  const client = getClient();
  if (!client) {
    const error = new Error("GOOGLE_GENAI_API_KEY missing. Offline mode.");
    error.statusCode = 503;
    error.extra = { code: "NO_API_KEY", offline: true };
    throw error;
  }

  let lastQuotaError = null;
  let hasModelError = false;

  for (const id of MODEL_PRIORITY) {
    try {
      const model = client.getGenerativeModel({ model: id });
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const status = err?.status ?? err?.response?.status ?? err?.code ?? "unknown";
      const message = String(err?.message || "");
      console.warn(`Gemini model ${id} failed (status ${status}): ${message}`);

      if (isQuotaError(err)) {
        lastQuotaError = err;
        continue;
      }
      if (isModelError(err)) {
        hasModelError = true;
        continue;
      }
      throw err;
    }
  }

  // All models failed
  if (lastQuotaError) {
    throw normalizeGeminiError(lastQuotaError);
  }
  if (hasModelError) {
    // Offline mock response compatible with controllers
    const mockResult = {
      response: {
        text: () => `{"offline":true,"message":"Gemini temporarily unavailable (free quota or model issue). Using enhanced heuristic analysis. Get paid API key for full AI."}`,
      },
    };
    console.warn("Gemini offline - returning mock for compatibility.");
    return mockResult;
  }

  throw normalizeGeminiError(new Error("No Gemini model available."));
}

export async function getGeminiModel() {
  if (!apiKey) {
    return {
      generateContent: async (prompt) => {
        throw normalizeGeminiError(new Error("No API key"));
      }
    };
  }

  if (!geminiFacade) {
    geminiFacade = {
      generateContent: (prompt) => generateWithFallback(prompt),
    };
  }

  return geminiFacade;
}

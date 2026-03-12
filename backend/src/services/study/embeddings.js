import axios from "axios";
import crypto from "crypto";
import { getChromaClient, getChromaConnectionLabel } from "./chromaClient.js";

function getGeminiApiKey() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is missing");
  }
  return apiKey;
}

function getEmbeddingModel() {
  return (process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001").trim();
}

function getModelPath(model) {
  return model.startsWith("models/") ? model : `models/${model}`;
}

function chunkArray(items, size) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableEmbeddingError(error) {
  const status = error?.response?.status;
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const code = String(error?.code || "");
  if (code === "ECONNABORTED" || code === "ETIMEDOUT") return true;
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("timeout") || message.includes("network")) return true;
  return !status;
}

async function postWithRetry(url, data, config, options = {}) {
  const maxAttempts = Math.max(1, Number(options.maxAttempts) || 3);
  const baseDelayMs = Math.max(100, Number(options.baseDelayMs) || 500);

  let attempt = 0;
  while (true) {
    try {
      return await axios.post(url, data, config);
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts || !isRetryableEmbeddingError(error)) {
        throw error;
      }
      const jitter = Math.floor(Math.random() * 100);
      const delay = baseDelayMs * 2 ** (attempt - 1) + jitter;
      await sleep(delay);
    }
  }
}

export function getUserCollectionName(userId) {
  const safeId = String(userId).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `leetprep_study_${safeId}`;
}(userId) {
  const safeId = String(userId).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `leetprep_study_${safeId}`;
}

export function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf("\n", end);
      if (boundary > start + Math.floor(chunkSize * 0.6)) {
        end = boundary;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export async function embedTexts(texts) {
  const filtered = texts.map((text) => String(text || "").trim()).filter(Boolean);
  if (!filtered.length) return [];

  const apiKey = getGeminiApiKey();
  const modelPath = getModelPath(getEmbeddingModel());
  const batchSize = Math.max(1, Number(process.env.GEMINI_EMBED_BATCH_SIZE) || 30);

  const batches = chunkArray(filtered, batchSize);
  const embeddings = [];

  for (const batch of batches) {
    const response = await postWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/${modelPath}:batchEmbedContents`,
      {
        requests: batch.map((text) => ({
          model: modelPath,
          content: {
            parts: [{ text }],
          },
        })),
      },
      {
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
      {
        maxAttempts: Number(process.env.GEMINI_EMBED_MAX_RETRIES) || 3,
        baseDelayMs: Number(process.env.GEMINI_EMBED_RETRY_BASE_MS) || 500,
      },
    );

    const batchEmbeddings = response.data?.embeddings;
    if (!Array.isArray(batchEmbeddings) || batchEmbeddings.length !== batch.length) {
      throw new Error("Gemini returned an unexpected embeddings payload");
    }

    batchEmbeddings.forEach((embedding) => {
      const values = embedding?.values;
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error("Gemini returned an empty embedding vector");
      }
      embeddings.push(values);
    });
  }

  return embeddings;
}

export async function deleteMaterialEmbeddings({ userId, materialId }) {
  const safeUserId = String(userId);
  const safeMaterialId = String(materialId);

  try {
    const client = getChromaClient();
    const collectionName = getUserCollectionName(userId);
    const collection = await client.getCollection({ name: collectionName });
    await collection.delete({
      where: {
        userId: safeUserId,
        materialId: safeMaterialId,
      },
    });
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (
      message.includes("does not exist") ||
      message.includes("not found") ||
      message.includes("requested resource")
    ) {
      return;
    }
    if (
      message.includes("fetch failed") ||
      message.includes("econnrefused") ||
      message.includes("failed to connect to chromadb")
    ) {
      throw new Error(
        `Unable to reach ${getChromaConnectionLabel()}. Configure Chroma Cloud env vars or start a local ChromaDB instance before deleting study material embeddings.`,
      );
    }
    throw error;
  }
}

export async function deleteUserEmbeddings({ userId }) {
  const safeUserId = String(userId);

  try {
    const client = getChromaClient();
    const collectionName = getUserCollectionName(userId);
    const collection = await client.getCollection({ name: collectionName });
    await collection.delete({
      where: {
        userId: safeUserId,
      },
    });
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (
      message.includes("does not exist") ||
      message.includes("not found") ||
      message.includes("requested resource")
    ) {
      return;
    }
    if (
      message.includes("fetch failed") ||
      message.includes("econnrefused") ||
      message.includes("failed to connect to chromadb")
    ) {
      throw new Error(
        `Unable to reach ${getChromaConnectionLabel()}. Configure Chroma Cloud env vars or start a local ChromaDB instance before deleting study material embeddings.`,
      );
    }
    throw error;
  }
}
export async function storeDocumentEmbeddings({
  userId,
  materialId,
  filename,
  text,
}) {
  const chunks = splitTextIntoChunks(text);
  if (!chunks.length) {
    throw new Error("No chunks generated from uploaded text");
  }

  try {
    const client = getChromaClient();
    const collectionName = getUserCollectionName(userId);
    const collection = await client.getOrCreateCollection({ name: collectionName });
    const embeddings = await embedTexts(chunks);
    const now = Date.now();

    await collection.add({
      ids: chunks.map(
        (_, index) => `${materialId}-${now}-${index}-${crypto.randomUUID()}`,
      ),
      documents: chunks,
      embeddings,
      metadatas: chunks.map((_, index) => ({
        userId: String(userId),
        materialId: String(materialId),
        filename,
        chunkIndex: index,
        createdAt: new Date(now).toISOString(),
      })),
    });

    return {
      collectionName,
      chunkCount: chunks.length,
      charCount: text.length,
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (
      message.includes("fetch failed") ||
      message.includes("econnrefused") ||
      message.includes("failed to connect to chromadb")
    ) {
      throw new Error(
        `Unable to reach ${getChromaConnectionLabel()}. Configure Chroma Cloud env vars or start a local ChromaDB instance before indexing study material.`,
      );
    }
    throw error;
  }
}
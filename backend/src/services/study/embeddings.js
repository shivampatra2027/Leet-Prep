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

export function getUserCollectionName(userId) {
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

  return Promise.all(
    filtered.map(async (text) => {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/${modelPath}:embedContent`,
        {
          content: {
            parts: [{ text }],
          },
        },
        {
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        },
      );

      const values = response.data?.embedding?.values;
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error("Gemini returned an empty embedding vector");
      }
      return values;
    }),
  );
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

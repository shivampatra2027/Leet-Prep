import { getChromaClient, getChromaConnectionLabel } from "./chromaClient.js";
import { embedTexts, getUserCollectionName } from "./embeddings.js";

export async function retrieveStudyContext(userId, query, limit = 5) {
  const prompt = String(query || "").trim();
  if (!prompt) {
    throw new Error("Query is required");
  }

  try {
    const collectionName = getUserCollectionName(userId);
    const client = getChromaClient();
    const collection = await client.getCollection({ name: collectionName });
    const queryEmbeddings = await embedTexts([prompt]);
    const result = await collection.query({
      queryEmbeddings,
      nResults: limit,
      include: ["documents", "metadatas"],
    });

    const documents = result?.documents?.[0] || [];
    const metadatas = result?.metadatas?.[0] || [];

    return documents
      .map((document, index) => ({
        document,
        metadata: metadatas[index] || {},
      }))
      .filter((item) => item.document);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (
      message.includes("does not exist") ||
      message.includes("not found") ||
      message.includes("requested resource")
    ) {
      return [];
    }
    if (
      message.includes("fetch failed") ||
      message.includes("econnrefused") ||
      message.includes("failed to connect to chromadb")
    ) {
      throw new Error(
        `Unable to reach ${getChromaConnectionLabel()}. Configure Chroma Cloud env vars or start a local ChromaDB instance before querying study assistant data.`,
      );
    }
    throw error;
  }
}

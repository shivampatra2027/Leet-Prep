import { ChromaClient, CloudClient } from "chromadb";

let chromaClient = null;

function isTruthy(value = "") {
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function getCloudConfig() {
  return {
    enabled: isTruthy(process.env.CHROMA_CLOUD_ENABLED),
    apiKey: process.env.CHROMA_API_KEY?.trim() || "",
    tenant: process.env.CHROMA_TENANT?.trim() || "",
    database: process.env.CHROMA_DATABASE?.trim() || "",
    host: process.env.CHROMA_CLOUD_HOST?.trim() || "api.trychroma.com",
    port: Number(process.env.CHROMA_CLOUD_PORT || 443),
  };
}

function useCloud(config) {
  return config.enabled || Boolean(config.apiKey);
}

function getLocalChromaUrl() {
  return process.env.CHROMA_URL || "http://127.0.0.1:8000";
}

export function getChromaConnectionLabel() {
  const cloud = getCloudConfig();
  if (useCloud(cloud)) {
    return `Chroma Cloud (${cloud.host})`;
  }
  return getLocalChromaUrl();
}

export function getChromaClient() {
  if (chromaClient) return chromaClient;

  const cloud = getCloudConfig();

  if (useCloud(cloud)) {
    if (!cloud.apiKey) {
      throw new Error("CHROMA_API_KEY is missing for Chroma Cloud mode");
    }
    if (!cloud.tenant) {
      throw new Error("CHROMA_TENANT is missing for Chroma Cloud mode");
    }
    if (!cloud.database) {
      throw new Error("CHROMA_DATABASE is missing for Chroma Cloud mode");
    }

    chromaClient = new CloudClient({
      apiKey: cloud.apiKey,
      tenant: cloud.tenant,
      database: cloud.database,
      host: cloud.host,
      port: cloud.port,
    });
    return chromaClient;
  }

  const parsed = new URL(getLocalChromaUrl());
  chromaClient = new ChromaClient({
    host: parsed.hostname,
    port: Number(parsed.port || (parsed.protocol === "https:" ? 443 : 8000)),
    ssl: parsed.protocol === "https:",
  });

  return chromaClient;
}

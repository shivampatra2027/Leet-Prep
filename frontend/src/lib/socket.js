function resolveSocketUrl() {
  const envUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    "https://api.leetcodepremium.xyz";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";

    if (isLocal) {
      return `${window.location.protocol}//${host}:8080`;
    }

    if (host === "leetcodepremium.xyz" || host === "www.leetcodepremium.xyz") {
      return "https://api.leetcodepremium.xyz";
    }
  }

  return envUrl;
}

export const SOCKET_URL = resolveSocketUrl();

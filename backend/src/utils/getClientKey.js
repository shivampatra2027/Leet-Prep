function firstHeaderValue(value) {
  if (!value) return "";
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value).trim();
}

export function getClientKey(req) {
  const ip =
    firstHeaderValue(req.headers["cf-connecting-ip"]) ||
    firstHeaderValue(req.headers["x-real-ip"]) ||
    firstHeaderValue(req.headers["x-forwarded-for"]).split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const ua = String(req.headers["user-agent"] || "ua").slice(0, 60);
  return `${ip}:${ua}`;
}


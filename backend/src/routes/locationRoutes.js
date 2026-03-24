import express from "express";

const router = express.Router();

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;

  if (!rawIp) return null;

  // Normalize IPv4-mapped IPv6 addresses like ::ffff:1.2.3.4
  let normalizedIp = rawIp.startsWith("::ffff:") ? rawIp.slice(7) : rawIp;

  // Strip optional port suffix from IPv4 values like 1.2.3.4:1234
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(normalizedIp)) {
    normalizedIp = normalizedIp.split(":")[0];
  }

  return normalizedIp;
};

router.get("/", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    console.log("[location] client ip:", clientIp);

    if (clientIp === "127.0.0.1" || clientIp === "::1") {
      console.log("[location] localhost detected, returning IN");
      return res.json({ country: "IN" });
    }

    const lookupUrl = clientIp
      ? `https://ipapi.co/${encodeURIComponent(clientIp)}/json/`
      : "https://ipapi.co/json/";

    const response = await fetch(lookupUrl);
    if (!response.ok) {
      throw new Error(`ipapi lookup failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("[location] provider response:", data);
    const country = data?.country?.toUpperCase();
    console.log("[location] resolved country:", country || "US");

    if (/^[A-Z]{2}$/.test(country)) {
      return res.json({ country });
    }

    return res.json({ country: "US" });
  } catch (error) {
    console.error("[location] route error:", error);
    return res.json({ country: "US" });
  }
});

export default router;

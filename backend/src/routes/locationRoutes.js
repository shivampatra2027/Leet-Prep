import express from "express";

const router = express.Router();

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress;

  if (!rawIp) return null;

  // Normalize IPv4-mapped IPv6 addresses like ::ffff:1.2.3.4
  return rawIp.startsWith("::ffff:") ? rawIp.slice(7) : rawIp;
};

router.get("/", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const lookupUrl = clientIp
      ? `https://ipwho.is/${encodeURIComponent(clientIp)}`
      : "https://ipwho.is/";

    const response = await fetch(lookupUrl);
    if (!response.ok) {
      throw new Error(`ipwho.is lookup failed with status ${response.status}`);
    }

    const data = await response.json();
    const country = data?.country_code?.toUpperCase();

    if (data?.success && /^[A-Z]{2}$/.test(country)) {
      return res.json({ country });
    }

    return res.json({ country: "US" });
  } catch (error) {
    console.error("Location route error:", error.message);
    return res.json({ country: "US" });
  }
});

export default router;

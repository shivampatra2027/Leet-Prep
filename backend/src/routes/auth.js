import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import passport from "../auth/google.js";
import { isGoogleAuthConfigured } from "../auth/google.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const router = express.Router();
const REFRESH_COOKIE = "refreshToken";

function requireGoogleOAuth(req, res, next) {
  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({
      error: "Google OAuth is not configured on this server.",
    });
  }
  return next();
}

function normalizeDomain(value = "") {
  const raw = value.trim().toLowerCase();
  if (!raw) return "";

  let host = raw;
  // Accept either plain domain (leetcodepremium.xyz) or full URL.
  if (raw.includes("://")) {
    try {
      host = new URL(raw).hostname.toLowerCase();
    } catch {
      host = raw;
    }
  }

  return host
    .replace(/^\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function normalizeHost(value = "") {
  const raw = value.split(",")[0]?.trim().toLowerCase() || "";
  return raw.replace(/:\d+$/, "");
}

function resolveRequestHost(req) {
  return (
    normalizeHost(req.headers["x-forwarded-host"]) ||
    normalizeHost(req.headers.host) ||
    normalizeHost(req.hostname)
  );
}

function resolveRequestProto(req) {
  const xfProto = (req.headers["x-forwarded-proto"] || "")
    .toString()
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (xfProto === "http" || xfProto === "https") return xfProto;
  return req.secure ? "https" : "http";
}

function normalizeOrigin(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.host}`.replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getCanonicalApiOrigin() {
  return (
    normalizeOrigin(process.env.API_PUBLIC_URL || "") ||
    normalizeOrigin(process.env.BACKEND_URL || "")
  );
}

function shouldRedirectToCanonicalApi(req) {
  const canonical = getCanonicalApiOrigin();
  if (!canonical) return false;
  try {
    const canonicalUrl = new URL(canonical);
    const reqHost = resolveRequestHost(req);
    const reqProto = resolveRequestProto(req);
    return (
      reqHost &&
      (reqHost !== canonicalUrl.host.toLowerCase() ||
        reqProto !== canonicalUrl.protocol.replace(":", ""))
    );
  } catch {
    return false;
  }
}

function redirectToCanonicalApi(req, res, next) {
  if (!shouldRedirectToCanonicalApi(req)) return next();
  const canonical = getCanonicalApiOrigin();
  const target = `${canonical}${req.originalUrl}`;
  return res.redirect(307, target);
}

function resolveSameSite(isProd, useConfiguredDomain, requestHost) {
  const configured = (process.env.COOKIE_SAME_SITE || "").trim().toLowerCase();
  if (configured === "lax" || configured === "strict" || configured === "none") {
    return configured;
  }

  if (!isProd) return "lax";
  if (useConfiguredDomain) return "lax";

  // Preserve legacy cross-site login behavior for *.onrender.com setups.
  if (requestHost.endsWith(".onrender.com")) return "none";
  return "lax";
}

function getRefreshCookieOptions(req) {
  const isProd = process.env.NODE_ENV === "production";
  const configuredDomain = normalizeDomain(process.env.COOKIE_DOMAIN || "");
  const requestHost = resolveRequestHost(req);
  const domainMatchesHost =
    Boolean(configuredDomain) &&
    (requestHost === configuredDomain ||
      requestHost.endsWith(`.${configuredDomain}`));
  const useDomainAttribute =
    process.env.COOKIE_USE_DOMAIN === "1" && domainMatchesHost;
  const sameSite = resolveSameSite(isProd, useDomainAttribute, requestHost);

  return {
    httpOnly: true,
    secure: isProd,
    sameSite,
    // Host-only cookie by default is the most reliable across custom domains/CDNs.
    // Enable COOKIE_USE_DOMAIN=1 only when you explicitly need parent-domain scope.
    domain: isProd && useDomainAttribute ? `.${configuredDomain}` : undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function issueTokens(req, res, user) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  const cookieOptions = getRefreshCookieOptions(req);
  res.cookie(REFRESH_COOKIE, refresh, cookieOptions);
  return access;
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith("@kiit.ac.in")) {
      return res.status(403).json({ error: "Only KIIT Mail is allowed.." });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Use findOneAndUpdate with upsert to prevent race conditions
    // This is atomic - prevents duplicate users even with simultaneous requests
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name,
          email,
          passwordHash,
          tier: "free",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    // Check if user already existed (has a different password hash)
    if (user.passwordHash && user.passwordHash !== passwordHash) {
      return res.status(400).json({ error: "User already exists" });
    }

    const access = issueTokens(req, res, user);
    res.json({ access });
  } catch (error) {
    console.error("Signup error:", error);
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const access = issueTokens(req, res, user);
  res.json({ access });
});

router.get(
  "/google",
  requireGoogleOAuth,
  redirectToCanonicalApi,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  requireGoogleOAuth,
  redirectToCanonicalApi,
  passport.authenticate("google", {
    failureRedirect: "/auth/fail",
    session: false,
  }),
  (req, res) => {
    const access = issueTokens(req, res, req.user);
    const frontend = (
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      process.env.CORS_ORIGIN ||
      "http://localhost:5173"
    ).replace(/\/$/, "");
    res.redirect(`${frontend}/oauth-success?token=${access}`);
  },
);

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("_id email tier");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const access = signAccessToken(user);
    return res.json({ access });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", (req, res) => {
  const cookieOptions = {
    ...getRefreshCookieOptions(req),
    expires: new Date(0),
  };
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.json({ success: true });
});

router.get("/fail", (req, res) => {
  res.status(401).json({ error: "Google auth failed or non-KIIT email" });
});
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default router;

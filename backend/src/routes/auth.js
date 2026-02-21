import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import passport from "../auth/google.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const router = express.Router();
const REFRESH_COOKIE = "refreshToken";

function getRefreshCookieOptions() {
  const isLocalEnv = process.env.NODE_ENV === "development";
  const secure = !isLocalEnv;
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function issueTokens(res, user) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE, refresh, getRefreshCookieOptions());
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

    const access = issueTokens(res, user);
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

  const access = issueTokens(res, user);
  res.json({ access });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/fail",
    session: false,
  }),
  (req, res) => {
    const access = issueTokens(res, req.user);
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
  res.clearCookie(REFRESH_COOKIE, {
    ...getRefreshCookieOptions(),
    expires: new Date(0),
  });
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

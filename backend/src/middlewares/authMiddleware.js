import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { recordActiveDayEvent } from "../controllers/referralController.js";

// Track a login for the user: increment count and record today's date.
// Also fires active_next_day referral event if eligible.
// Fire-and-forget — never blocks the request.
function trackLogin(user, ip) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyLoggedToday = user.loginDates?.some(
    (d) => new Date(d).toISOString().slice(0, 10) === todayStr,
  );
  if (alreadyLoggedToday) return;

  User.findByIdAndUpdate(user._id, {
    $inc: { loginCount: 1 },
    $push: { loginDates: { $each: [new Date()], $slice: -5 } },
    $set: { lastIp: ip },
  }).catch(() => {});

  // Trigger active_next_day reward if invitee logs in after day-0
  if (user.referredBy) {
    recordActiveDayEvent(user._id).catch(() => {});
  }
}

const downgradeExpiredPremium = async (user) => {
  if (user?.tier !== "premium" || !user.premiumExpiresAt) return;

  if (new Date() > new Date(user.premiumExpiresAt)) {
    user.tier = "free";
    user.premiumExpiresAt = null;
    await user.save();
    console.log(`User ${user._id} premium expired - downgraded to free`);
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1) Passport session (Google OAuth, browser)
    if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
      await downgradeExpiredPremium(req.user);
      return next();
    }

    // 2) JWT (API / Postman)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      let token = authHeader.split(" ")[1];

      // Strip quotes if present (common localStorage serialization bug)
      if (token?.startsWith('"') && token?.endsWith('"')) {
        token = token.slice(1, -1);
      }

      if (!process.env.JWT_SECRET) {
        console.error("Auth error: JWT_SECRET missing in environment");
        return res.status(500).json({ error: "Server configuration error" });
      }

      if (!token || token.trim() === "") {
        return res.status(401).json({ error: "Token missing" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      req.user = await User.findById(decoded.id).select("-passwordHash");
      if (!req.user) {
        return res.status(401).json({ error: "User not found" });
      }

      await downgradeExpiredPremium(req.user);

      // Fire-and-forget login tracking + active_next_day reward
      const ip =
        req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
      trackLogin(req.user, ip);

      return next();
    }

    return res.status(401).json({ error: "Not authenticated" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication error" });
  }
};

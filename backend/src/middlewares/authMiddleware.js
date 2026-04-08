import User from "../models/User.js";
import { recordActiveDayEvent } from "../controllers/referralController.js";
import { verifyAccessToken } from "../utils/jwt.js";

function getDataDeletionAt() {
  const deletionDate = new Date();
  deletionDate.setMonth(deletionDate.getMonth() + 3);
  return deletionDate;
}

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
    user.subscriptionStatus = "expired";
    user.subscriptionEndDate = null;
    user.premiumExpiresAt = null;
    await user.save();
    console.log(`User ${user._id} premium expired - downgraded to free`);
  }
};

function refreshDataRetention(user) {
  if (!user?._id) return;

  const nextDeletionAt = getDataDeletionAt();
  const currentDeletionAt = user.dataDeletionAt
    ? new Date(user.dataDeletionAt)
    : null;
  const minAcceptableDeletionAt = new Date();
  minAcceptableDeletionAt.setDate(minAcceptableDeletionAt.getDate() + 75);

  if (
    currentDeletionAt &&
    Number.isFinite(currentDeletionAt.getTime()) &&
    currentDeletionAt > minAcceptableDeletionAt
  ) {
    return;
  }

  user.dataDeletionAt = nextDeletionAt;
  User.findByIdAndUpdate(user._id, {
    $set: { dataDeletionAt: nextDeletionAt },
  }).catch(() => {});
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }

    let token = authHeader.split(" ")[1];
    if (token?.startsWith('"') && token?.endsWith('"')) {
      token = token.slice(1, -1);
    }

    if (!token || token.trim() === "") {
      return res.status(401).json({ error: "Token missing" });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    await downgradeExpiredPremium(user);
    refreshDataRetention(user);
    req.user = user;

    // Fire-and-forget login tracking + active_next_day reward
    const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
    trackLogin(user, ip);

    return next();
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

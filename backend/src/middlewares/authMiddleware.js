import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Passport session (Google OAuth, browser)
    if (req.isAuthenticated && req.isAuthenticated()) {
      // Check if premium has expired for authenticated user
      if (
        req.user &&
        req.user.tier === "premium" &&
        req.user.premiumExpiresAt
      ) {
        if (new Date() > new Date(req.user.premiumExpiresAt)) {
          // Premium expired - downgrade to free
          req.user.tier = "free";
          req.user.premiumExpiresAt = null;
          await req.user.save();
          console.log(
            `User ${req.user._id} premium expired - downgraded to free`,
          );
        }
      }
      return next();
    }

    // 2️⃣ JWT (API / Postman)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Token missing" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error("Auth error: JWT verify failed:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        console.error("Auth error: user not found for token id", decoded.id);
        return res.status(401).json({ error: "User not found" });
      }

      // Check if premium has expired
      if (req.user.tier === "premium" && req.user.premiumExpiresAt) {
        if (new Date() > new Date(req.user.premiumExpiresAt)) {
          // Premium expired - downgrade to free
          req.user.tier = "free";
          req.user.premiumExpiresAt = null;
          await req.user.save();
          console.log(
            `User ${req.user._id} premium expired - downgraded to free`,
          );
        }
      }

      return next();
    }

    // 3️⃣ No auth at all
    return res.status(401).json({ error: "Not authenticated" });
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or malformed token" });
  }
};

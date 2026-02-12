import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Passport session (Google OAuth, browser)
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // 2️⃣ JWT (API / Postman)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Token missing" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ error: "User not found" });
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

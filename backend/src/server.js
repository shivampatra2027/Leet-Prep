import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import authRouter from "./routes/auth.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import sheetRoutes from "./routes/sheetRoutes.js";
import "./jobs/contestJob.js"; // Start contest cron job
import "./jobs/referralJob.js"; // Start referral weekly reset cron job
import { apiLimiter } from "./middlewares/rateLimiters.js";
dotenv.config();
configureGoogleStrategy();

const app = express();
app.set("trust proxy", true);

// Handle CLIENT_URL - support both www and non-www versions
// Vercel frontend is at www.leetcodepremium.xyz but env might have either version
const CLIENT_URL = (
  process.env.CLIENT_URL || "https://www.leetcodepremium.xyz"
).replace(/\/$/, "");
const SITE_URL = CLIENT_URL;

// CORS configuration - support both Render and Vercel deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  // Frontend URLs
  "https://leet-io-frontend.onrender.com",
  "https://leet-io.vercel.app",
  "https://www.leet-io.vercel.app",
  "https://leet-prep.vercel.app",
  "https://www.leetcodepremium.xyz",
  "https://leetcodepremium.xyz",
  // Backend URLs (for OAuth callbacks)
  "https://leet-io-backend.onrender.com",
  "https://leet-io-back.vercel.app",
  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
].filter(Boolean);

// Allow additional dev ports if not in production
if (process.env.NODE_ENV !== "production") {
  const devOrigins = ["http://localhost:5174", "http://127.0.0.1:5174"];
  devOrigins.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// app.use(session({
//     secret: process.env.JWT_SECRET || "supersecret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: true,                          // Force true on Render
//         sameSite: "none",                      // Required for cross-site
//         httpOnly: true,                        // Prevent JS access
//         maxAge: 24 * 60 * 60 * 1000             // Optional: 24 hours
//     }
// }));

app.use(passport.initialize());
app.use(cookieParser());

// Razorpay webhooks need raw body for signature verification
const jsonParser = express.json();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    return next();
  }
  return jsonParser(req, res, next);
});

app.use(helmet());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Baseline API throttling (proxy-aware + OPTIONS/webhook-safe).
app.use("/api", apiLimiter);

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/auth", authRouter);
app.use("/api/likes", likeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/sheets", sheetRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use(errorHandler);

// Export the app for Vercel serverless
export default app;

// Only start the server if not running in Vercel serverless environment
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 8080;
  connectDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  });
} else {
  // In Vercel, connect to DB immediately.
  connectDb();
}

import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import authRouter from "./routes/auth.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
dotenv.config();
configureGoogleStrategy();

const app = express();
const SITE_URL = (
  process.env.CLIENT_URL || "https://leet-prep.vercel.app"
).replace(/\/$/, "");

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://leet-io-frontend.onrender.com",
  "https://leet-prep.vercel.app",
  "https://www.leetcodepremium.xyz",
  "https://leetcodepremium.xyz",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

// Allow additional dev ports if not in production
if (process.env.NODE_ENV !== "production") {
  const devOrigins = ["http://localhost:5174", "http://127.0.0.1:5174"];
  devOrigins.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

console.log("🌐 Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        console.error("   Allowed origins:", allowedOrigins);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  }),
);

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
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

app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * Razorpay webhooks must receive the exact raw request body for
 * signature verification. We attach a raw body parser for that path
 * first, then fall back to the normal JSON parser for every other route.
 */
const jsonParser = express.json();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    return next();
  }
  return jsonParser(req, res, next);
});

app.use(helmet());

// Robots.txt
app.get("/robots.txt", (req, res) => {
  res
    .type("text/plain")
    .send(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// Simple sitemap (public pages)
app.get("/sitemap.xml", (req, res) => {
  const urls = ["/", "/login", "/premium", "/freedashboard"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) =>
      `<url><loc>${SITE_URL}${path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  )
  .join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
});

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/auth", authRouter);
app.use("/api/likes", likeRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/debug", debugRoutes);

// Google OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;
      const redirectPath =
        user.tier === "premium" ? "/dashboard" : "/freedashboard";
      res.redirect(`${process.env.CLIENT_URL}${redirectPath}`);
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect(`${process.env.CLIENT_URL}/freedashboard`);
    }
  },
);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});

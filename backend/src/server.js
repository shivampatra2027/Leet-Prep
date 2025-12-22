import 'dotenv/config';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import authRouter, { authMiddleware } from "./routes/auth.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";

configureGoogleStrategy();
dotenv.config();



const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,   // frontend dev server
    credentials: true                  // allow cookies/Authorization headers
}));

app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/auth", authRouter);

// Error handler (must be last)
app.use(errorHandler);
app.get("/", (req, res) => { res.send("Backend is running 🚀"); });

const PORT = process.env.PORT || 8080;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
});

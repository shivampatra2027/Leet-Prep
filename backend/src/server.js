import 'dotenv/config';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import authRouter, { authMiddleware } from "./routes/auth.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";

configureGoogleStrategy();
dotenv.config();



const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/problems", problemRoutes);
app.use("/auth", authRouter);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
});

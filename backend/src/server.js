import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import helmet from "helmet";
import cors from "cors";
import problemRoutes from "./routes/problemRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await connectDb(process.env.MONGO_URI);
        const app = express();
        app.use(express.json());
        app.use(helmet());
        app.use(cors());

        // ROOT ROUTE
        app.get("/", (_, res) => {
            return res.status(200).json({
                ok: true,
                service: "leetIO-backend-service",
            });
        });

        // API ROUTES
        app.use("/api/problems", problemRoutes);

        app.use((_, res) => {
            return res.status(404).json({
                status: "failure",
                message: "Route not found!",
            });
        });
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";

dotenv.config();


const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api", problemRoutes);


const PORT = process.env.PORT || 8080;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

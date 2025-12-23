import 'dotenv/config';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";   
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import authRouter from "./routes/auth.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();              
configureGoogleStrategy();    

const app = express();

app.use(session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }
}));

app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://leet-io-frontend.onrender.com',
    'http://localhost:5173', // for local development
    'http://localhost:3000'
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/auth", authRouter);

// Google OAuth routes
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

app.get("/", (req, res) => { res.send("Backend is running 🚀"); });


app.use(errorHandler);

const PORT = process.env.PORT || 8080;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
});

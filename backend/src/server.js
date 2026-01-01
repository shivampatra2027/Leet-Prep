import 'dotenv/config';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";   
import { connectDb } from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import authRouter from "./routes/auth.js";
import passport, { configureGoogleStrategy } from "./auth/google.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import paymentRoutes from './routes/paymentRoutes.js'
dotenv.config();              
configureGoogleStrategy();    

const app = express();

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,                // e.g. https://leetcodepremium.xyz
    "https://leet-io-frontend.onrender.com",
    "https://leetcodepremium.xyz",
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow curl/postman/mobile apps

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Explicitly handle preflight requests
// app.options("/*", cors());


app.use(session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,                          // Force true on Render
        sameSite: "none",                      // Required for cross-site
        httpOnly: true,                        // Prevent JS access
        maxAge: 24 * 60 * 60 * 1000             // Optional: 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/auth", authRouter);


// Google OAuth routes
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            const user = req.user;
            const redirectPath = user.tier === 'premium' ? '/dashboard' : '/freedashboard';
            res.redirect(`${process.env.CLIENT_URL}${redirectPath}`);
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect(`${process.env.CLIENT_URL}/freedashboard`);
        }
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

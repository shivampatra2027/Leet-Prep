import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import passport from "../auth/google.js";

const router = express.Router();
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email.endsWith("@kiit.ac.in")) {
        return res.status(403).json({ error: "Only KIIT Mail is allowed.." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash });
    await user.save();

    res.json({ message: "Registration successful" });
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
});

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/fail", session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const frontend = process.env.CORS_ORIGIN || "http://localhost:3000";
        res.redirect(`${frontend}/login?token=${token}`);
    }
);

router.get("/fail", (req, res) => {
    res.status(401).json({ error: "Google auth failed or non-KIIT email" });
});
export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

export default router;

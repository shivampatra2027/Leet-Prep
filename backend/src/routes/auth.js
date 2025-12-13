import bcrypt from "bcrypt"
import User from "../models/User.js"
import jwt from "jsonwebtoken";

router.post("/register",async(req,res)=>{
    const {email,password}=req.body;
    if(!email.endsWith("@kiit.ac.in")){
        return res.status(403).json({
            error:"Only Kiit Mail is allowed.."
        })
    }

    const passwordHash = await bcrypt.hash(password,10);
    const user = new User({email,passwordHash})
    await user.save();

    res.json({message:"Reistration successfull"});
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

function authMiddleware(req, res, next) {
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

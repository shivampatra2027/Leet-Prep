import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem.js";

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Problem.countDocuments({ difficulty: { $ne: 'Unknown' } });
    console.log('Problems with known difficulty:', count);
    const total = await Problem.countDocuments();
    console.log('Total problems:', total);
    const sortCount = await Problem.countDocuments({ sortOrder: { $exists: true } });
    console.log('Problems with sortOrder:', sortCount);
    process.exit(0);
}

check();
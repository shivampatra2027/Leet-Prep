import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem.js";

const difficultyOrder = { easy: 1, medium: 2, hard: 3, unknown: 4 };

const getSortOrder = (difficulty) => {
    const diff = (difficulty || 'unknown').toLowerCase();
    console.log(`getSortOrder: difficulty=${difficulty}, diff=${diff}, order=${difficultyOrder[diff]}`);
    return difficultyOrder[diff];
};

dotenv.config();

async function updateSortOrder() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems`);

    for (const problem of problems) {
        try {
            const sortOrder = getSortOrder(problem.difficulty);
            await Problem.updateOne({ _id: problem._id }, { $set: { sortOrder } });
        } catch (error) {
            console.error('Error updating:', error);
        }
    }

    console.log("Update completed");
    process.exit(0);
}

updateSortOrder().catch(console.error);
// backend/src/config/db.js
import mongoose from "mongoose";
export const connectDb = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MongoDB connection error: MONGODB_URI is not defined");
        return false;
    }

    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        return false;
    }
};

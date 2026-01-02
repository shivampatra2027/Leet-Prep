// models/SiteLike.js
import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    siteKey: {
        type: String,
        required: true,
        unique: true,
        default: "global"
    },
    totalLikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const SiteLike = mongoose.model("SiteLike", LikeSchema);

export default SiteLike;
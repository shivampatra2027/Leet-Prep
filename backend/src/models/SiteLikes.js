import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    siteKey: {
        type: String,
        required: true,
        unique: true,
        default: "global"
    },
    likedBy: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const SiteLike = mongoose.model("SiteLike", LikeSchema);

export default SiteLike;
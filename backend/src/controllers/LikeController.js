// controllers/likeController.js
import SiteLike from "../models/SiteLikes.js"; 

export const likeSite = async (req, res) => {
    try {
        const identifier = req.user?._id?.toString() || req.ip;

        const updated = await SiteLike.findOneAndUpdate(
            { siteKey: "global" }, 
            { $addToSet: { likedBy: identifier } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ totalLikes: updated.likedBy.length });
    } catch (error) {
        console.error("Like error:", error.message);
        res.status(500).json({ ok: false, message: "Internal Server error!" });
    }
};

export const getLikes = async (req, res) => {
    try {
        const siteLike = await SiteLike.findOne({ siteKey: "global" });  // ← Changed
        const total = siteLike?.likedBy?.length || 0;
        res.json({ totalLikes: total });
    } catch (error) {
        console.error("Get likes error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
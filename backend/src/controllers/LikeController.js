// controllers/likeController.js
import SiteLike from "../models/SiteLikes.js";  // Make sure filename is SiteLike.js (singular)

export const likeSite = async (req, res) => {
    try {
        const updated = await SiteLike.findOneAndUpdate(
            { siteKey: "global" },
            { $inc: { totalLikes: 10 } },  // Just increase the counter by 1
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ totalLikes: updated.totalLikes });
    } catch (error) {
        console.error("Like error:", error.message);
        res.status(500).json({ message: "Internal Server error!" });
    }
};

export const getLikes = async (req, res) => {
    try {
        const siteLike = await SiteLike.findOne({ siteKey: "global" });
        const total = siteLike?.totalLikes || 0;
        res.json({ totalLikes: total });
    } catch (error) {
        console.error("Get likes error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
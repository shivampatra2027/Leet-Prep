import DailyActivity from "../models/DailyActivity.js";

export async function getLeetCodeHeatmap(req, res) {
    try {
        const user = req.user;

        // Defensive check
        if (!user) {
            console.error("Heatmap request without authenticated user");
            return res.status(401).json({ error: "Not authenticated" });
        }

        const query = {
            user: user._id,
            platform: "leetcode"
        };

        // Log user and query for diagnostics
        console.log("Heatmap fetch for user:", { id: user._id?.toString?.(), tier: user.tier });
        console.log("Heatmap query:", query);

        // Free tier users can only see last 30 days
        if (user.tier === "free") {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];
            query.date = { $gte: thirtyDaysAgo };
        }

        const data = await DailyActivity.find(query)
            .select("date count -_id")
            .sort({ date: 1 });

        res.json(data);
    } catch (error) {
        console.error("Error fetching heatmap:", error);
        res.status(500).json({ error: "Failed to fetch heatmap data" });
    }
}

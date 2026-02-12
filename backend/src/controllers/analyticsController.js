import DailyActivity from "../models/DailyActivity.js";

export async function getLeetCodeHeatmap(req, res) {
    try {
        const user = req.user;

        const query = {
            user: user._id,
            platform: "leetcode"
        };

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

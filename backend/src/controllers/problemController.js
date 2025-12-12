import Problem from "../models/Problem.js";

export const getAllProblems = async (req, res) => {
    try {
        const { difficulty, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (difficulty) {
            query.difficulty = difficulty;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const problems = await Problem.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Problem.countDocuments(query);

        return res.status(200).json({
            ok: true,
            data: problems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalProblems: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch problems",
            error: error.message
        });
    }
};

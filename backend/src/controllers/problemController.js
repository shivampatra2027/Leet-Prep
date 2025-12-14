
import Problem from "../models/Problem.js";

export const getAllProblems = async (req, res) => {
    try {
        const { difficulty, company, q, page = 1, limit = 50 } = req.query;

        const query = {};
        if (difficulty) query.difficulty = difficulty;
        if (company) query.companies = new RegExp(`^${company}$`, "i");
        if (q) query.title = { $regex: q, $options: "i" };

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const [problems, total] = await Promise.all([
            Problem.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
            Problem.countDocuments(query)
        ]);

        res.json({
            ok: true,
            data: problems,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalProblems: total,
                limit: limitNum
            }
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch problems", error: err.message });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const companies = await Problem.distinct("companies");
        res.json({ ok: true, data: companies.sort() });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch companies", error: err.message });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).lean();
        if (!problem) return res.status(404).json({ ok: false, message: "Problem not found" });
        res.json({ ok: true, data: problem });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch problem", error: err.message });
    }
};

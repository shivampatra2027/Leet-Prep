import Problem from "../models/Problem.js";
import {getCache,setCache} from "../utils/cache.js"


export const getAllProblems = async (req, res) => {
    try {
        const { difficulty, company, q, page = 1, limit = 50 } = req.query;
        const cacheKey = `problems:${difficulty || "all"}:${company || "all"}:${page}:${limit}` 
        const cached = await getCache(cacheKey);
        if(cached) return res.json(cached);

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

        const response={
            ok: true,
            data: problems,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalProblems: total,
                limit: limitNum
            }
            
        };
        await setCache(cacheKey, response, 300);
        res.json(response);
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch problems", error: err.message });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const cacheKey = "companies:List";
        const cached = await getCache(cacheKey);
        if(cached) return res.json({ok:true,data:cached});

        const companies = await Problem.distinct("companies");

        const sorted = companies.sort();

        await setCache(cacheKey,sorted,600);
        res.json({ ok: true, data: sorted });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch companies", error: err.message });
    }
};
export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `problem:${id}`;

        const cached = await getCache(cacheKey);
        if (cached) return res.json({ ok: true, data: cached });

        const problem = await Problem.findById(id).lean();
        if (!problem) {
            return res.status(404).json({
                ok: false,
                message: "Problem not found"
            });
        }

        await setCache(cacheKey, problem, 600); // cache for 10 minutes
        res.status(200).json({ ok: true, data: problem });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Failed to fetch problem", error: err.message });
    }
};

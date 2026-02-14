import mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Problem from "../models/Problem.js";
import { fetchProblemDetails } from "../utils/leetcodeService.js";

const parseOccurrences = (value) => {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const acceptanceToDifficulty = (rate) => {
    if (rate == null || Number.isNaN(rate)) return "medium";
    if (rate >= 0.45) return "easy";
    if (rate >= 0.30) return "medium";
    return "hard";
};

const difficultyOrder = { easy: 1, medium: 2, hard: 3, unknown: 4 };

const resolveDifficulty = (difficulty, acceptance) => {
    if (difficulty && difficulty !== "Unknown") {
        return difficulty.toLowerCase();
    }

    return acceptanceToDifficulty(acceptance);
};

const getSortOrder = (difficulty) => {
    const diff = (difficulty || 'unknown').toLowerCase();
    return difficultyOrder[diff];
};

const sortProblems = (problems) => {
    return problems.sort((a, b) => {
        const aDiff = a.difficulty || 'unknown';
        const bDiff = b.difficulty || 'unknown';
        return difficultyOrder[aDiff] - difficultyOrder[bDiff];
    });
};

dotenv.config();

async function loadCsv(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await res.text();
    return parse(text, { columns: true, skip_empty_lines: true });
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const url = "https://raw.githubusercontent.com/hxu296/leetcode-company-wise-problems-2022/main/data/leetcode_problems_and_companies.csv";
    const records = await loadCsv(url);
    console.log(`Loaded ${records.length} records`);

    const problemMap = new Map();

    for (const record of records) {
        const { problem_link, problem_name, company_name, num_occur } = record;
        const problemId = problem_link.split('/').filter(Boolean).pop(); // get the slug
        const title = problem_name.trim();
        const company = company_name.trim();

        if (!problemMap.has(problemId)) {
            problemMap.set(problemId, {
                problemId,
                title,
                url: problem_link,
                companies: [],
                companyOccurrences: [],
                difficulty: "medium",
                topics: [],
                acceptance: null
            });
        }

        const problem = problemMap.get(problemId);
        if (!problem.companies.includes(company)) {
            problem.companies.push(company);
        }
        const occurrences = parseOccurrences(num_occur);
        const existingEntry = problem.companyOccurrences.find(
            (entry) => entry.company === company
        );
        if (existingEntry) {
            existingEntry.occurrences = Math.max(existingEntry.occurrences, occurrences);
        } else {
            problem.companyOccurrences.push({
                company,
                occurrences
            });
        }
    }

    console.log(`Processed ${problemMap.size} unique problems`);

    let count = 0;
    for (const problem of problemMap.values()) {
        let details;
        try {
            details = await fetchProblemDetails(problem.problemId);
            problem.acceptance = details.acceptance;
        } catch (error) {
            console.error(`Failed to fetch details for ${problem.problemId}: ${error.message}`);
        }

        problem.difficulty = resolveDifficulty(details?.difficulty, problem.acceptance);
        problem.sortOrder = getSortOrder(problem.difficulty);
        count++;
        if (count % 100 === 0) {
            console.log(`Fetched details for ${count} problems`);
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const problemsArray = Array.from(problemMap.values());
    const sortedProblems = sortProblems(problemsArray);

    for (const problem of sortedProblems) {
        await Problem.findOneAndUpdate(
            { problemId: problem.problemId },
            problem,
            { upsert: true, new: true }
        );
    }

    console.log("Import completed");
    process.exit(0);
}

main().catch(console.error);

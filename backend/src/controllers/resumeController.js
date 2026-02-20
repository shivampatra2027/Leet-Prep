import crypto from "crypto";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import AIResponseCache from "../models/AIResponseCache.js";
import { consumeAICredits } from "../middlewares/aiQuotaGuard.js";
import { AI_QUOTA } from "../config/aiQuota.js";
import { getGeminiModel } from "../services/geminiClient.js";

export const uploadResume = multer({ storage: multer.memoryStorage() });

const MAX_PROMPT_CHARS = AI_QUOTA.resumeMaxChars;

const actionVerbs = [
  "built",
  "designed",
  "implemented",
  "shipped",
  "reduced",
  "improved",
  "optimized",
  "led",
  "developed",
  "increased",
];

const techKeywords = [
  "react",
  "node",
  "express",
  "javascript",
  "typescript",
  "python",
  "java",
  "aws",
  "gcp",
  "docker",
  "kubernetes",
  "mongodb",
  "postgres",
  "redis",
  "graphql",
  "rest",
];

const sectionKeywords = ["summary", "experience", "project", "education", "skills"];

function normalizeForHash(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function makeHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function cleanJson(raw = "") {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return trimmed;
}

function buildHeuristicAnalysis(text) {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const bullets = (text.match(/^\s*[-•]/gm) || []).length;
  const numbers = (text.match(/\b\d+(\.\d+)?%?/g) || []).length;
  const verbsFound = actionVerbs.filter((v) => lower.includes(v)).length;
  const sectionsFound = sectionKeywords.filter((k) => lower.includes(k)).length;
  const techFound = techKeywords.filter((k) => lower.includes(k));

  let score = 50;
  score += Math.min(20, sectionsFound * 5);
  score += Math.min(15, verbsFound * 3);
  score += Math.min(10, Math.floor(numbers / 3) * 2);
  score += Math.min(15, techFound.length);
  score = Math.min(100, score);

  const strengths = [];
  const gaps = [];

  if (sectionsFound >= 4) strengths.push("Good section coverage");
  else gaps.push("Add missing sections (Summary, Experience, Projects, Skills, Education)");

  if (numbers >= 5) strengths.push("Uses metrics to show impact");
  else gaps.push("Add more quantified impact (% improvement, latency, revenue)");

  if (verbsFound >= 5) strengths.push("Action-oriented bullets");
  else gaps.push("Start bullets with strong action verbs");

  if (techFound.length >= 6) strengths.push("Clear tech stack coverage");
  else gaps.push("List concrete tech (React, Node, AWS, etc.)");

  const overview =
    score >= 80
      ? "Strong resume foundation. Tighten metrics and tailor to each JD."
      : "Solid base. Add metrics, action verbs, and clearer tech signals to boost ATS alignment.";

  const sections = sectionKeywords.map((s) => ({
    title: s[0].toUpperCase() + s.slice(1),
    status: lower.includes(s) ? "ok" : "warn",
    tip:
      s === "experience"
        ? "Use 3-5 bullets per role with quantified impact."
        : s === "projects"
          ? "Add stack + scale (users, QPS, data size)."
          : s === "skills"
            ? "Group by Backend / Cloud / Data / Tooling; avoid long comma soup."
            : s === "summary"
              ? "Write a 2-line headline with role, years, focus, and metrics."
              : "Keep concise; include GPA if strong.",
  }));

  const quickWins = [
    "Add 3 metrics (%, ms, $, users) to your top bullets.",
    "Lead bullets with action verbs (Built, Reduced, Designed).",
    "Group skills by category and add cloud/services used.",
  ];

  return {
    score,
    overview,
    strengths,
    gaps,
    wordCount,
    bullets,
    numbers,
    verbsFound,
    techFound,
    sections,
    quickWins,
  };
}

async function buildAIFeedback(gemini, text) {
  if (!gemini) return null;

  const prompt = `
You are a senior tech recruiter. Review the resume below and respond ONLY with JSON:
{
 "overallSummary": "...",
 "keyStrengths": ["..."],
 "redFlags": ["..."],
 "missingKeywords": ["..."],
 "roleFit": { "sde1": "low|med|high", "sde2": "low|med|high", "backend": "low|med|high" },
 "priorityFixes": ["... (do within 30 minutes)"]
}
Resume:
${text.slice(0, MAX_PROMPT_CHARS)}
`;

  const result = await gemini.generateContent(prompt);
  const raw = result.response.text();

  try {
    return JSON.parse(cleanJson(raw));
  } catch {
    return { raw };
  }
}

export const analyzeResume = async (req, res) => {
  try {
    const text = await extractText(req);
    if (!text || !text.trim()) {
      return res.status(400).json({
        ok: false,
        message: "No resume text found. Upload a PDF/DOCX/TXT file or send plain text.",
      });
    }

    const normalized = normalizeForHash(text);
    const requestHash = makeHash(normalized);

    const cached = await AIResponseCache.findOne({ hash: requestHash }).lean();
    if (cached?.response) {
      return res.json({
        ok: true,
        ...cached.response,
        cacheHit: true,
        quota: req.aiQuota,
      });
    }

    const baseAnalysis = buildHeuristicAnalysis(text);

    const gemini = await getGeminiModel();
    let quota = req.aiQuota;
    let aiFeedback = null;

    if (gemini) {
      const consumeResult = await consumeAICredits({
        userId: req.user._id,
        tier: req.user.tier,
        cost: AI_QUOTA.costs.resumeAnalysis,
        heavy: true,
        requestHash,
      });

      if (!consumeResult.ok) {
        return res.status(consumeResult.status).json({
          ok: false,
          code: consumeResult.code,
          message: consumeResult.message,
          retryAfter: consumeResult.retryAfter,
          quota: consumeResult.quota,
        });
      }

      quota = consumeResult.quota;

      try {
        aiFeedback = await buildAIFeedback(gemini, text);
      } catch (e) {
        console.error("Gemini error:", e.message);
      }
    }

    const responsePayload = {
      ...baseAnalysis,
      aiFeedback,
    };

    await AIResponseCache.updateOne(
      { hash: requestHash },
      {
        $setOnInsert: {
          hash: requestHash,
          response: responsePayload,
          source: "resume_analysis",
          createdBy: req.user._id,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    return res.json({
      ok: true,
      ...responsePayload,
      cacheHit: false,
      quota,
    });
  } catch (err) {
    console.error("Resume analysis error:", err);
    res.status(500).json({ ok: false, message: "Resume analysis failed" });
  }
};

async function extractText(req) {
  if (req.body?.text && req.body.text.trim()) return req.body.text;

  const file = req.file;
  if (!file) return "";
  const mime = file.mimetype || "";
  const buffer = file.buffer;

  if (mime === "text/plain") return buffer.toString("utf8");

  if (mime === "application/pdf") {
    try {
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (e) {
      console.error("PDF parse error:", e.message);
      return "";
    }
  }

  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const { value } = await mammoth.extractRawText({ buffer });
      return value || "";
    } catch (e) {
      console.error("DOCX parse error:", e.message);
      return "";
    }
  }

  return "";
}



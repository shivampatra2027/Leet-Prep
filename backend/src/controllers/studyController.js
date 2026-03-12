import crypto from "crypto";
import mammoth from "mammoth";
import multer from "multer";
import pdfParse from "pdf-parse";
import StudyMaterial from "../models/StudyMaterial.js";
import { consumeAICredits } from "../middlewares/aiQuotaGuard.js";
import { AI_QUOTA } from "../config/aiQuota.js";
import { getGeminiModel } from "../services/geminiClient.js";
import {
  answerPrompt,
  quizPrompt,
  summaryPrompt,
} from "../services/study/prompts.js";
import { storeDocumentEmbeddings, deleteMaterialEmbeddings, deleteUserEmbeddings } from "../services/study/embeddings.js";
import { retrieveStudyContext } from "../services/study/retriever.js";

export const uploadStudyMaterial = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const ACCEPTED_UPLOAD_FIELD_NAMES = new Set([
  "file",
  "pdf",
  "document",
  "resume",
  "notes",
]);

const MAX_CONTEXT_CHARS = Math.max(
  500,
  Number(process.env.GEMINI_MAX_CONTEXT_CHARS) || 4000,
);

function buildContextFromMatches(matches, maxChars = MAX_CONTEXT_CHARS) {
  const safeMax = Math.max(1, Number(maxChars) || 0);
  let remaining = safeMax;
  const selected = [];
  const parts = [];

  for (const match of matches) {
    const doc = String(match?.document || "");
    if (!doc) continue;
    if (remaining <= 0) break;

    if (doc.length <= remaining) {
      parts.push(doc);
      selected.push(match);
      remaining -= doc.length;
    } else {
      parts.push(doc.slice(0, remaining));
      selected.push({
        ...match,
        document: doc.slice(0, remaining),
      });
      remaining = 0;
    }
  }

  return { context: parts.join("\n\n"), matches: selected };
}
function parseJsonResponse(raw, fallbackMessage) {
  const cleaned = String(raw || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      message: fallbackMessage,
      raw: cleaned,
    };
  }
}

async function extractStudyText(req) {
  if (req.body?.text && req.body.text.trim()) {
    return {
      text: req.body.text.trim(),
      filename: req.body.filename?.trim() || "notes.txt",
      mimeType: "text/plain",
      size: Buffer.byteLength(req.body.text, "utf8"),
    };
  }

  const uploadedFiles = Array.isArray(req.files)
    ? req.files
    : req.file
      ? [req.file]
      : [];

  const file =
    uploadedFiles.find((entry) =>
      ACCEPTED_UPLOAD_FIELD_NAMES.has(String(entry.fieldname || "").toLowerCase()),
    ) || uploadedFiles[0];

  if (!file) {
    throw Object.assign(new Error("Upload a PDF, DOCX, TXT file, or send plain text"), {
      statusCode: 400,
    });
  }

  if (file.mimetype === "text/plain") {
    return {
      text: file.buffer.toString("utf8"),
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return {
      text: data.text || "",
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return {
      text: value || "",
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  throw Object.assign(
    new Error("Unsupported file type. Use PDF, DOCX, TXT, or plain text."),
    { statusCode: 400 },
  );
}

async function generateGroundedContent(prompt) {
  const model = await getGeminiModel();
  if (!model) {
    throw Object.assign(
      new Error("Gemini model is unavailable. Check GOOGLE_GENAI_API_KEY."),
      { statusCode: 503 },
    );
  }

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }
    throw Object.assign(
      new Error(error?.message || "Gemini request failed"),
      { statusCode: 503 },
    );
  }
  const text = result.response.text()?.trim();
  if (!text) {
    throw Object.assign(new Error("No response text received from Gemini"), {
      statusCode: 502,
    });
  }
  return text;
}

async function consumeQuota(req, cost, heavy = false, requestHash = "") {
  const result = await consumeAICredits({
    userId: req.user._id,
    tier: req.user.tier,
    cost,
    heavy,
    requestHash,
  });

  if (!result.ok) {
    const error = new Error(result.message);
    error.statusCode = result.status;
    error.extra = {
      code: result.code,
      retryAfter: result.retryAfter,
      quota: result.quota,
    };
    throw error;
  }

  return result.quota;
}

function buildSourceList(matches) {
  return [...new Set(matches.map((item) => item.metadata?.filename).filter(Boolean))];
}

function isQuotaLikeError(error) {
  return (
    error?.extra?.code === "AI_CREDITS_EXHAUSTED" ||
    error?.extra?.code === "GEMINI_QUOTA_EXCEEDED" ||
    error?.statusCode === 402 ||
    error?.statusCode === 429
  );
}

function splitIntoSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function buildFallbackAnswer(matches, question) {
  const queryTerms = new Set(
    String(question || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 2),
  );

  const sentences = matches.flatMap((item) => splitIntoSentences(item.document));
  const ranked = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      let score = 0;
      queryTerms.forEach((term) => {
        if (lower.includes(term)) score += 1;
      });
      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked
    .filter((item) => item.score > 0)
    .slice(0, 4)
    .map((item) => item.sentence);

  const fallbackLines = (selected.length ? selected : sentences.slice(0, 4)).slice(0, 4);

  return [
    "Quota fallback response based on your indexed notes:",
    ...fallbackLines.map((line, index) => `${index + 1}. ${line}`),
    "Key takeaway: this answer is extracted from your uploaded material without a Gemini generation call.",
  ].join("\n");
}

function buildFallbackSummary(matches, topic) {
  const sentences = matches.flatMap((item) => splitIntoSentences(item.document)).slice(0, 6);
  return [
    `Summary for "${topic}" from your indexed notes:`,
    ...sentences.map((sentence) => `- ${sentence}`),
  ].join("\n");
}

function buildFallbackQuiz(matches, count) {
  const sentences = matches.flatMap((item) => splitIntoSentences(item.document)).slice(0, count);
  return {
    questions: sentences.map((sentence, index) => ({
      question: `Which statement from the uploaded notes best matches point ${index + 1}?`,
      options: [
        sentence,
        "This concept is not mentioned in the uploaded notes.",
        "The notes define the opposite of this statement.",
        "The notes only discuss an unrelated algorithm.",
      ],
      answerIndex: 0,
      explanation: "Fallback quiz mode uses direct statements from the indexed notes.",
    })),
  };
}

export async function uploadMaterial(req, res, next) {
  try {
    const extracted = await extractStudyText(req);
    if (!extracted.text.trim()) {
      return res.status(400).json({
        ok: false,
        message: "No readable text found in the uploaded material",
      });
    }

    const material = await StudyMaterial.create({
      user: req.user._id,
      filename: extracted.filename,
      mimeType: extracted.mimeType,
      size: extracted.size,
      collectionName: "pending",
      status: "indexed",
      charCount: 0,
      chunkCount: 0,
    });

    const stored = await storeDocumentEmbeddings({
      userId: req.user._id,
      materialId: material._id,
      filename: extracted.filename,
      text: extracted.text,
    });

    material.collectionName = stored.collectionName;
    material.charCount = stored.charCount;
    material.chunkCount = stored.chunkCount;
    material.lastIndexedAt = new Date();
    await material.save();

    return res.status(201).json({
      ok: true,
      message: "Study material uploaded and indexed",
      material: {
        id: material._id,
        filename: material.filename,
        mimeType: material.mimeType,
        size: material.size,
        charCount: material.charCount,
        chunkCount: material.chunkCount,
        createdAt: material.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMaterials(req, res, next) {
  try {
    const materials = await StudyMaterial.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      materials,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudyMaterial(req, res, next) {
  try {
    const materialId = String(req.params?.id || "").trim();
    if (!materialId) {
      return res.status(400).json({ ok: false, message: "material id is required" });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      user: req.user._id,
    });

    if (!material) {
      return res.status(404).json({ ok: false, message: "Study material not found" });
    }

    await deleteMaterialEmbeddings({
      userId: req.user._id,
      materialId: material._id,
    });

    await StudyMaterial.deleteOne({ _id: material._id, user: req.user._id });

    return res.json({ ok: true, message: "Study material deleted" });
  } catch (error) {
    next(error);
  }
}

export async function deleteAllStudyMaterials(req, res, next) {
  try {
    await deleteUserEmbeddings({ userId: req.user._id });
    await StudyMaterial.deleteMany({ user: req.user._id });

    return res.json({ ok: true, message: "All study materials deleted" });
  } catch (error) {
    next(error);
  }
}export async function askStudyQuestion(req, res, next) {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) {
      return res.status(400).json({ ok: false, message: "question is required" });
    }

    const matches = await retrieveStudyContext(req.user._id, question, 5);
    if (!matches.length) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    const { context, matches: contextMatches } = buildContextFromMatches(matches);
    if (!context) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    let quota = null;
    let answer = "";
    let fallback = false;

    try {
      quota = await consumeQuota(
        req,
        AI_QUOTA.costs.simpleExplanation,
        false,
        crypto.createHash("sha256").update(`ask:${question}`).digest("hex"),
      );
      answer = await generateGroundedContent(answerPrompt(context, question));
    } catch (error) {
      if (!isQuotaLikeError(error)) throw error;
      fallback = true;
      quota = error?.extra?.quota || null;
      answer = buildFallbackAnswer(contextMatches, question);
    }

    return res.json({
      ok: true,
      answer,
      sources: buildSourceList(contextMatches),
      quota,
      fallback,
    });
  } catch (error) {
    next(error);
  }
}
export async function summarizeStudyTopic(req, res, next) {
  try {
    const topic = String(req.body?.topic || "").trim();
    if (!topic) {
      return res.status(400).json({ ok: false, message: "topic is required" });
    }

    const matches = await retrieveStudyContext(req.user._id, topic, 6);
    if (!matches.length) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    const { context, matches: contextMatches } = buildContextFromMatches(matches);
    if (!context) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    let quota = null;
    let summary = "";
    let fallback = false;

    try {
      quota = await consumeQuota(
        req,
        AI_QUOTA.costs.improvementSuggestions,
        true,
        crypto.createHash("sha256").update(`summary:${topic}`).digest("hex"),
      );
      summary = await generateGroundedContent(summaryPrompt(context, topic));
    } catch (error) {
      if (!isQuotaLikeError(error)) throw error;
      fallback = true;
      quota = error?.extra?.quota || null;
      summary = buildFallbackSummary(contextMatches, topic);
    }

    return res.json({
      ok: true,
      summary,
      sources: buildSourceList(contextMatches),
      quota,
      fallback,
    });
  } catch (error) {
    next(error);
  }
}
export async function generateStudyQuiz(req, res, next) {
  try {
    const topic = String(req.body?.topic || "").trim();
    const count = Math.min(Math.max(Number(req.body?.count) || 5, 1), 10);

    if (!topic) {
      return res.status(400).json({ ok: false, message: "topic is required" });
    }

    const matches = await retrieveStudyContext(req.user._id, topic, 6);
    if (!matches.length) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    const { context, matches: contextMatches } = buildContextFromMatches(matches);
    if (!context) {
      return res.status(404).json({
        ok: false,
        message: "No indexed study material found for this account",
      });
    }

    let quota = null;
    let quiz = null;
    let fallback = false;

    try {
      quota = await consumeQuota(
        req,
        AI_QUOTA.costs.improvementSuggestions,
        true,
        crypto.createHash("sha256").update(`quiz:${topic}:${count}`).digest("hex"),
      );
      const raw = await generateGroundedContent(quizPrompt(context, topic, count));
      quiz = parseJsonResponse(raw, "Gemini returned non-JSON quiz output");
    } catch (error) {
      if (!isQuotaLikeError(error)) throw error;
      fallback = true;
      quota = error?.extra?.quota || null;
      quiz = buildFallbackQuiz(contextMatches, count);
    }

    return res.json({
      ok: true,
      quiz,
      sources: buildSourceList(contextMatches),
      quota,
      fallback,
    });
  } catch (error) {
    next(error);
  }
}
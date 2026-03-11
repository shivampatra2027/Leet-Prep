import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Sheet from "../models/Sheet.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_SLUG = "love-babbar";

async function loadSheetJson() {
  const explicitPath = process.env.SHEET_JSON_PATH;
  const defaultPath = path.resolve(
    __dirname,
    "../data/love_babbar_sheet.json",
  );
  const jsonPath = explicitPath ? path.resolve(explicitPath) : defaultPath;

  const raw = await fs.readFile(jsonPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!parsed || !parsed.title || !Array.isArray(parsed.topics)) {
    throw new Error(`Invalid sheet JSON at ${jsonPath}`);
  }

  return parsed;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  const sheetData = await loadSheetJson();

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  await Sheet.findOneAndUpdate(
    { slug: SHEET_SLUG },
    {
      slug: SHEET_SLUG,
      title: sheetData.title,
      source: sheetData.source,
      scraped_at: new Date(sheetData.scraped_at),
      total_topics: sheetData.total_topics,
      total_problems: sheetData.total_problems,
      topics: sheetData.topics,
    },
    { upsert: true, new: true, runValidators: true },
  );

  console.log(
    `Sheet upserted: slug=${SHEET_SLUG}, topics=${sheetData.total_topics}, problems=${sheetData.total_problems}`,
  );

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Sheet import failed:", error.message);
    process.exit(1);
  });

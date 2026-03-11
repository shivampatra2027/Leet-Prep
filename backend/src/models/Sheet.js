import mongoose from "mongoose";

const { Schema } = mongoose;

const SheetProblemSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    article_link: { type: String, trim: true },
    practice_link: { type: String, trim: true },
    leetcode_link: { type: String, trim: true },
  },
  { _id: false },
);

const SheetTopicSchema = new Schema(
  {
    topic: { type: String, required: true, trim: true },
    count: { type: Number, required: true },
    problems: { type: [SheetProblemSchema], default: [] },
  },
  { _id: false },
);

const SheetSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    scraped_at: { type: Date, required: true },
    total_topics: { type: Number, required: true },
    total_problems: { type: Number, required: true },
    topics: { type: [SheetTopicSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.Sheet || mongoose.model("Sheet", SheetSchema);

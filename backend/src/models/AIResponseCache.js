import mongoose from "mongoose";

const { Schema } = mongoose;

const AIResponseCacheSchema = new Schema(
  {
    hash: { type: String, required: true, unique: true, index: true },
    response: { type: Schema.Types.Mixed, required: true },
    source: { type: String, default: "resume_analysis" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now, expires: 7 * 24 * 60 * 60 },
  },
  { versionKey: false },
);

const AIResponseCache =
  mongoose.models.AIResponseCache ||
  mongoose.model("AIResponseCache", AIResponseCacheSchema);

export default AIResponseCache;

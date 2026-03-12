import mongoose from "mongoose";

const { Schema } = mongoose;

const StudyMaterialSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    charCount: {
      type: Number,
      default: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    collectionName: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["indexed", "failed"],
      default: "indexed",
    },
    lastIndexedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

StudyMaterialSchema.index({ user: 1, createdAt: -1 });

const StudyMaterial =
  mongoose.models.StudyMaterial ||
  mongoose.model("StudyMaterial", StudyMaterialSchema);

export default StudyMaterial;

import mongoose from "mongoose";
const { Schema } = mongoose;

const DailyActivitySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        date: {
            type: String, 
            required: true,
            index: true
        },

        platform: {
            type: String,
            enum: ["leetcode", "codeforces", "codechef"],
            required: true,
            index: true
        },

        count: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Prevent duplicates
DailyActivitySchema.index(
    { user: 1, date: 1, platform: 1 },
    { unique: true }
);

export default mongoose.models.DailyActivity ||
    mongoose.model("DailyActivity", DailyActivitySchema);

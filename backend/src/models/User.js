import mongoose from 'mongoose';
const { Schema } = mongoose;

const AttemptSchema = new Schema({
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: false },
    problemId: { type: String, required: false },
    status: { type: String, enum: ['unsolved', 'attempted', 'solved'], default: 'unsolved' },
    language: String,
    notes: String,
    lastAttemptAt: Date,
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
}, { _id: false });

const UserSchema = new Schema({
    email: { type: String, unique: true, sparse: true, index: true },
    name: String,
    passwordHash: String,
    isAdmin: { type: Boolean, default: false },
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    attempts: [AttemptSchema],
    leetcodeUsername: { type: String, sparse: true },
    solvedProblems: [{ type: String }], // Array of LeetCode problem slugs or IDs
    lastLeetcodeSync: { type: Date },
    expireAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

// TTL index
UserSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

UserSchema.methods.upsertAttempt = function (attemptObj) {
    const { problemId, status, language, notes } = attemptObj;

    const idx = this.attempts.findIndex(a =>
        (a.problemId && a.problemId === problemId) ||
        (a.problem && a.problem.toString() === (attemptObj.problem ? attemptObj.problem.toString() : null))
    );

    // Example: enforce free tier limit per company
    const attemptsForCompany = this.attempts.filter(a => a.companyId.toString() === attemptObj.companyId.toString());
    if (this.tier === 'free' && attemptsForCompany.length >= 10) {
        throw new Error("Premium required to attempt for this company");
    }

    if (idx === -1) {
        this.attempts.push({
            problemId,
            companyId: attemptObj.companyId,
            status,
            language,
            notes,
            lastAttemptAt: new Date()
        });
    } else {
        this.attempts[idx].status = status || this.attempts[idx].status;
        this.attempts[idx].language = language || this.attempts[idx].language;
        this.attempts[idx].notes = notes || this.attempts[idx].notes;
        this.attempts[idx].lastAttemptAt = new Date();
    }
    return this.save();
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;

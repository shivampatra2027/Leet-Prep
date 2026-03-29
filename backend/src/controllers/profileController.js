import User from "../models/User.js";
import Problem from "../models/Problem.js";

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Check if premium has expired and update tier if needed
      if (user.tier === "premium" && user.premiumExpiresAt) {
        if (new Date() > new Date(user.premiumExpiresAt)) {
          user.tier = "free";
          user.subscriptionStatus = "expired";
          user.subscriptionEndDate = null;
          user.premiumExpiresAt = null;
          await user.save();
          console.log(`User ${user._id} premium expired - downgraded to free`);
        }
      }

      res.json({
        _id: user._id,
        username: user.name,
        email: user.email,
        createdAt: user.createdAt,
        avatarUrl:
          user.avatar || user.avatarUrl || "https://github.com/shadcn.png",
        tier: user.tier || "free", // 'free' or 'premium'
        isPremium: user.tier === "premium", // For backward compatibility
        premiumExpiresAt: user.premiumExpiresAt, // Send expiry date to frontend
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isAdmin: user.isAdmin,
        solvedProblemsCount: user.solvedProblems?.length || 0,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get user's solved problems
// @route   GET /api/profile/solved-problems
// @access  Private
export const getSolvedProblems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("solvedProblems");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      ok: true,
      solvedProblems: user.solvedProblems || [],
    });
  } catch (error) {
    console.error("Error fetching solved problems:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Mark a problem as solved (manual checkbox)
// @route   POST /api/profile/solved-problems
// @access  Private
export const addSolvedProblem = async (req, res) => {
  try {
    const { problemId } = req.body;
    if (!problemId) {
      return res.status(400).json({ error: "problemId is required" });
    }

    // Validate problem exists to keep data clean
    const exists = await Problem.exists({ problemId });
    if (!exists) {
      return res.status(404).json({ error: "Problem not found", problemId });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { solvedProblems: problemId } },
      { new: true, select: "solvedProblems" },
    );

    return res.json({
      ok: true,
      solvedProblems: user.solvedProblems,
      solvedCount: user.solvedProblems.length,
    });
  } catch (error) {
    console.error("Error adding solved problem:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Unmark a solved problem
// @route   DELETE /api/profile/solved-problems/:problemId
// @access  Private
export const removeSolvedProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    if (!problemId) {
      return res.status(400).json({ error: "problemId is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { solvedProblems: problemId } },
      { new: true, select: "solvedProblems" },
    );

    return res.json({
      ok: true,
      solvedProblems: user.solvedProblems,
      solvedCount: user.solvedProblems.length,
    });
  } catch (error) {
    console.error("Error removing solved problem:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Summary numbers for dashboard
// @route   GET /api/profile/solved-summary
// @access  Private
export const getSolvedSummary = async (req, res) => {
  try {
    const [user, totalProblems] = await Promise.all([
      User.findById(req.user._id).select("solvedProblems"),
      Problem.countDocuments(),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const solvedCount = user.solvedProblems?.length || 0;
    res.json({
      ok: true,
      solvedCount,
      totalProblems,
      progress: totalProblems ? solvedCount / totalProblems : 0,
    });
  } catch (error) {
    console.error("Error fetching solved summary:", error);
    res.status(500).json({ error: "Server error" });
  }
};

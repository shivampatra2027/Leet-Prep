import User from '../models/User.js';
import { fetchLeetCodeUserData, fetchAllSolvedProblems } from '../utils/leetcodeService.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "https://github.com/shadcn.png", // Default or from DB
        tier: user.tier || 'free', // 'free' or 'premium'
        isPremium: user.tier === 'premium', // For backward compatibility
        isAdmin: user.isAdmin,
        leetcodeUsername: user.leetcodeUsername,
        lastLeetcodeSync: user.lastLeetcodeSync,
        solvedProblemsCount: user.solvedProblems?.length || 0,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update LeetCode username
// @route   PUT /api/profile/leetcode-username
// @access  Private
export const updateLeetcodeUsername = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    
    if (!leetcodeUsername || leetcodeUsername.trim() === '') {
      return res.status(400).json({ error: 'LeetCode username is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the username exists on LeetCode
    try {
      await fetchLeetCodeUserData(leetcodeUsername);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid LeetCode username or user not found on LeetCode' });
    }

    user.leetcodeUsername = leetcodeUsername;
    await user.save();

    res.json({
      ok: true,
      message: 'LeetCode username updated successfully',
      leetcodeUsername: user.leetcodeUsername
    });
  } catch (error) {
    console.error('Error updating LeetCode username:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Sync LeetCode solved problems
// @route   POST /api/profile/sync-leetcode
// @access  Private
export const syncLeetcodeProblems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.leetcodeUsername) {
      return res.status(400).json({ error: 'Please set your LeetCode username first' });
    }

    // Fetch solved problems from LeetCode
    const solvedProblems = await fetchAllSolvedProblems(user.leetcodeUsername);
    
    // Update user's solved problems
    user.solvedProblems = solvedProblems;
    user.lastLeetcodeSync = new Date();
    await user.save();

    res.json({
      ok: true,
      message: 'LeetCode data synced successfully',
      solvedCount: solvedProblems.length,
      lastSync: user.lastLeetcodeSync
    });
  } catch (error) {
    console.error('Error syncing LeetCode data:', error);
    res.status(500).json({ 
      error: 'Failed to sync LeetCode data',
      message: error.message 
    });
  }
};

// @desc    Get user's solved problems
// @route   GET /api/profile/solved-problems
// @access  Private
export const getSolvedProblems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('solvedProblems lastLeetcodeSync');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ok: true,
      solvedProblems: user.solvedProblems || [],
      lastSync: user.lastLeetcodeSync
    });
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


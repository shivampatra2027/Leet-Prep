import User from '../models/User.js';
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
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

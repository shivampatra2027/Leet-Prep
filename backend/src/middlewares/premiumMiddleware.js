import User from '../models/User.js';

/**
 * Middleware to check if user has premium tier
 */
export const checkPremium = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.tier !== 'premium') {
            return res.status(403).json({ 
                success: false, 
                message: 'Premium subscription required',
                tier: user.tier 
            });
        }

        // User is premium, proceed
        next();
    } catch (error) {
        console.error('Error in checkPremium middleware:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while checking premium status' 
        });
    }
};

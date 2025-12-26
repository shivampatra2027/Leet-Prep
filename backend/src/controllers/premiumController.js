import User from '../models/User.js';

/**
 * Check user tier and redirect to appropriate dashboard
 * @route GET /api/premium/check-dashboard
 */
export const checkDashboardAccess = async (req, res) => {
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

        // Check user tier and return appropriate redirect path
        const redirectPath = user.tier === 'premium' ? '/dashboard' : '/freedashboard';
        
        return res.status(200).json({
            success: true,
            tier: user.tier,
            redirectPath: redirectPath
        });
    } catch (error) {
        console.error('Error checking dashboard access:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while checking dashboard access' 
        });
    }
};

/**
 * Middleware to redirect based on user tier
 * Use this in routes that need tier-based redirection
 */
export const redirectByTier = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.CLIENT_URL}/login`);
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login`);
        }

        // Redirect based on tier
        const redirectPath = user.tier === 'premium' ? '/dashboard' : '/freedashboard';
        return res.redirect(`${process.env.CLIENT_URL}${redirectPath}`);
    } catch (error) {
        console.error('Error in redirectByTier middleware:', error);
        return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
};

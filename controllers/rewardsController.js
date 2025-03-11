const rewardsService = require('../services/rewardsService');

// Combine all controller methods into a single object
const rewardsController = {
    async getPoints(req, res) {
        try {
            const userId = req.user.id;
            const pointsData = await rewardsService.getPoints(userId);
            res.status(200).json(pointsData);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching points', error });
        }
    },

    async awardPoints(req, res) {
        try {
            const userId = req.user.id;
            const { points } = req.body;
            const updatedPoints = await rewardsService.awardPoints(userId, points);
            res.status(200).json(updatedPoints);
        } catch (error) {
            res.status(500).json({ message: 'Error awarding points', error });
        }
    },

    async getPointsHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await rewardsService.getPointsHistory(userId);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching points history', error });
        }
    },

    async redeemPoints(req, res) {
        try {
            const { userId, pointsToRedeem, discountAmount } = req.body;

            if (!userId || !pointsToRedeem || !discountAmount) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters'
                });
            }

            const result = await rewardsService.redeemPoints(
                parseInt(userId),
                parseInt(pointsToRedeem),
                parseFloat(discountAmount)
            );

            res.json({
                success: true,
                newPoints: result.newPoints,
                pointsRedeemed: pointsToRedeem,
                discountAmount: discountAmount
            });
        } catch (error) {
            console.error('Points redemption error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = rewardsController;
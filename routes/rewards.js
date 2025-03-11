const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes - require authentication
router.use(authenticateToken);

// Routes using the controller methods
router.get('/points', rewardsController.getPoints);
router.get('/history', rewardsController.getPointsHistory);
router.post('/award', rewardsController.awardPoints);
router.post('/redeem', rewardsController.redeemPoints);

// Add conversion rate constants
router.locals = {
    POINTS_PER_REDEMPTION: 50,  // Points needed for one redemption
    DOLLARS_PER_REDEMPTION: 2   // Dollars given per redemption
};

module.exports = router;

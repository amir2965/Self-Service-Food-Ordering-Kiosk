const { pool } = require('../config/database');

const rewardsService = {
    async getPoints(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT current_points, membership_level FROM members WHERE id = ?',
                [userId]
            );
            return rows[0] || { current_points: 0, membership_level: 'Bronze' };
        } catch (error) {
            console.error('Error getting points:', error);
            throw new Error('Failed to get points');
        }
    },

    async awardPoints(userId, orderAmount) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Calculate points (1 point per dollar spent)
            const pointsToAward = Math.floor(orderAmount);

            // Get current points
            const [currentPoints] = await connection.execute(
                'SELECT current_points FROM members WHERE id = ?',
                [userId]
            );

            if (!currentPoints[0]) {
                throw new Error('User not found');
            }

            const newPoints = currentPoints[0].current_points + pointsToAward;

            // Update member points
            await connection.execute(
                `UPDATE members 
                 SET current_points = ?,
                     total_points_earned = total_points_earned + ?
                 WHERE id = ?`,
                [newPoints, pointsToAward, userId]
            );

            // Record transaction
            await connection.execute(
                `INSERT INTO point_transactions 
                 (member_id, points_amount, transaction_type, balance_before, balance_after, description)
                 VALUES (?, ?, 'earn', ?, ?, ?)`,
                [
                    userId,
                    pointsToAward,
                    currentPoints[0].current_points,
                    newPoints,
                    `Points earned from purchase of $${orderAmount.toFixed(2)}`
                ]
            );

            await connection.commit();
            return { success: true, pointsEarned: pointsToAward, newBalance: newPoints };
        } catch (error) {
            await connection.rollback();
            console.error('Error awarding points:', error);
            throw new Error('Failed to award points');
        } finally {
            connection.release();
        }
    },

    async redeemPoints(userId, pointsToRedeem, discountAmount) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verify user has enough points
            const [users] = await connection.execute(
                'SELECT points FROM users WHERE id = ?',
                [userId]
            );

            if (!users.length) {
                throw new Error('User not found');
            }

            const currentPoints = users[0].points;
            if (currentPoints < pointsToRedeem) {
                throw new Error('Insufficient points');
            }

            // Update user points
            const newPoints = currentPoints - pointsToRedeem;
            await connection.execute(
                'UPDATE users SET points = ? WHERE id = ?',
                [newPoints, userId]
            );

            // Record the transaction
            await connection.execute(
                'INSERT INTO points_transactions (user_id, points_change, transaction_type, description) VALUES (?, ?, ?, ?)',
                [userId, -pointsToRedeem, 'redeem', `Redeemed ${pointsToRedeem} points for $${discountAmount} discount`]
            );

            await connection.commit();
            return { success: true, newPoints };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async getPointsHistory(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    pt.points_amount,
                    pt.transaction_type,
                    pt.balance_before,
                    pt.balance_after,
                    pt.description,
                    pt.created_at
                 FROM point_transactions pt
                 WHERE pt.member_id = ?
                 ORDER BY pt.created_at DESC
                 LIMIT 10`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting points history:', error);
            throw new Error('Failed to get points history');
        }
    }
};

module.exports = rewardsService;

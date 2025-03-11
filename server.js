require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// Update this line to import both testConnection and pool
const { testConnection, pool } = require('./config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3000;
const logFilePath = path.join(__dirname, 'orders.json');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Add routes
const authRoutes = require('./routes/auth');
const rewardsRoutes = require('./routes/rewards');

app.use('/api/auth', authRoutes);
app.use('/api/rewards', rewardsRoutes);

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Check if user exists
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Get user
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, users[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: users[0].id, email: users[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: users[0].id,
                firstName: users[0].first_name,
                lastName: users[0].last_name,
                email: users[0].email,
                points: users[0].points
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Updated redeem points route with proper transaction handling
app.post('/api/rewards/redeem-points', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { userId, pointsToRedeem } = req.body;

        // Input validation
        if (!userId || !pointsToRedeem || pointsToRedeem < 0) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        console.log(`Processing points redemption - User ID: ${userId}, Points: ${pointsToRedeem}`);
        
        // Get connection from pool
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // Get current points with row lock
        const [users] = await connection.query(
            'SELECT points FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const currentPoints = users[0].points;
        console.log(`Current points balance: ${currentPoints}`);

        if (currentPoints < pointsToRedeem) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Insufficient points',
                currentPoints: currentPoints,
                requested: pointsToRedeem
            });
        }

        // Calculate new points balance
        const newPoints = currentPoints - pointsToRedeem;

        // Update points with optimistic locking
        const [updateResult] = await connection.query(
            'UPDATE users SET points = ? WHERE id = ? AND points = ?',
            [newPoints, userId, currentPoints]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'Points balance changed, please try again' });
        }

        // Add points transaction record
        await connection.query(
            'INSERT INTO points_transactions (user_id, points_redeemed, points_balance) VALUES (?, ?, ?)',
            [userId, pointsToRedeem, newPoints]
        );

        // Commit transaction
        await connection.commit();
        
        console.log(`Points redeemed successfully. New balance: ${newPoints}`);
        res.json({ 
            success: true, 
            newPoints,
            pointsRedeemed: pointsToRedeem
        });

    } catch (error) {
        console.error('Error in points redemption:', error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ 
            error: 'Failed to redeem points',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Update the points calculation route
app.post('/api/rewards/calculate-points', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { userId, orderAmount } = req.body;
        
        // Calculate points - 1 point per dollar spent, rounded down
        const pointsEarned = Math.floor(orderAmount);
        
        // Get connection from pool
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // Get current points balance
        const [users] = await connection.query(
            'SELECT points FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const currentPoints = users[0].points;
        const newPoints = currentPoints + pointsEarned;

        // Update user's points
        const [updateResult] = await connection.query(
            'UPDATE users SET points = ? WHERE id = ? AND points = ?',
            [newPoints, userId, currentPoints]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'Points balance changed, please try again' });
        }

        // Add points transaction record
        await connection.query(
            'INSERT INTO points_transactions (user_id, points_change, transaction_type, description) VALUES (?, ?, ?, ?)',
            [userId, pointsEarned, 'earn', `Points earned from order total: $${orderAmount}`]
        );

        // Commit transaction
        await connection.commit();

        console.log(`Points awarded successfully. New balance: ${newPoints}`);
        res.json({ 
            success: true, 
            pointsEarned,
            newPoints
        });

    } catch (error) {
        console.error('Error in points calculation:', error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ 
            error: 'Failed to calculate points',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Root GET route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for logging orders
app.post('/logOrder', (req, res) => {
    const logEntry = JSON.parse(req.body.orderDetails);

    // Read existing orders
    let orders = [];
    if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        orders = JSON.parse(data);
    }

    // Add new order
    orders.push(logEntry);

    // Write updated orders back to the file
    fs.writeFileSync(logFilePath, JSON.stringify(orders, null, 2), 'utf8');

    res.status(200).send('Order logged successfully');
});

// GET route for retrieving orders
app.get('/getOrders', (req, res) => {
    try {
        if (!fs.existsSync(logFilePath)) {
            return res.json([]);
        }

        const data = fs.readFileSync(logFilePath, 'utf8');
        const orders = JSON.parse(data);

        console.log(`Sending ${orders.length} orders`);
        res.json(orders.reverse());
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ error: 'Error reading orders', details: error.message });
    }
});

// Add new endpoint for updating order status
app.post('/updateOrderStatus', (req, res) => {
    try {
        const { orderNumber, status } = req.body;
        let orders = [];
        
        if (fs.existsSync(logFilePath)) {
            const data = fs.readFileSync(logFilePath, 'utf8');
            orders = JSON.parse(data);
            
            // Find and update order status
            const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);
            if (orderIndex !== -1) {
                orders[orderIndex].status = status;
                orders[orderIndex].lastUpdated = new Date().toLocaleString();
            }
            
            fs.writeFileSync(logFilePath, JSON.stringify(orders, null, 2), 'utf8');
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Orders file not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Add new endpoint for clearing all orders
app.post('/clearOrders', express.json(), (req, res) => {
    try {
        const { pin } = req.body;
        console.log('Received clear orders request with PIN:', pin);
        
        if (pin !== '2965') {
            console.log('Invalid PIN provided');
            return res.status(401).json({ 
                success: false, 
                error: 'Unauthorized' 
            });
        }

        // Ensure orders.json exists
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '[]', 'utf8');
        }

        // Clear all orders
        fs.writeFileSync(logFilePath, '[]', 'utf8');
        console.log('Orders cleared successfully');

        // Send success response
        return res.status(200).json({ 
            success: true, 
            message: 'All orders cleared successfully' 
        });

    } catch (error) {
        console.error('Error clearing orders:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to clear orders',
            details: error.message
        });
    }
});

// Update the resetOrderNumber endpoint to handle the reset properly
app.post('/resetOrderNumber', express.json(), (req, res) => {
    try {
        const { pin } = req.body;
        
        if (pin !== '2965') {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid PIN' 
            });
        }

        // Clear all orders and reset the number
        if (fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '[]', 'utf8');
        }

        // Send success response with the new starting number
        return res.status(200).json({ 
            success: true, 
            message: 'Order numbers reset successfully',
            newOrderNumber: 101
        });

    } catch (error) {
        console.error('Error resetting order numbers:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to reset order numbers'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Test database connection before starting server
async function startServer() {
    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('Could not connect to database. Server will not start.');
            process.exit(1);
        }

        // Start server only if database connection is successful
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
}

// Replace app.listen with startServer()
startServer();

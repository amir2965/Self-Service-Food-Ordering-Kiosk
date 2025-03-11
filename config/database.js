const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'mykiosk',
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true, // Add this line to enable multiple statements
    debug: process.env.NODE_ENV === 'development'
});

// Initialize database
async function initializeDatabase() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'setup-database.sql');
        const sqlFile = await fs.readFile(sqlPath, 'utf8');

        // Split the SQL file into individual statements
        const statements = sqlFile
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // Execute each statement separately
        for (const statement of statements) {
            try {
                await pool.query(statement);
            } catch (err) {
                console.error('Error executing statement:', err);
                console.error('Statement:', statement);
                throw err;
            }
        }

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
}

// Test database connection and create tables if needed
async function testConnection() {
    try {
        // Test the connection
        await pool.query('SELECT 1');
        console.log('Database connection successful');
        
        // Initialize database schema
        await initializeDatabase();
        
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

module.exports = { pool, testConnection };

// Import the mysql2/promise library to use async/await with MySQL
const mysql = require('mysql2/promise');
// Import dotenv to read variables from your .env file
require('dotenv').config();

// Create a connection pool. 
// A pool is better than a single connection because it can handle multiple users at once.
const pool = mysql.createPool({
  host: process.env.DB_HOST,           // Database server address (e.g., localhost)
  user: process.env.DB_USER,           // Database username
  password: process.env.DB_PASSWORD,   // Database password
  database: process.env.DB_NAME,       // The name of your database
  waitForConnections: true,            // If all connections are busy, wait for one to be free
  connectionLimit: 10,                 // Maximum 10 connections at the same time
  queueLimit: 0,                       // No limit on how many requests can wait in line
});

// This function checks if the database is connected when the server starts
async function testConnection() {
  try {
    // Try to get one connection from the pool
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    // Release the connection back to the pool so others can use it
    connection.release();
  } catch (error) {
    // If there is an error (wrong password, wrong host, etc.), show it in the console
    console.error('❌ Database connection failed:', error.message);
  }
}

// Run the test immediately
testConnection();

// Export the pool so server.js can use it to run queries
module.exports = pool;

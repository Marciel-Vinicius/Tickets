// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL não definido no .env ou no Render env vars.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};
// Cria
// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 600000,    // 10 minutos
    connectionTimeoutMillis: 2000,
    Promise: global.Promise       // evita erro de undefined Promise
});

module.exports = pool;

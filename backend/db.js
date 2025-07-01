// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,                   // conexões simultâneas
    idleTimeoutMillis: 600000, // 10 minutos antes de fechar idle
    connectionTimeoutMillis: 2000,
    Promise: global.Promise    // evita erro de undefined Promise
});

module.exports = pool;

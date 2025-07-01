// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

// 1) Atribui global.Promise ao prototype da classe
Pool.prototype.Promise = global.Promise;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 600000,    // 10 minutos
    connectionTimeoutMillis: 2000 // 2s
});

// 2) Garante também na instância
pool.Promise = global.Promise;

module.exports = pool;

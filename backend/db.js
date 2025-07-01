// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,                   // até 10 conexões simultâneas
    idleTimeoutMillis: 600000, // 600000 ms = 10 minutos
    connectionTimeoutMillis: 2000, // 2s de timeout na criação de conexões
    Promise: global.Promise    // garante que pool.Promise exista
});

module.exports = pool;

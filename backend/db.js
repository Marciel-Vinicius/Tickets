// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,                   // até 10 conexões simultâneas
    idleTimeoutMillis: 600000, // 600 000 ms = 10 minutos
    connectionTimeoutMillis: 2000, // 2 s de timeout na criação de novas conexões
    Promise: global.Promise    // garante que pool.Promise está definido
});

module.exports = pool;

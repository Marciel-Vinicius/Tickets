// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

// 1) Força a classe Pool a usar global.Promise
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

// (Opcional) Verifica se ficou ok
// console.log('Pool.Promise é:', pool.Promise === global.Promise);

module.exports = pool;

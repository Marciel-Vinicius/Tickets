// src/db.js
require('dotenv').config();

// primeiro, carregue o módulo inteiro para patchar o prototype
const pg = require('pg');

// força todas as instâncias de Pool a usarem a Promise nativa
pg.Pool.prototype.Promise = global.Promise;

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 600000,    // 10 minutos
    connectionTimeoutMillis: 2000 // 2s
});

module.exports = pool;

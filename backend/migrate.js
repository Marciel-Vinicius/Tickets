// backend/migrate.js
require('dotenv').config();
const { Pool } = require('pg');

async function migrate() {
  // Conexão usando DATABASE_URL do .env
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1) Tabelas originais
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        sector TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lojas (
        value TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS contatos (
        value TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS ocorrencias (
        value TEXT PRIMARY KEY
      );
    `);

    // 2) Adiciona coluna active em lojas e contatos
    await pool.query(`
      ALTER TABLE lojas ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
      ALTER TABLE contatos ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
    `);

    console.log('✔️  Migração concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    await pool.end();
  }
}

migrate();

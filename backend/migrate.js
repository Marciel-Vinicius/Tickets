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
    // 1) Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        sector   TEXT NOT NULL
      );
    `);

    // 2) Atendimentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS atendimentos (
        id           UUID PRIMARY KEY,
        atendente    TEXT NOT NULL,
        setor        TEXT NOT NULL,
        dia          DATE NOT NULL,
        hora_inicio  TIME NOT NULL,
        hora_fim     TIME NOT NULL,
        loja         TEXT NOT NULL,
        contato      TEXT NOT NULL,
        ocorrencia   TEXT NOT NULL
      );
    `);

    // 3) Lojas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        value TEXT PRIMARY KEY
      );
    `);

    // 4) Contatos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contatos (
        value TEXT PRIMARY KEY
      );
    `);

    // 5) Ocorrências
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ocorrencias (
        value TEXT PRIMARY KEY
      );
    `);

    // 6) Inativação de contatos
    await pool.query(`
      ALTER TABLE contatos
      ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
    `);

    console.log('✔️  Migração concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    await pool.end();
  }
}

migrate();
// Cria
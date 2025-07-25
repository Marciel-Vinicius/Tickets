// frontend/src/config.js

// URL para desenvolvimento local
const DEFAULT_LOCAL = 'http://localhost:3001';

// URL de produção apontando para sua VM via HTTPS
const PROD_BACKEND = 'https://ticketssaf.njf.ind.br';

// Se você definiu REACT_APP_API_URL no Render, ela prevalece.
// Caso contrário, se estivermos rodando em produção (.onrender.com), usa PROD_BACKEND.
// Ao fim, cai para DEFAULT_LOCAL em ambiente de desenvolvimento local.
const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname.endsWith('.onrender.com') ? PROD_BACKEND : DEFAULT_LOCAL);

export default API_URL;

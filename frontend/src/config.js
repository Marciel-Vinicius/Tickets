// frontend/src/config.js
const DEFAULT_LOCAL = 'http://localhost:3001';
const PROD_BACKEND = 'https://tickets-backend-bx9t.onrender.com';

// Se você definiu REACT_APP_API_URL no Render, ele prevalece.
// Caso contrário, se estivermos rodando em produção (.onrender.com), usa PROD.
// Ao fim, cai para o localhost para desenvolvimento local.
const API_URL =
    process.env.REACT_APP_API_URL ||
    (window.location.hostname.endsWith('.onrender.com') ? PROD_BACKEND : DEFAULT_LOCAL);

export default API_URL;

// Criar
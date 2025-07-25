// frontend/src/config.js

// URL para desenvolvimento local
const DEFAULT_LOCAL = 'http://localhost:3001';

// URL de produção apontando para sua VM via HTTPS
const PROD_BACKEND = 'https://ticketssaf.njf.ind.br';

// Detecta se estamos em produção:
// — se NODE_ENV for 'production'  
// — ou se o hostname não for 'localhost'
const isProduction =
  process.env.NODE_ENV === 'production' ||
  window.location.hostname !== 'localhost';

// Escolhe a URL da API:
// 1) Variável REACT_APP_API_URL (caso queira sobrescrever)  
// 2) Em produção, usa PROD_BACKEND  
// 3) Em dev local, DEFAULT_LOCAL
const API_URL =
  process.env.REACT_APP_API_URL ||
  (isProduction ? PROD_BACKEND : DEFAULT_LOCAL);

export default API_URL;

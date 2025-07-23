// frontend/src/config.js

// Se você definiu REACT_APP_API_URL (no Render), ela será usada.
// Caso contrário, usamos caminho relativo (""), de modo que:
//   • Em dev local: fetch("/api/...") → proxy para localhost:10000 via static.yaml
//   • Em prod no Render: fetch("/api/...") → proxy para VM via static.yaml
const API_URL = process.env.REACT_APP_API_URL ?? '';

export default API_URL;
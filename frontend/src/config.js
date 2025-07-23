// src/config.js
// Em produção, escondemos qualquer API_URL e usamos sempre caminhos relativos.
const API_URL =
  process.env.NODE_ENV === 'production'
    ? ''
    : process.env.REACT_APP_API_URL || '';

export default API_URL;

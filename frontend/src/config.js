// frontend/src/config.js

// Em produção (NODE_ENV==='production'), força string vazia.
// Em desenvolvimento, você pode usar REACT_APP_API_URL se precisar.
const API_URL =
  process.env.NODE_ENV === 'production'
    ? ''
    : process.env.REACT_APP_API_URL || '';

export default API_URL;

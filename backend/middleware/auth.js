// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

// decodifica o token e bota o payload em req.user
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = payload;
    next();
  });
}

// gera um middleware que só permite os setores listados (DEV sempre passa)
function authorizeSector(...allowedSectors) {
  return (req, res, next) => {
    const setor = req.user?.sector;
    if (setor === 'DEV' || allowedSectors.includes(setor)) {
      return next();
    }
    return res.status(403).json({ message: 'Acesso negado: setor não autorizado' });
  };
}

module.exports = { authenticate, authorizeSector };

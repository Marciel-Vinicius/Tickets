// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

/**
 * Verifica e decodifica o JWT, colocando o payload em req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/**
 * Factory que retorna um middleware para autorizar setores.
 * DEV sempre tem acesso ("master").
 */
function authorizeSector(...sectors) {
  return (req, res, next) => {
    if (!req.user) return res.sendStatus(403);
    if (req.user.sector === 'DEV') {
      return next();
    }
    if (sectors.includes(req.user.sector)) {
      return next();
    }
    return res.sendStatus(403);
  };
}

module.exports = { authenticateToken, authorizeSector };

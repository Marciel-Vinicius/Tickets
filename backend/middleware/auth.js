// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
}

/**
 * Retorna um middleware que só deixa passar usuários cujo setor
 * esteja incluído em allowedSectors (array de strings).
 */
function authorizeSector(allowedSectors) {
  return (req, res, next) => {
    if (!req.user || !allowedSectors.includes(req.user.sector)) {
      return res.sendStatus(403);
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeSector
};

// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // user.username, user.sector, etc.
    next();
  });
}

/**
 * Gera um middleware que só deixa passar usuários cujo
 * `req.user.sector` esteja na lista `allowed`.
 */
function authorizeSector(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.sendStatus(401);
    if (!allowed.includes(req.user.sector)) {
      return res.sendStatus(403);
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeSector
};

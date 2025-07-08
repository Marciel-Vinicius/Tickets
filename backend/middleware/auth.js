const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

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

// Agora aceita múltiplos setores e dá master ao DEV
function authorizeSector(...sectors) {
  return (req, res, next) => {
    if (!req.user) return res.sendStatus(403);
    // Master DEV
    if (req.user.sector === 'DEV') {
      return next();
    }
    // Só continua se estiver na lista de setores permitidos
    if (sectors.includes(req.user.sector)) {
      return next();
    }
    return res.sendStatus(403);
  };
}

module.exports = { authenticateToken, authorizeSector };

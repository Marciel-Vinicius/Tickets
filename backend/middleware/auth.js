const jwt = require('jsonwebtoken');
const SECRET = 'MY_SECRET';

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

function authorizeSector(sector) {
  return (req, res, next) => {
    if (req.user && req.user.sector === sector) return next();
    return res.sendStatus(403);
  };
}

module.exports = { authenticateToken, authorizeSector };

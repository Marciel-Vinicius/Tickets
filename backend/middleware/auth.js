// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

// Verifica e decodifica o JWT, colocando o payload em req.user
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ message: 'Token inválido' });

  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = payload;
    next();
  });
}

// Agora authorizeSector retorna um middleware válido
function authorizeSector(...allowedSectors) {
  return (req, res, next) => {
    const setor = req.user?.sector;
    if (!setor || !allowedSectors.includes(setor)) {
      return res.status(403).json({ message: 'Acesso negado: setor não autorizado' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeSector };

// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

// decodifica o token e bota o payload em req.user, rejeita tokens emitidos antes de logout_all_at
async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }

  // verifica se houve um logout-all depois da emissão do token
  try {
    const { rows } = await query(
      'SELECT logout_all_at FROM users WHERE username = $1',
      [payload.username]
    );
    const logoutAllAt = rows[0]?.logout_all_at;
    if (logoutAllAt && payload.iat * 1000 < new Date(logoutAllAt).getTime()) {
      return res
        .status(401)
        .json({ message: 'Sessão expirada. Faça login novamente.' });
    }
  } catch (err) {
    console.error('Erro ao verificar logout_all_at:', err);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }

  req.user = payload;
  next();
}

// gera um middleware que só permite os setores listados (DEV sempre passa)
function authorizeSector(...allowedSectors) {
  return (req, res, next) => {
    const setor = req.user?.sector;
    if (setor === 'DEV' || allowedSectors.includes(setor)) {
      return next();
    }
    return res
      .status(403)
      .json({ message: 'Acesso negado: setor não autorizado' });
  };
}

module.exports = { authenticate, authorizeSector };

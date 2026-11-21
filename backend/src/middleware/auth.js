const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const autenticar = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded = verifyToken(header.substring(7));

    // Confere no banco: usuário desativado ou com perfil alterado vale na hora, sem esperar o token expirar
    const usuario = await User.findById(decoded.id).select('role ativo');
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ success: false, message: 'Usuário inexistente ou desativado' });
    }

    req.usuarioId = String(usuario._id);
    req.usuarioRole = usuario.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
  }
};

module.exports = autenticar;

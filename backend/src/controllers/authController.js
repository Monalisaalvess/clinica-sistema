const authService = require('../services/authService');

class AuthController {
  
  async signup(req, res) {
    try {
      const resultado = await authService.signup(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: resultado
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Erro ao registrar usuário',
        erros: error.erros
      });
    }
  }
  
  
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }
      
      const resultado = await authService.login(email, senha);
      
      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: resultado
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Erro ao fazer login'
      });
    }
  }
  
  async logout(req, res) {
    
    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  }
  
  
  async obterMe(req, res) {
    try {
      const usuario = await authService.obterPorId(req.usuarioId);
      
      return res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
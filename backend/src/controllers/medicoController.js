const medicoService = require('../services/medicoService');

module.exports = {
  async listar(req, res) {
    try {
      res.json({ success: true, data: await medicoService.listar(req.query.especialidade) });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message || 'Erro ao listar médicos' });
    }
  }
};

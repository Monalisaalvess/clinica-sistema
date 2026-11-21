const consultaService = require('../services/consultaService');

const usuario = (req) => ({ id: req.usuarioId, role: req.usuarioRole });

const executar = (status, mensagem, fn) => async (req, res) => {
  try {
    const data = await fn(req);
    return res.status(status).json({ success: true, ...(mensagem && { message: mensagem }), data });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Erro interno' });
  }
};

module.exports = {
  agendar: executar(201, 'Consulta agendada com sucesso', (req) => consultaService.agendar(req.body, usuario(req))),
  cancelar: executar(200, 'Consulta cancelada com sucesso', (req) =>
    consultaService.cancelar(req.params.id, usuario(req), req.body && req.body.motivo)),
  concluir: executar(200, 'Consulta concluída com sucesso', (req) =>
    consultaService.concluir(req.params.id, usuario(req), req.body && req.body.observacoes)),
  listar: executar(200, null, (req) => consultaService.listarPorUsuario(usuario(req), req.query))
};

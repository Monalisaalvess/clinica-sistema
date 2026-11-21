const router = require('express').Router();

const User = require('../models/User');
const Consulta = require('../models/appointments/Consulta');
const Servico = require('../models/Servico');
const authService = require('../services/authService');
const autenticar = require('../middleware/auth');
const autorizar = require('../middleware/rbac');

const admin = [autenticar, autorizar('admin')];
const equipe = [autenticar, autorizar('admin', 'recepcionista')];

const traduzir = (e) => {
  if (e.status) return e;
  if (e.name === 'CastError') return { status: 400, message: 'ID inválido' };
  if (e.code === 11000) return { status: 409, message: 'Registro duplicado (e-mail ou CRM já cadastrado)' };
  if (e.name === 'ValidationError') return { status: 400, message: Object.values(e.errors).map((x) => x.message).join('. ') };
  console.error(e);
  return { status: 500, message: 'Erro interno do servidor' };
};

const tratar = (fn, status = 200) => async (req, res) => {
  try {
    res.status(status).json({ success: true, data: await fn(req) });
  } catch (e) {
    const t = traduzir(e);
    res.status(t.status).json({ success: false, message: t.message, erros: e.erros });
  }
};

const campos = (o = {}, ks) => Object.fromEntries(ks.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const existe = (doc, nome) => { if (!doc) throw { status: 404, message: `${nome} não encontrado` }; return doc; };
const validarTempo = (b) => {
  if (b.tempoConsultaMinutos !== undefined && !(b.tempoConsultaMinutos >= 15 && b.tempoConsultaMinutos <= 120)) {
    throw { status: 400, message: 'Duração da consulta deve ficar entre 15 e 120 minutos' };
  }
};

// ---------- Serviços ----------
router.get('/servicos', tratar(() => Servico.find({ ativo: true }).sort({ nome: 1 })));
router.get('/admin/servicos', ...admin, tratar(() => Servico.find().sort({ nome: 1 })));
router.post('/admin/servicos', ...admin, tratar((req) => Servico.create(campos(req.body, ['nome', 'descricao'])), 201));
router.patch('/admin/servicos/:id', ...admin, tratar(async (req) =>
  existe(await Servico.findByIdAndUpdate(req.params.id, campos(req.body, ['nome', 'descricao', 'ativo']), { new: true, runValidators: true }), 'Serviço')));
router.delete('/admin/servicos/:id', ...admin, tratar(async (req) =>
  existe(await Servico.findByIdAndDelete(req.params.id), 'Serviço')));

// ---------- Médicos ----------
router.get('/admin/medicos', ...admin, tratar(() =>
  User.find({ role: 'medico' }).select('nome email telefone especialidade crm tempoConsultaMinutos ativo').sort({ nome: 1 })));
router.post('/admin/medicos', ...admin, tratar((req) => authService.criarPorAdmin(req.body, 'medico'), 201));
router.patch('/admin/medicos/:id', ...admin, tratar(async (req) => {
  validarTempo(req.body);
  return existe(await User.findOneAndUpdate(
    { _id: req.params.id, role: 'medico' },
    campos(req.body, ['nome', 'telefone', 'especialidade', 'tempoConsultaMinutos', 'ativo']),
    { new: true }), 'Médico');
}));

// ---------- Equipe (recepcionistas e admins) ----------
router.get('/admin/equipe', ...admin, tratar(() =>
  User.find({ role: { $in: ['admin', 'recepcionista'] } }).select('nome email telefone role ativo').sort({ nome: 1 })));
router.post('/admin/equipe', ...admin, tratar((req) => {
  const role = req.body.role;
  if (!['recepcionista', 'admin'].includes(role)) throw { status: 400, message: 'role deve ser recepcionista ou admin' };
  return authService.criarPorAdmin(req.body, role);
}, 201));
router.patch('/admin/equipe/:id', ...admin, tratar(async (req) => {
  if (req.params.id === req.usuarioId && req.body.ativo === false) {
    throw { status: 400, message: 'Você não pode desativar a própria conta' };
  }
  return existe(await User.findOneAndUpdate(
    { _id: req.params.id, role: { $in: ['admin', 'recepcionista'] } },
    campos(req.body, ['nome', 'telefone', 'ativo']), { new: true }), 'Membro da equipe');
}));

// ---------- Pacientes ----------
router.get('/admin/pacientes', ...equipe, tratar(() =>
  User.find({ role: 'paciente', ativo: true }).select('nome email telefone').sort({ nome: 1 })));

// ---------- Resumo ----------
router.get('/admin/resumo', ...admin, tratar(async () => {
  const ini = new Date(); ini.setHours(0, 0, 0, 0);
  const fim = new Date(ini.getTime() + 86400000);
  const [hoje, agendadas, canceladas, realizadas, medicos, pacientes] = await Promise.all([
    Consulta.countDocuments({ status: 'agendada', dataHoraInicio: { $gte: ini, $lt: fim } }),
    Consulta.countDocuments({ status: 'agendada' }),
    Consulta.countDocuments({ status: 'cancelada' }),
    Consulta.countDocuments({ status: 'realizada' }),
    User.countDocuments({ role: 'medico', ativo: true }),
    User.countDocuments({ role: 'paciente' })
  ]);
  return { hoje, agendadas, canceladas, realizadas, medicos, pacientes };
}));

module.exports = router;

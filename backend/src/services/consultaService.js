const mongoose = require('mongoose');
const Consulta = require('../models/appointments/Consulta');
const User = require('../models/User');

const exigirId = (id, nome) => {
  if (!mongoose.isValidObjectId(id)) throw { status: 400, message: `${nome} inválido` };
};

class ConsultaService {

  async agendar(dados, usuarioLogado) {
    const { medicoId, dataHoraInicio } = dados;
    let pacienteId = dados.pacienteId;

    if (usuarioLogado.role === 'paciente') {
      pacienteId = usuarioLogado.id;
    } else if (['recepcionista', 'admin'].includes(usuarioLogado.role)) {
      if (!pacienteId) throw { status: 400, message: 'pacienteId é obrigatório quando quem agenda é a clínica' };
    } else {
      throw { status: 403, message: 'Apenas pacientes, recepcionistas ou administradores podem agendar consultas' };
    }

    exigirId(medicoId, 'medicoId');
    exigirId(pacienteId, 'pacienteId');

    const medico = await User.findById(medicoId);
    if (!medico || medico.role !== 'medico' || !medico.ativo) {
      throw { status: 404, message: 'Médico não encontrado ou indisponível' };
    }
    const paciente = await User.findById(pacienteId);
    if (!paciente || paciente.role !== 'paciente' || !paciente.ativo) {
      throw { status: 404, message: 'Paciente não encontrado' };
    }

    const inicio = new Date(dataHoraInicio);
    if (isNaN(inicio.getTime())) throw { status: 400, message: 'dataHoraInicio inválida' };
    if (inicio < new Date()) throw { status: 400, message: 'Não é possível agendar consulta em data passada' };

    const duracaoMin = medico.tempoConsultaMinutos || 30;
    const fim = new Date(inicio.getTime() + duracaoMin * 60000);

    if (await this._existeConflito(medicoId, inicio, fim, duracaoMin)) {
      throw { status: 409, message: 'Médico já possui consulta agendada nesse horário' };
    }

    const consulta = await Consulta.create({ paciente: pacienteId, medico: medicoId, dataHoraInicio: inicio });
    return this._popular(consulta._id);
  }

  async cancelar(consultaId, usuarioLogado, motivo) {
    exigirId(consultaId, 'ID da consulta');
    const consulta = await Consulta.findById(consultaId);
    if (!consulta) throw { status: 404, message: 'Consulta não encontrada' };

    const ehDono = consulta.paciente.toString() === usuarioLogado.id;
    const ehMedicoDaConsulta = consulta.medico.toString() === usuarioLogado.id;
    const ehEquipe = ['admin', 'recepcionista'].includes(usuarioLogado.role);

    if (!ehDono && !ehMedicoDaConsulta && !ehEquipe) {
      throw { status: 403, message: 'Você não tem permissão para cancelar esta consulta' };
    }
    if (consulta.status !== 'agendada') {
      throw { status: 400, message: 'Só é possível cancelar consultas agendadas' };
    }

    consulta.status = 'cancelada';
    if (motivo) consulta.motivoCancelamento = motivo;
    await consulta.save();
    return this._popular(consulta._id);
  }

  async concluir(consultaId, usuarioLogado, observacoes) {
    exigirId(consultaId, 'ID da consulta');
    const consulta = await Consulta.findById(consultaId);
    if (!consulta) throw { status: 404, message: 'Consulta não encontrada' };

    const ehMedicoDaConsulta = consulta.medico.toString() === usuarioLogado.id;
    if (!ehMedicoDaConsulta && usuarioLogado.role !== 'admin') {
      throw { status: 403, message: 'Apenas o médico da consulta ou o admin pode concluí-la' };
    }
    if (consulta.status !== 'agendada') {
      throw { status: 400, message: 'Só é possível concluir consultas agendadas' };
    }
    if (consulta.dataHoraInicio > new Date()) {
      throw { status: 400, message: 'A consulta ainda não aconteceu' };
    }

    consulta.status = 'realizada';
    if (observacoes) consulta.observacoes = observacoes;
    await consulta.save();
    return this._popular(consulta._id);
  }

  async listarPorUsuario(usuarioLogado, query = {}) {
    const filtro = {};
    if (usuarioLogado.role === 'paciente') filtro.paciente = usuarioLogado.id;
    else if (usuarioLogado.role === 'medico') filtro.medico = usuarioLogado.id;
    if (['agendada', 'cancelada', 'realizada'].includes(query.status)) filtro.status = query.status;

    return Consulta.find(filtro)
      .populate('paciente', 'nome email telefone')
      .populate('medico', 'nome especialidade')
      .sort({ dataHoraInicio: 1 });
  }

  async _existeConflito(medicoId, inicio, fim, duracaoMin) {
    const candidatas = await Consulta.find({
      medico: medicoId,
      status: 'agendada',
      dataHoraInicio: { $gte: new Date(inicio.getTime() - duracaoMin * 60000), $lt: fim }
    });
    return candidatas.some((c) => {
      const fimExistente = new Date(c.dataHoraInicio.getTime() + duracaoMin * 60000);
      return c.dataHoraInicio < fim && fimExistente > inicio;
    });
  }

  async _popular(consultaId) {
    return Consulta.findById(consultaId)
      .populate('paciente', 'nome email telefone')
      .populate('medico', 'nome especialidade');
  }
}

module.exports = new ConsultaService();

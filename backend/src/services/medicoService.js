const User = require('../models/User');

const escapar = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class MedicoService {
  async listar(especialidade) {
    const filtro = { role: 'medico', ativo: true };
    if (especialidade && especialidade !== 'todos') {
      filtro.especialidade = new RegExp(escapar(especialidade), 'i');
    }

    const medicos = await User.find(filtro)
      .select('nome especialidade crm tempoConsultaMinutos')
      .sort({ nome: 1 });

    return medicos.map((m) => ({
      id: m._id, nome: m.nome, especialidade: m.especialidade, crm: m.crm, tempoConsultaMinutos: m.tempoConsultaMinutos
    }));
  }
}

module.exports = new MedicoService();

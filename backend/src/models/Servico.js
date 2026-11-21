const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  descricao: { type: String, trim: true },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Servico', servicoSchema);

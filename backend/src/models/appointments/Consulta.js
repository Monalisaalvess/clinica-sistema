const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Paciente é obrigatório']
  },

  medico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Médico é obrigatório']
  },

  dataHoraInicio: {
    type: Date,
    required: [true, 'Data e hora da consulta são obrigatórias']
  },

  status: {
    type: String,
    enum: {
      values: ['agendada', 'cancelada', 'realizada'],
      message: 'Status inválido'
    },
    default: 'agendada'
  },

  motivoCancelamento: {
    type: String
  },

  observacoes: {
    type: String
  }
}, {
  timestamps: true
});


consultaSchema.index({ medico: 1, dataHoraInicio: 1 });
consultaSchema.index({ paciente: 1, dataHoraInicio: 1 });
consultaSchema.index({ status: 1 });

module.exports = mongoose.model('Consulta', consultaSchema);
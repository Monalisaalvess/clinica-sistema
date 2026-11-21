const mongoose = require('mongoose');

const ehMedico = function () { return this.role === 'medico'; };

const userSchema = new mongoose.Schema({
  email: {
    type: String, required: [true, 'Email é obrigatório'], unique: true,
    lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true, minlength: 3 },
  telefone: { type: String, validate: { validator: (v) => /^\d{10,15}$/.test(v), message: 'Telefone inválido' } },
  cpf: { type: String, validate: { validator: (v) => /^\d{11}$/.test(v), message: 'CPF deve ter 11 dígitos' } },
  senhaHash: { type: String, required: [true, 'Senha é obrigatória'], select: false },
  role: {
    type: String,
    enum: { values: ['admin', 'medico', 'paciente', 'recepcionista'], message: 'Role inválido' },
    default: 'paciente'
  },
  ativo: { type: Boolean, default: true },

  // Campos de médico
  especialidade: { type: String, trim: true, required: ehMedico },
  crm: { type: String, trim: true, unique: true, sparse: true, required: ehMedico },
  tempoConsultaMinutos: { type: Number, min: 15, max: 120, required: ehMedico }
}, { timestamps: true });

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

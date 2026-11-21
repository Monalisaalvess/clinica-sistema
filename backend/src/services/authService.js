const User = require('../models/User');
const { hashSenha, compararSenha } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { validar, schemaSignup, schemaLogin } = require('../utils/validators');

const validarDados = (schema, dados) => {
  try { return validar(schema, dados); }
  catch (e) { throw e.erros ? { ...e, message: 'Dados inválidos' } : e; }
};

const formatar = (u) => ({
  id: u._id, email: u.email, nome: u.nome, role: u.role, ativo: u.ativo, telefone: u.telefone,
  cpf: u.cpf, especialidade: u.especialidade, crm: u.crm, tempoConsultaMinutos: u.tempoConsultaMinutos
});

const gerarToken = (u) => generateToken({ id: u._id, email: u.email, role: u.role });

class AuthService {

  // Cadastro público: SEMPRE paciente, ignora qualquer "role" enviado pelo cliente
  async signup(dados) {
    return this._criar({ ...dados, role: 'paciente' });
  }

  // Uso interno do admin: cria médico, recepcionista ou admin
  async criarPorAdmin(dados, role) {
    const { usuario } = await this._criar({ ...dados, role });
    return usuario;
  }

  async _criar(dados) {
    const v = validarDados(schemaSignup, dados);
    const email = v.email.toLowerCase();

    if (await User.findOne({ email })) throw { status: 409, message: 'Email já registrado' };

    const campos = {
      email, nome: v.nome, telefone: v.telefone, cpf: v.cpf, role: v.role,
      senhaHash: await hashSenha(v.senha)
    };
    if (v.role === 'medico') {
      Object.assign(campos, { especialidade: v.especialidade, crm: v.crm, tempoConsultaMinutos: v.tempoConsultaMinutos });
    }

    let usuario;
    try {
      usuario = await User.create(campos);
    } catch (e) {
      if (e.code === 11000) {
        throw { status: 409, message: e.keyPattern && e.keyPattern.crm ? 'CRM já cadastrado' : 'Email já registrado' };
      }
      throw e;
    }

    return { token: gerarToken(usuario), usuario: formatar(usuario) };
  }

  async login(email, senha) {
    const v = validarDados(schemaLogin, { email, senha });
    const usuario = await User.findOne({ email: v.email.toLowerCase() }).select('+senhaHash');

    if (!usuario) throw { status: 401, message: 'Email ou senha incorretos' };
    if (!usuario.ativo) throw { status: 403, message: 'Usuário desativado' };
    if (!(await compararSenha(v.senha, usuario.senhaHash))) {
      throw { status: 401, message: 'Email ou senha incorretos' };
    }

    return { token: gerarToken(usuario), usuario: formatar(usuario) };
  }

  async obterPorId(usuarioId) {
    const usuario = await User.findById(usuarioId);
    if (!usuario) throw { status: 404, message: 'Usuário não encontrado' };
    return formatar(usuario);
  }
}

module.exports = new AuthService();

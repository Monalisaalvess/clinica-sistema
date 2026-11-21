const bcrypt = require('bcryptjs');


const hashSenha = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
};

const compararSenha = async (senhaFornecida, senhaHash) => {
  return bcrypt.compare(senhaFornecida, senhaHash);
};

module.exports = {
  hashSenha,
  compararSenha
};
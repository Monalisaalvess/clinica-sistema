const mongoose = require('mongoose');
const config = require('./env');

const conectarMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { conectarMongoDB };
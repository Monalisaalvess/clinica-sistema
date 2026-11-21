require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');

const app = express();

app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ success: true }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/consultas', require('./routes/consultas.routes'));
app.use('/api/medicos', require('./routes/medicos.routes'));
app.use('/api', require('./routes/gestao.routes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Rota não encontrada' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Erro interno do servidor' });
});

module.exports = app;

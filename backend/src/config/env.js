const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};

['MONGODB_URI', 'JWT_SECRET'].forEach((k) => {
  if (!config[k]) throw new Error(`Variável ${k} não definida no arquivo .env`);
});

module.exports = config;

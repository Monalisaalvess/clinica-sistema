const app = require('./app');
const { conectarMongoDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

conectarMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
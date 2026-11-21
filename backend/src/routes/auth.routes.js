const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const autenticar = require('../middleware/auth');

// públicas
router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// privadas
router.post('/logout', autenticar, (req, res) => authController.logout(req, res));
router.get('/me', autenticar, (req, res) => authController.obterMe(req, res));

module.exports = router;

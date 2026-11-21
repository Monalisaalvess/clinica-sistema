const router = require('express').Router();
const medicoController = require('../controllers/medicoController');

router.get('/', medicoController.listar);

module.exports = router;

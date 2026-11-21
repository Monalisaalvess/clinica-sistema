const router = require('express').Router();
const consultaController = require('../controllers/consultaController');
const autenticar = require('../middleware/auth');

router.get('/', autenticar, consultaController.listar);
router.post('/', autenticar, consultaController.agendar);
router.patch('/:id/cancelar', autenticar, consultaController.cancelar);
router.patch('/:id/concluir', autenticar, consultaController.concluir);

module.exports = router;

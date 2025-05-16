const express = require('express');
const router = express.Router();
const WoredaController = require('../controllers/woredaController');

router.post('/', WoredaController.createWoreda);
router.get('/', WoredaController.getAllWoredas);
router.get('/:id', WoredaController.getWoredaById);
router.put('/:id', WoredaController.updateWoreda);
router.delete('/:id', WoredaController.deleteWoreda);

module.exports = router;
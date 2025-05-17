const express = require('express');
const router = express.Router();
const ZoneController = require('../controllers/zoneController');

router.post('/', ZoneController.createZone);
router.get('/', ZoneController.getAllZones);
router.get('/:id', ZoneController.getZoneById);
router.put('/:id', ZoneController.updateZone);
router.delete('/:id', ZoneController.deleteZone);

module.exports = router;
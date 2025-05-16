const express = require('express');
const router = express.Router();
const RegionController = require('../controllers/regionController');

router.post('/', RegionController.createRegion);
router.get('/', RegionController.getAllRegions);
router.get('/:id', RegionController.getRegionById);
router.put('/:id', RegionController.updateRegion);
router.delete('/:id', RegionController.deleteRegion);

module.exports = router;
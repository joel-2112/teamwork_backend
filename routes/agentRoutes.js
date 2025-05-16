const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/agentController');

router.get('/region-hierarchy', AgentController.getRegionHierarchy);
router.get('/regions/:regionId/zones', AgentController.getZonesByRegion);
router.get('/zones/:zoneId/woredas', AgentController.getWoredasByZone);
router.post('/', AgentController.createAgent);
router.get('/', AgentController.getAllAgents);
router.get('/:id', AgentController.getAgentById);
router.put('/:id', AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);


module.exports = router;
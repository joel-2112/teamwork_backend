const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/agentController');


router.post('/', AgentController.createAgent);
router.get('/', AgentController.getAllAgents);
router.get('/:id', AgentController.getAgentById);
router.put('/:id', AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);


module.exports = router;
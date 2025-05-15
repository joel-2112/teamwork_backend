const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { agentDataValidator } = require('../middlewares/validators/authValidator');
const protect = require('../middlewares/authMiddleware');

router.get('/', agentController.getAllAgents);
router.get('/:id', agentController.getAgentById);
router.post('/', agentDataValidator(), agentController.createAgent);
router.put('/:id', protect, agentDataValidator(true), agentController.updateAgent);
router.delete('/:id', protect, agentController.deleteAgent);

module.exports = router;
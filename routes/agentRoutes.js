import  express from 'express';
const router = express.Router();
import  {
    createAgentController,
    getAllAgentsController,
    getAgentByIdController,
    updateAgentController,
    deleteAgentController,
} from '../controllers/agentController.js';


router.post('/', createAgentController);
router.get('/', getAllAgentsController);
router.get('/:id', getAgentByIdController);
router.put('/:id', updateAgentController);
router.delete('/:id', deleteAgentController);


export default router;
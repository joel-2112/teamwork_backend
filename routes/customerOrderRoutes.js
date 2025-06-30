import express from 'express';
const router = express.Router();
import  {
    getAllOrdersController,
    getOrderByIdController,
    createOrderController,
    updateOrderController,
    deleteOrderController,
    updateCustomerOrderStatusController
} from '../controllers/customerOrderController.js';

router.get('/', getAllOrdersController);
router.get('/:id', getOrderByIdController);
router.post('/', createOrderController);
router.put('/:id', updateOrderController);
router.delete('/:id', deleteOrderController);
router.patch('/:id/status', updateCustomerOrderStatusController);

export default router;
const express = require('express');
const router = express.Router();
const CustomerOrderController = require('../controllers/customerOrderController');

router.get('/', CustomerOrderController.getAllOrders);
router.get('/:id', CustomerOrderController.getOrderById);
router.post('/', CustomerOrderController.createOrder);
router.put('/:id', CustomerOrderController.updateOrder);
router.delete('/:id', CustomerOrderController.deleteOrder);
router.patch('/:id/status', CustomerOrderController.updateCustomerOrderStatus);

module.exports = router;
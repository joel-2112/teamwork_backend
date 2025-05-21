// routes/customerOrderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCustomerOrder,
  getAllCustomerOrders,
  getCustomerOrderById,
  updateCustomerOrder,
  deleteCustomerOrder,
  updateCustomerOrderStatus,
} = require('../controllers/customerOrderController');

router.post('/', createCustomerOrder);
router.get('/', getAllCustomerOrders);
router.get('/:id', getCustomerOrderById);
router.put('/:id', updateCustomerOrder);
router.delete('/:id', deleteCustomerOrder);
router.put('/:id/status', updateCustomerOrderStatus);

module.exports = router;
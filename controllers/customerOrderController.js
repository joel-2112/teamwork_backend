// controllers/customerOrderController.js
const {
  createCustomerOrderService,
  getAllCustomerOrdersService,
  getCustomerOrderByIdService,
  updateCustomerOrderService,
  deleteCustomerOrderService,
  updateCustomerOrderStatusService,
} = require('../services/customerOrderService');

const createCustomerOrder = async (req, res) => {
  try {
    const order = await createCustomerOrderService(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllCustomerOrders = async (req, res) => {
  try {
    const { page, limit, status, country } = req.query;
    const orders = await getAllCustomerOrdersService({ page, limit, status, country });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCustomerOrderById = async (req, res) => {
  try {
    const order = await getCustomerOrderByIdService(req.params.id);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateCustomerOrder = async (req, res) => {
  try {
    const order = await updateCustomerOrderService(req.params.id, req.body);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteCustomerOrder = async (req, res) => {
  try {
    await deleteCustomerOrderService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateCustomerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await updateCustomerOrderStatusService(req.params.id, status);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCustomerOrder,
  getAllCustomerOrders,
  getCustomerOrderById,
  updateCustomerOrder,
  deleteCustomerOrder,
  updateCustomerOrderStatus,
};
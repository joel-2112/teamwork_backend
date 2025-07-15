import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} from "../services/customerOrderService.js";

export const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const filters = { search, status };
    const result = await getAllOrders(parseInt(page), parseInt(limit), filters);
    res.status(200).json({
      success: true,
      data: {
        orders: result.rows,
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / limit),
      },
    });
  } catch (error) {
    console.error("Controller error in getAllOrders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateOrderController = async (req, res) => {
  try {
    const order = await updateOrder(req.params.id, req.body);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteOrderController = async (req, res) => {
  try {
    await deleteOrder(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateCustomerOrderStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

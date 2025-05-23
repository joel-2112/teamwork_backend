const CustomerOrderService = require('../services/customerOrderService');

class CustomerOrderController {
  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const filters = { search, status };
      const result = await CustomerOrderService.getAllOrders(parseInt(page), parseInt(limit), filters);
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
      console.error('Controller error in getAllOrders:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await CustomerOrderService.getOrderById(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createOrder(req, res) {
    try {
      const order = await CustomerOrderService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateOrder(req, res) {
    try {
      const order = await CustomerOrderService.updateOrder(req.params.id, req.body);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteOrder(req, res) {
    try {
      await CustomerOrderService.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateCustomerOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await CustomerOrderService.updateOrderStatus(req.params.id, status);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CustomerOrderController();
const { CustomerOrder, Region, Zone, Woreda } = require('../models/index');
const { Op } = require('sequelize');

class CustomerOrderService {
  async getAllOrders(page = 1, limit = 10, filters = {}) {
    const { search, status } = filters;
    const where = {};

    if (search) {
      where[Op.or] = [
        { orderTitle: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } },
        { sector: { [Op.like]: `%${search}%` } },
        { roleInSector: { [Op.like]: `%${search}%` } },
        { phoneNumber1: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;

    const offset = (page - 1) * limit;

    try {
      return await CustomerOrder.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Region, as: 'Region', required: false },
          { model: Zone, as: 'Zone', required: false },
          { model: Woreda, as: 'Woreda', required: false },
        ],
      });
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    const order = await CustomerOrder.findByPk(id, {
      include: [
        { model: Region, as: 'Region', required: false },
        { model: Zone, as: 'Zone', required: false },
        { model: Woreda, as: 'Woreda', required: false },
      ],
    });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async createOrder(data) {
    const { country, regionId, zoneId, woredaId, manualRegion, manualZone, manualWoreda } = data;

    if (country === 'Ethiopia') {
      if (regionId) {
        const region = await Region.findByPk(regionId);
        if (!region) throw new Error('Invalid Region');
      }
      if (zoneId) {
        const zone = await Zone.findByPk(zoneId);
        if (!zone) throw new Error('Invalid Zone');
      }
      if (woredaId) {
        const woreda = await Woreda.findByPk(woredaId);
        if (!woreda) throw new Error('Invalid Woreda');
      }
    }

    return await CustomerOrder.create(data);
  }

  async updateOrder(id, data) {
    const order = await CustomerOrder.findByPk(id);
    if (!order) throw new Error('Order not found');

    const { country, regionId, zoneId, woredaId, manualRegion, manualZone, manualWoreda } = data;

    if (country === 'Ethiopia') {
      if (regionId) {
        const region = await Region.findByPk(regionId);
        if (!region) throw new Error('Invalid Region');
      }
      if (zoneId) {
        const zone = await Zone.findByPk(zoneId);
        if (!zone) throw new Error('Invalid Zone');
      }
      if (woredaId) {
        const woreda = await Woreda.findByPk(woredaId);
        if (!woreda) throw new Error('Invalid Woreda');
      }
    }

    return await order.update(data);
  }

  async deleteOrder(id) {
    const order = await CustomerOrder.findByPk(id);
    if (!order) throw new Error('Order not found');
    return await order.destroy();
  }

  async updateOrderStatus(id, status) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const order = await CustomerOrder.findByPk(id);
    if (!order) throw new Error('Order not found');

    await order.update({ status });
    return order;
  }
}

module.exports = new CustomerOrderService();
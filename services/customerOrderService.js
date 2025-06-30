import db from "../models/index.js";
import { Op } from "sequelize";
const { CustomerOrder, Region, Zone, Woreda } = db;

export const getAllOrders = async (page = 1, limit = 10, filters = {}) => {
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
        { model: Region, as: "Region", required: false },
        { model: Zone, as: "Zone", required: false },
        { model: Woreda, as: "Woreda", required: false },
      ],
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  const order = await CustomerOrder.findByPk(id, {
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });
  if (!order) throw new Error("Order not found");
  return order;
};

export const createOrder = async (data) => {
  const { country, regionId, zoneId, woredaId } = data;

  if (country === "Ethiopia") {
    if (regionId) {
      const region = await Region.findByPk(regionId);
      if (!region) throw new Error("Invalid Region");
    }
    if (zoneId) {
      const zone = await Zone.findByPk(zoneId);
      if (!zone) throw new Error("Invalid Zone");
    }
    if (woredaId) {
      const woreda = await Woreda.findByPk(woredaId);
      if (!woreda) throw new Error("Invalid Woreda");
    }
  }

  return await CustomerOrder.create(data);
};

export const updateOrder = async (id, data) => {
  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error("Order not found");

  const { country, regionId, zoneId, woredaId } = data;

  if (country === "Ethiopia") {
    if (regionId) {
      const region = await Region.findByPk(regionId);
      if (!region) throw new Error("Invalid Region");
    }
    if (zoneId) {
      const zone = await Zone.findByPk(zoneId);
      if (!zone) throw new Error("Invalid Zone");
    }
    if (woredaId) {
      const woreda = await Woreda.findByPk(woredaId);
      if (!woreda) throw new Error("Invalid Woreda");
    }
  }

  return await order.update(data);
};

export const deleteOrder = async (id) => {
  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error("Order not found");
  return await order.destroy();
};

export const updateOrderStatus = async (id, status) => {
  const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error("Order not found");

  await order.update({ status });
  return order;
};

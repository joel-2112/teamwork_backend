import db from "../models/index.js";
import { Op } from "sequelize";
const { CustomerOrder, Region, Zone, Woreda, User } = db;

// Customer order creation service
export const createCustomerOrderService = async (orderData, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Create the service order
  if (!orderData.serviceId) {
    throw new Error("Service ID is required to create a service order");
  }

  if (orderData.country === "Ethiopia") {
    const region = await Region.findByPk(orderData.regionId);
    if (!region) throw new Error("Invalid Region");

    const zone = await Zone.findByPk(orderData.zoneId);
    if (!zone) throw new Error("Invalid Zone");
    if (orderData.regionId != zone.regionId) {
      throw new Error(
        ` Zone ${zone.name} is not in region ${region.name} please enter correct zone.`
      );
    }

    const woreda = await Woreda.findByPk(orderData.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
    if (orderData.zoneId != woreda.zoneId)
      throw new Error(
        `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
      );

    orderData.manualRegion = null;
    orderData.manualZone = null;
    orderData.manualWoreda = null;
  } else {
    if (!orderData.manualRegion) {
      throw new Error("Manual region is required for non-Ethiopian customers");
    }
    if (!orderData.manualZone) {
      throw new Error("Manual zone is required for non-Ethiopian customers");
    }
    if (!orderData.manualWoreda) {
      throw new Error(
        "Manual woreda/city is required for non-Ethiopian customers"
      );
    }
    orderData.regionId = null;
    orderData.zoneId = null;
    orderData.woredaId = null;
  }

  // Create the service order
  const newOrder = await CustomerOrder.create({
    ...orderData,
    userId: user.id,
    email: user.email,
    fullName: user.name,
  });

  return newOrder;
};


// Get all orders with pagination and filtration
export const getAllOrdersService = async (page = 1, limit = 10, filters = {}) => {
  const { search, status } = filters;
  const where = { isDeleted: false };

  if (search) {
    where[Op.or] = [
      { orderTitle: { [Op.iLike]: `%${search}%` } },
      { fullName: { [Op.iLike]: `%${search}%` } },
      { sector: { [Op.iLike]: `%${search}%` } },
      { roleInSector: { [Op.iLike]: `%${search}%` } },
      { phoneNumber1: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (status) where.status = status;

  const offset = (page - 1) * limit;

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
};


// Get order by ID
export const getOrderByIdService = async (id) => {
  const order = await CustomerOrder.findByPk(id, {
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });

  if (!order) throw new Error("Order not found");

  order.status = "reviewed"; // Automatically set status to reviewed
  await order.save();

  const result = {
    ...order.toJSON(),
    regionName: order.Region?.name || null,
    zoneName: order.Zone?.name || null,
    woredaName: order.Woreda?.name || null,
  };

  return result;
};

// User can update their own order with only pending or reviewed status
export const updateOrderService = async (orderId, userId, data) => {
  const order = await CustomerOrder.findByPk(orderId, {
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });
  if (!order) throw new Error("Order not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (order.email !== user.email) {
    throw new Error("You are not authorized to update this order");
  }

  if (order.status !== "pending" && order.status !== "reviewed") {
    throw new Error("Only pending or reviewed orders can be updated");
  }
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


// Delete order by ID
export const deleteOrderService = async (orderId, userId) => {
  const order = await CustomerOrder.findByPk(orderId, {
    where: { isDeleted: false },
  });
  if (!order) throw new Error("Order not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (user.email === order.email) {
    throw new Error("You are not authorized to delete your own order");
  }

  // Soft delete the order
  order.isDeleted = true;
  order.deletedBy = userId;
  order.deletedAt = new Date();
  await order.save();

  return order;
};

// Update order status by ID
export const updateOrderStatusService = async (id, status) => {
  const validStatuses = [
    "pending",
    "reviewed",
    "accepted",
    "rejected",
    "in_progress",
    "completed",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error("Order not found");

  await order.update({ status });
  return order;
};

// User cancel their own order
export const cancelOrderService = async (orderId, userId) => {
  const order = await CustomerOrder.findByPk(orderId, {
    where: { isDeleted: false },
  });
  if (!order) throw new Error("Order not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (user.email !== order.email) {
    throw new Error("You are not authorized to cancel this order");
  }

  if (order.status !== "pending" && order.status !== "reviewed") {
    throw new Error("Only pending or reviewed orders can be cancelled");
  }

  order.status = "cancelled";
  await order.save();

  return order;
};


// Get all my orders for a user
export const getMyOrdersService = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const { count, rows } = await CustomerOrder.findAndCountAll({
    where: {
      email: user.email,
      isDeleted: false,
    },
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
    page: parseInt(page),
    limit: parseInt(limit),
    distinct: true,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    orders: rows,
  };
};
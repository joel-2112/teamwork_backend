import db from "../models/index.js";
import { Op } from "sequelize";
import {
  sendServiceOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../utils/sendEmail.js";
import moment from "moment";

const { ServiceOrder, Region, Zone, Woreda, User, Service } = db;

// To order the service
export const createServiceOrderService = async (orderData, userId) => {
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
  const newOrder = await ServiceOrder.create({
    ...orderData,
    userId: user.id,
    email: user.email,
    fullName: user.name,
  });

  // Send confirmation email
  const service = await Service.findByPk(orderData.serviceId);
  await sendServiceOrderConfirmationEmail({
    userEmail: user.email,
    fullName: user.name,
    serviceName: service?.title || "Requested Service",
  });

  return newOrder;
};

// Get all orders with pagination and filtration
export const getAllOrdersService = async (
  page = 1,
  limit = 10,
  filters = {},
  user
) => {
  const { search, status, regionId, zoneId, woredaId } = filters;
  const baseWhere = { isDeleted: false };

  // Role-based filtering (affects both count and data)
  const userRole = user?.Role?.name;
  if (userRole === "regionAdmin") {
    baseWhere.regionId = user.regionId;
  } else if (userRole === "zoneAdmin") {
    baseWhere.zoneId = user.zoneId;
  } else if (userRole === "woredaAdmin") {
    baseWhere.woredaId = user.woredaId;
  }

  // Total count without status/search filters
  const totalOrder = await ServiceOrder.count({
    where: baseWhere,
  });

  // Build a filtered `where` object for search + status
  const filteredWhere = { ...baseWhere };

  if (status) filteredWhere.status = status;
  if (regionId) filteredWhere.regionId = regionId;
  if (zoneId) filteredWhere.zoneId = zoneId;
  if (woredaId) filteredWhere.woredaId = woredaId;

  if (search) {
    filteredWhere[Op.or] = [
      { orderTitle: { [Op.iLike]: `%${search}%` } },
      { fullName: { [Op.iLike]: `%${search}%` } },
      { sector: { [Op.iLike]: `%${search}%` } },
      { roleInSector: { [Op.iLike]: `%${search}%` } },
      { phoneNumber1: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ServiceOrder.findAndCountAll({
    where: filteredWhere,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
    distinct: true,
    limit,
    offset,
  });

  // Status counts (also use only baseWhere + role-based restrictions)
  const statusTypes = [
    "pending",
    "reviewed",
    "accepted",
    "rejected",
    "in_progress",
    "cancelled",
    "completed",
  ];

  const statusCounts = {};
  for (const type of statusTypes) {
    statusCounts[`${type}Order`] = await ServiceOrder.count({
      where: { ...baseWhere, status: type },
    });
  }

  return {
    totalOrder, 
    ...statusCounts,
    page: parseInt(page),
    limit: parseInt(limit),
    offset,
    rows,
  };
};


// Get order by ID
export const getOrderByIdService = async (id) => {
  const order = await ServiceOrder.findByPk(id, {
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
  const order = await ServiceOrder.findByPk(orderId, {
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

  if (data.country === "Ethiopia") {
    if (data.regionId) {
      const region = await Region.findByPk(data.regionId);
      if (!region) throw new Error("Invalid Region");
    }
    if (data.zoneId) {
      const zone = await Zone.findByPk(data.zoneId);
      if (!zone) throw new Error("Invalid Zone");
    }
    if (data.woredaId) {
      const woreda = await Woreda.findByPk(data.woredaId);
      if (!woreda) throw new Error("Invalid Woreda");
    }

    data.manualRegion = null;
    data.manualZone = null;
    data.manualWoreda = null;
  } else {
    if (!data.manualRegion)
      throw new Error("Manual region is required for non-Ethiopian customers");
    if (!data.manualZone)
      throw new Error("Manual zone is required for non-Ethiopian customers");
    if (!data.manualWoreda)
      throw new Error("Manual woreda is required for non-Ethiopian customers");

    data.regionId = null;
    data.zoneId = null;
    data.woredaId = null;
  }

  return await order.update(data);
};

// Delete order by ID
export const deleteOrderService = async (orderId, userId) => {
  const order = await ServiceOrder.findByPk(orderId, {
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
  order.deleteAt = new Date();
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

  const order = await ServiceOrder.findByPk(id);
  if (!order) throw new Error("Order not found");

  await order.update({ status });

  // Send email only for the specified 4 statuses
  if (["accepted", "in_progress", "completed", "rejected"].includes(status)) {
    await sendOrderStatusUpdateEmail({
      userEmail: order.email,
      fullName: order.fullName,
      orderTitle: order.orderTitle,
      status,
    });
  }

  return order;
};

// User cancel their own order
export const cancelOrderService = async (orderId, userId) => {
  const order = await ServiceOrder.findByPk(orderId, {
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

  // Send cancellation email
  await sendOrderStatusUpdateEmail({
    userEmail: user.email,
    fullName: order.fullName,
    orderTitle: order.orderTitle,
    status: "cancelled",
  });

  return order;
};

// Get all my orders for a user
export const getMyOrdersService = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const { count, rows } = await ServiceOrder.findAndCountAll({
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

// To send the statistics of the service order of the company
export const ordersStatisticsService = async () => {
  const web = await Service.findOne({
    where: { title: "Custom Software Development" },
  });
  if (!web) throw new Error("Web development service is not found");

  const it = await Service.findOne({ where: { title: "It Consulting" } });
  if (!it) throw new Error("Service it consulting is not found.");

  const custom = await Service.findOne({
    where: { title: "Custom Software Development" },
  });
  if (!custom) throw new Error("custom software service is not found");

  const totalOrder = await ServiceOrder.count({ where: { isDeleted: false } });
  const allWebOrder = await ServiceOrder.count({
    where: { serviceId: web.id, isDeleted: false },
  });
  const allItOrder = await ServiceOrder.count({
    where: { serviceId: it.id, isDeleted: false },
  });
  const allCustomOrder = await ServiceOrder.count({
    where: { serviceId: custom.id, isDeleted: false },
  });
  const allPendingOrder = await ServiceOrder.count({
    where: { status: "pending", isDeleted: false },
  });
  const allReviewedOrder = await ServiceOrder.count({
    where: { status: "reviewed", isDeleted: false },
  });
  const allAcceptedOrder = await ServiceOrder.count({
    where: { status: "accepted", isDeleted: false },
  });
  const allRejectedOrder = await ServiceOrder.count({
    where: { status: "rejected", isDeleted: false },
  });
  const allInProgressOrder = await ServiceOrder.count({
    where: { status: "in_progress", isDeleted: false },
  });
  const allCompletedOrder = await ServiceOrder.count({
    where: { status: "completed", isDeleted: false },
  });
  const allCancelledOrder = await ServiceOrder.count({
    where: { status: "cancelled", isDeleted: false },
  });

   // === Time ranges ===
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();
  
    const monthStart = moment().startOf("month");
    const monthEnd = moment().endOf("month");
  
    // Divide the current month into four weeks
    const weekOneStart = moment(monthStart).toDate();
    const weekOneEnd = moment(monthStart).add(6, "days").endOf("day").toDate();
  
    const weekTwoStart = moment(monthStart)
      .add(7, "days")
      .startOf("day")
      .toDate();
    const weekTwoEnd = moment(monthStart).add(13, "days").endOf("day").toDate();
  
    const weekThreeStart = moment(monthStart)
      .add(14, "days")
      .startOf("day")
      .toDate();
    const weekThreeEnd = moment(monthStart).add(20, "days").endOf("day").toDate();
  
    const weekFourStart = moment(monthStart)
      .add(21, "days")
      .startOf("day")
      .toDate();
    const weekFourEnd = moment(monthEnd).toDate();
  
    // === Count users ===
    const todayOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [todayStart, todayEnd] },
      },
    });
  
    const weekOneOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [weekOneStart, weekOneEnd] },
      },
    });
  
    const weekTwoOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [weekTwoStart, weekTwoEnd] },
      },
    });
  
    const weekThreeOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [weekThreeStart, weekThreeEnd] },
      },
    });
  
    const weekFourOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [weekFourStart, weekFourEnd] },
      },
    });
  
    const thisMonthOrders = await ServiceOrder.count({
      where: {
        createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
      },
    });

  return {
    totalOrder,
    serviceTypes: {
      webDevelopment: allWebOrder,
      itConsulting: allItOrder,
      customSoftware: allCustomOrder,
    },
    data: {
      totalOrders: totalOrder,
      pendingOrders: allPendingOrder,
      reviewedOrders: allReviewedOrder,
      acceptedOrders: allAcceptedOrder,
      rejectedOrders: allRejectedOrder,
      inProgressOrders: allInProgressOrder,
      completedOrders: allCompletedOrder,
      cancelledOrders: allCancelledOrder,
      todayOrders,
      weekOneOrders,
      weekTwoOrders,
      weekThreeOrders,
      weekFourOrders,
      thisMonthOrders,
    },
  };
};


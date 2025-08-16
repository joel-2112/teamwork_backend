import db from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";
import {
  sendServiceOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../utils/sendEmail.js";
import moment from "moment";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicIdFromUrl } from "../utils/cloudinaryHelpers.js";

const { ServiceOrder, Region, Zone, Woreda, User, Service } = db;

// To order the service
export const createServiceOrderService = async (orderData, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Validate serviceId
  if (!orderData.serviceId)
    throw new Error("Service ID is required to create a service order");

  // Validate location data
  if (orderData.country === "Ethiopia") {
    const region = await Region.findByPk(orderData.regionId);
    if (!region) throw new Error("Invalid Region");

    const zone = await Zone.findByPk(orderData.zoneId);
    if (!zone) throw new Error("Invalid Zone");
    if (orderData.regionId != zone.regionId) {
      throw new Error(`Zone ${zone.name} is not in region ${region.name}`);
    }

    const woreda = await Woreda.findByPk(orderData.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
    if (orderData.zoneId != woreda.zoneId)
      throw new Error(`Woreda ${woreda.name} is not in zone ${zone.name}`);

    orderData.manualRegion = null;
    orderData.manualZone = null;
    orderData.manualWoreda = null;
  } else {
    if (!orderData.manualRegion)
      throw new Error("Manual region is required for non-Ethiopian customers");
    if (!orderData.manualZone)
      throw new Error("Manual zone is required for non-Ethiopian customers");
    if (!orderData.manualWoreda)
      throw new Error(
        "Manual woreda/city is required for non-Ethiopian customers"
      );

    orderData.regionId = null;
    orderData.zoneId = null;
    orderData.woredaId = null;
  }

  // Create the service order in DB
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
export const updateOrderService = async (orderId, userId, data, file) => {
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

  // Location validation
  if (data.country && data.country === "Ethiopia") {
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
  }
  if (data.country && data.country !== "Ethiopia") {
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

  if (file) {
    // Delete old file if it exists
    if (order.requirementFile) {
      const publicId = extractPublicIdFromUrl(order.requirementFile);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        } catch (err) {
          console.error("Error deleting old Cloudinary file:", err.message);
        }
      }
    }

    // Save new Cloudinary file URL
    data.requirementFile = file.path;
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
  // === Find service IDs in parallel ===
  const [web, it, custom] = await Promise.all([
    Service.findOne({
      where: { title: "Web Development" },
      attributes: ["id"],
    }),
    Service.findOne({ where: { title: "It Consulting" }, attributes: ["id"] }),
    Service.findOne({
      where: { title: "Custom Software Development" },
      attributes: ["id"],
    }),
  ]);

  if (!web) throw new Error("Web development service is not found");
  if (!it) throw new Error("Service it consulting is not found.");
  if (!custom) throw new Error("Custom software service is not found");

  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  const weekRanges = Array.from({ length: 4 }, (_, i) => {
    const start = moment(monthStart)
      .add(i * 7, "days")
      .startOf("day");
    const end =
      i === 3
        ? moment(monthEnd) // last week might not be exactly 7 days
        : moment(monthStart)
            .add(i * 7 + 6, "days")
            .endOf("day");
    return { start: start.toDate(), end: end.toDate() };
  });

  // === Single aggregated query ===
  const [result] = await ServiceOrder.findAll({
    attributes: [
      [fn("COUNT", col("id")), "totalOrder"],

      // Service Type counts
      [
        fn(
          "SUM",
          literal(`CASE WHEN "serviceId" = ${web.id} THEN 1 ELSE 0 END`)
        ),
        "allWebOrder",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "serviceId" = ${it.id} THEN 1 ELSE 0 END`)
        ),
        "allItOrder",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "serviceId" = ${custom.id} THEN 1 ELSE 0 END`)
        ),
        "allCustomOrder",
      ],

      // Status counts
      [
        fn("SUM", literal(`CASE WHEN "status" = 'pending' THEN 1 ELSE 0 END`)),
        "allPendingOrder",
      ],
      [
        fn("SUM", literal(`CASE WHEN "status" = 'reviewed' THEN 1 ELSE 0 END`)),
        "allReviewedOrder",
      ],
      [
        fn("SUM", literal(`CASE WHEN "status" = 'accepted' THEN 1 ELSE 0 END`)),
        "allAcceptedOrder",
      ],
      [
        fn("SUM", literal(`CASE WHEN "status" = 'rejected' THEN 1 ELSE 0 END`)),
        "allRejectedOrder",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "status" = 'in_progress' THEN 1 ELSE 0 END`)
        ),
        "allInProgressOrder",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "status" = 'completed' THEN 1 ELSE 0 END`)
        ),
        "allCompletedOrder",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "status" = 'cancelled' THEN 1 ELSE 0 END`)
        ),
        "allCancelledOrder",
      ],

      // Time ranges counts
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${todayStart.toISOString()}' AND '${todayEnd.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "todayOrders",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${weekRanges[0].start.toISOString()}' AND '${weekRanges[0].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekOneOrders",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${weekRanges[1].start.toISOString()}' AND '${weekRanges[1].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekTwoOrders",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${weekRanges[2].start.toISOString()}' AND '${weekRanges[2].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekThreeOrders",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${weekRanges[3].start.toISOString()}' AND '${weekRanges[3].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekFourOrders",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "createdAt" BETWEEN '${monthStart.toDate().toISOString()}' AND '${monthEnd.toDate().toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "thisMonthOrders",
      ],
    ],
    where: { isDeleted: false },
    raw: true,
  });

  // Format the output to your desired structure
  return {
    totalOrder: Number(result.totalOrder),
    serviceTypes: {
      webDevelopment: Number(result.allWebOrder),
      itConsulting: Number(result.allItOrder),
      customSoftware: Number(result.allCustomOrder),
    },
    data: {
      totalOrders: Number(result.totalOrder),
      pendingOrders: Number(result.allPendingOrder),
      reviewedOrders: Number(result.allReviewedOrder),
      acceptedOrders: Number(result.allAcceptedOrder),
      rejectedOrders: Number(result.allRejectedOrder),
      inProgressOrders: Number(result.allInProgressOrder),
      completedOrders: Number(result.allCompletedOrder),
      cancelledOrders: Number(result.allCancelledOrder),
      todayOrders: Number(result.todayOrders),
      weekOneOrders: Number(result.weekOneOrders),
      weekTwoOrders: Number(result.weekTwoOrders),
      weekThreeOrders: Number(result.weekThreeOrders),
      weekFourOrders: Number(result.weekFourOrders),
      thisMonthOrders: Number(result.thisMonthOrders),
    },
  };
};

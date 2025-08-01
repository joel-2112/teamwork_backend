import {
  getAllOrdersService,
  getOrderByIdService,
  createServiceOrderService,
  updateOrderService,
  deleteOrderService,
  updateOrderStatusService,
  cancelOrderService,
  getMyOrdersService,
  ordersStatisticsService,
} from "../services/serviceOrderService.js";
import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";

const { Region, Zone, Woreda } = db;

// Create service order with requirement file
export const createServiceOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    let requirementFilePath = null;

    // Extract data without file for validation
    const data = { ...req.body };

    if (file && file.fieldname === "document") {
      // Temporarily set placeholder
      data.requirementFile = "temp-path";
    }

    // Create order in DB
    const order = await createServiceOrderService(data, userId);

    // Save file to disk if uploaded
    if (file && file.fieldname === "requirementFile") {
      const documentsDir = path.join("uploads", "documents");

      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      requirementFilePath = path.join(documentsDir, fileName);

      fs.writeFileSync(requirementFilePath, file.buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/${requirementFilePath}`;
      await order.update({ requirementFile: fileUrl });
    }

    // Fetch region/zone/woreda names
    const [region, zone, woreda] = await Promise.all([
      Region.findByPk(order.regionId),
      Zone.findByPk(order.zoneId),
      Woreda.findByPk(order.woredaId),
    ]);

    res.status(201).json({
      success: true,
      message: "Customer order created successfully.",
      order: {
        ...order.toJSON(),
        regionName: region?.name || null,
        zoneName: zone?.name || null,
        woredaName: woreda?.name || null,
      },
    });
  } catch (error) {
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry. This order already exists.",
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const filters = { search, status };

    const {
      totalOrder,
      pendingOrder,
      reviewedOrder,
      acceptedOrder,
      rejectedOrder,
      inprogressOrder,
      cancelledOrder,
      completedOrder,
      rows,
    } = await getAllOrdersService(parseInt(page), parseInt(limit), filters);

    res.status(200).json({
      success: true,
      message: "All Service Orders retrieved successfully.",
      statistics: {
        totalOrder,
        pendingOrder,
        reviewedOrder,
        acceptedOrder,
        rejectedOrder,
        inprogressOrder,
        cancelledOrder,
        completedOrder,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrder / limit),
        orders: rows,
      },
    });
  } catch (error) {
    console.error("Controller error in getAllOrders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await getOrderByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Order retrieved successfully.",
      order: order,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const order = await updateOrderService(orderId, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Order successfully updated.",
      order: order,
    });
  } catch (error) {
    console.error("Sequelize Error:", error.errors || error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
      errors: error.errors || [],
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    await deleteOrderService(orderId, userId);
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateServiceOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatusService(req.params.id, status);
    res.status(200).json({ success: true, order: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const order = await cancelOrderService(orderId, userId);
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order: order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const orders = await getMyOrdersService(userId, page, limit);
    res.status(200).json({
      success: true,
      message: "My orders retrieved successfully.",
      orders: orders,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const orderStatistics = async (req, res) => {
  try {
    const orderStat = await ordersStatisticsService();
    res
      .status(200)
      .json({
        success: true,
        message:
          "All statistics of order in the company retrieved successfully",
        orderStat,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

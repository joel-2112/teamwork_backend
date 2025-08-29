import express from "express";
const router = express.Router();
import {
  createServiceOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateServiceOrderStatus,
  cancelOrder,
  getMyOrders,
  orderStatistics,
  deleteMyOrder,
} from "../controllers/serviceOrderController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"

router.post(
  "/create-order",
  protect,
  upload.single("requirementFile"), 
  createServiceOrder
);
router.get(
  "/all-orders",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getAllOrders
);
router.get(
  "/order/:id",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getOrderById
);
router.put(
  "/update/:id",
  protect,
  upload.single("requirementFile"), 
  updateOrder
);
router.put(
  "/update-status/:id",
  protect,
  requireRole("admin"),
  updateServiceOrderStatus
);
router.get(
  "/order-stat",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  orderStatistics
);
router.put("/cancel-order/:id", protect, cancelOrder);
router.get("/my-orders", protect, getMyOrders);
router.delete("/delete/:id", protect, deleteOrder);
router.delete("/delete-order/:id", protect, deleteMyOrder)




export default router;

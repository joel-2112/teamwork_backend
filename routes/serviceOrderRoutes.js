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
  getMyOrders
} from "../controllers/serviceOrderController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"


router.post("/create-order", protect, upload.single("requirementFile"), createServiceOrder);
router.get("/all-orders", protect, requireRole('admin'), getAllOrders);
router.get("/order/:id", protect, requireRole('admin'), getOrderById);
router.put("/update/:id", protect, updateOrder);
router.delete("/delete/:id", protect, deleteOrder);
router.put("/update-status/:id", protect, requireRole('admin'), updateServiceOrderStatus);
router.put("/cancel-order/:id", protect, cancelOrder);
router.get("/my-orders", protect, getMyOrders);

export default router;

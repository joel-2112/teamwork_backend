import express from "express";
const router = express.Router();
import {
  createCustomerOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateServiceOrderStatus,
  cancelOrder,
  getMyOrders
} from "../controllers/customerOrderController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

router.post(
  "/create-order",
  protect,
  upload.single("requirementFile"),
  createCustomerOrder
);
router.get("/all-orders", protect, getAllOrders);
router.get("/order/:id", protect, getOrderById);
router.put("/update/:id", protect, updateOrder);
router.delete("/delete/:id", protect, deleteOrder);
router.put("/update-status/:id", protect, updateServiceOrderStatus);
router.put("/cancel-order/:id", protect, cancelOrder);
router.get("/my-orders", protect, getMyOrders);

export default router;

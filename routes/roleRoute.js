import express from "express";
import {
  createRoleValidator,
  validateParamId,
} from "../middlewares/validators/authValidator.js";
import {
  createRoleController,
  updateRoleById,
  getRoleById,
  deleteRoleById,
} from "../controllers/roleController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

router.post(
  "/create-role",
  protect,
  requireRole("admin"),
  createRoleValidator,
  validateRequest,
  createRoleController
);
router.put(
  "/update-role/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  updateRoleById
);
router.get(
  "/role/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  getRoleById
);
router.delete(
  "/delete-role/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  deleteRoleById
);

export default router;

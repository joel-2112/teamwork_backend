import express from "express";
const router = express.Router();
import {
  createEventController,
  getAllEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
} from "../controllers/eventController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import {
  createEventValidator,
  validateParamId,
} from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

router.post(
  "/create-event",
  upload.single("picture"),
  protect,
  requireRole("admin"),
  createEventValidator,
  validateRequest,
  createEventController
);
router.put(
  "/update/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  updateEventController
);
router.delete(
  "/delete/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  deleteEventController
);
router.get(
  "/event/:id",
  validateParamId,
  validateRequest,
  getEventByIdController
);

router.get("/all-event", getAllEventsController);

export default router;

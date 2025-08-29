import express from "express";
const router = express.Router();
import {
  createNewsController,
  getAllNewsController,
  getNewsByIdController,
  updateNewsController,
  deleteNewsController,
  newsStatisticsController,
} from "../controllers/newsController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";
import {
  createNewsValidator,
  validateParamId,
} from "../middlewares/validators/authValidator.js";
import upload from "../middlewares/upload.js";

router.post(
  "/create-news",
  upload.single("picture"),
  createNewsValidator,
  validateRequest,
  protect,
  requireRole("admin"),
  createNewsController
);
router.put(
  "/update-news/:id",
  upload.single("picture"),
  protect,
  requireRole("admin"),
  updateNewsController
);
router.delete(
  "/delete-news/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  deleteNewsController
);
router.get(
  "/news/:id",
  validateParamId,
  validateRequest,
  getNewsByIdController
);
router.get(
  "/news-stat",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  newsStatisticsController
);
router.get("/all-news", getAllNewsController);

export default router;

// routes/userRoutes.js
import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

router.get("/all-users", getAllUsers);
router.get("/user/:id", getUserById);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

export default router;

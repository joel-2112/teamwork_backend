import express from "express";
import { createRoleController } from "../controllers/roleController.js";
import { createRoleValidator } from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

router.post('/create-role', createRoleValidator, validateRequest, createRoleController);


export default router;
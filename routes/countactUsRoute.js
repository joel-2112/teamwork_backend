import express from "express";
import {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  updateContactUs,
  deleteContactUs,
} from "../controllers/contactUsController.js";

const router = express.Router();

router.post("/", createContactUs);
router.get("/", getAllContactUs);
router.get("/:id", getContactUsById);
router.put("/:id", updateContactUs);
router.delete("/:id", deleteContactUs);

export default router;

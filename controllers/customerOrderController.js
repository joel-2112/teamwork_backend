import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";

const { Region, Zone, Woreda } = db;

// Create service order with requirement file
export const createServiceOrder = async (req, res) => {
  try {
    const file = req.file;
    let requirementFilePath = null;

    // Extract data without file for validation
    const data = { ...req.body };

    if (file && file.fieldname === "document") {
      // Temporarily set placeholder
      data.requirementFile = "temp-path";
    }

    // Create order in DB
    const order = await createServiceOrderService(data);

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
      data: {
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

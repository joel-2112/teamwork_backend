import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { createReportService } from "../services/reportService.js";

const { Report } = db;

export const createReport = async (req, res) => {
  try {
    const { title, description, category, regionId, zoneId, woredaId } =
      req.body;
    const userId = req.user.id;
    const files = req.files;

    // Basic validation
    if (
      !title ||
      !description ||
      !category ||
      !regionId ||
      !zoneId ||
      !woredaId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if the report already exists
    const isExist = await Report.findOne({
      where: {
        title,
        description,
        regionId,
        zoneId,
        woredaId,
      },
    });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message:
          "Report with this title already submitted in the specified region, zone, and woreda.",
      });
    }

    // Proceed with saving files after the check
    let imageUrl = null;
    let videoUrl = null;
    let fileUrl = null;

    if (files?.imageUrl && files.imageUrl.length > 0) {
      const imageFile = files.imageUrl[0];
      const imageName = `image-${Date.now()}${path.extname(imageFile.originalname)}`;
      const imagePath = path.join("uploads/assets", imageName);
      fs.mkdirSync("uploads/assets", { recursive: true });
      fs.writeFileSync(imagePath, imageFile.buffer);
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${imageName}`;
    }

    if (files?.videoUrl && files.videoUrl.length > 0) {
      const videoFile = files.videoUrl[0];
      const videoName = `video-${Date.now()}${path.extname(videoFile.originalname)}`;
      const videoPath = path.join("uploads/assets", videoName);
      fs.mkdirSync("uploads/assets", { recursive: true });
      fs.writeFileSync(videoPath, videoFile.buffer);
      videoUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${videoName}`;
    }

    if (files?.fileUrl && files.fileUrl.length > 0) {
      const docFile = files.fileUrl[0];
      const docName = `doc-${Date.now()}${path.extname(docFile.originalname)}`;
      const docPath = path.join("uploads/documents", docName);
      fs.mkdirSync("uploads/documents", { recursive: true });
      fs.writeFileSync(docPath, docFile.buffer);
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${docName}`;
    }

    // Create report after everything is prepared
    const report = await createReportService({
      title,
      description,
      category,
      regionId,
      zoneId,
      woredaId,
      imageUrl,
      videoUrl,
      fileUrl,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

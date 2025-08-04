import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

const { Report, User, Region, Zone, Woreda } = db;

export const createReportService = async (data) => {
  const report = await Report.create(data);
  return report;
};

// Retrieve all reports with pagination and filtration
export const getAllReportsService = async (
  page = 1,
  limit = 10,
  category,
  status,
  search
) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };

  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      {
        model: User,
        as: "reportedBy",
        attributes: ["name", "email", "id"],
        required: false,
      },
    ],
    // attributes: { exclude: ["isDeleted", "deletedBy", "deletedAt"] },
    distinct: true,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    reports: rows,
  };
};

// Retrieve Reports by id
export const getReportsByIdServices = async (id) => {
  const where = { id: id, isDeleted: false };
  const report = await Report.findOne({
    where,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      {
        model: User,
        as: "reportedBy",
        attributes: ["name", "email", "id"],
        required: false,
      },
    ],
  });
  if (!report) throw new Error(" Report not found ");

  return report;
};

// User update their own report only in the pending status
export const updateReportService = async (
  reportId,
  userId,
  data,
  files,
  req
) => {
  // Helper function to delete old file
  const deleteFileIfExists = (filePath) => {
    const basePath = filePath.includes("/uploads/documents/")
      ? "uploads/documents"
      : "uploads/assets";
    const fullPath = path.join(basePath, path.basename(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  };

  const report = await Report.findOne({
    where: { id: reportId, isDeleted: false },
  });

  if (!report) throw new Error("Report not found.");
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  if (report.createdBy !== user.id)
    throw new Error("You are not authorized to update this report.");

  if (report.status !== "pending")
    throw new Error("You can only update a report with pending status.");

  // Handle image replacement
  if (files?.imageUrl && files.imageUrl.length > 0) {
    if (report.imageUrl) deleteFileIfExists(report.imageUrl);

    const imageFile = files.imageUrl[0];
    const imageName = `image-${Date.now()}${path.extname(imageFile.originalname)}`;
    const imagePath = path.join("uploads/assets", imageName);
    fs.writeFileSync(imagePath, imageFile.buffer);
    data.imageUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${imageName}`;
  }

  // Handle video replacement
  if (files?.videoUrl && files.videoUrl.length > 0) {
    if (report.videoUrl) deleteFileIfExists(report.videoUrl);

    const videoFile = files.videoUrl[0];
    const videoName = `video-${Date.now()}${path.extname(videoFile.originalname)}`;
    const videoPath = path.join("uploads/assets", videoName);
    fs.writeFileSync(videoPath, videoFile.buffer);
    data.videoUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${videoName}`;
  }

  // Handle document replacement
  if (files?.fileUrl && files.fileUrl.length > 0) {
    if (report.fileUrl) deleteFileIfExists(report.fileUrl);

    const docFile = files.fileUrl[0];
    const docName = `doc-${Date.now()}${path.extname(docFile.originalname)}`;
    const docPath = path.join("uploads/documents", docName);
    fs.writeFileSync(docPath, docFile.buffer);
    data.fileUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${docName}`;
  }

  const updatedReport = await report.update(data);
  return updatedReport;
};

// Retrieve my reports
export const getMyReportsService = async (
  page = 1,
  limit = 10,
  status,
  category,
  search,
  userId
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const offset = (page - 1) * limit;
  const where = { createdBy: user.id, isDeleted: false };

  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      { model: User, as: "reportedBy", attributes: ["name", "email", "id"] },
    ],
    distinct: true,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    reports: rows,
  };
};

// User can cancel their own report only in the pending status
export const cancelReportService = async (reportId, userId) => {
  const report = await Report.findOne({
    where: { id: reportId, isDeleted: false },
  });
  if (!report) throw new Error("Report not found.");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  if (report.createdBy !== user.id)
    throw new Error("You are not authorized to cancel this report.");

  if (report.status !== "pending")
    throw new Error("You can only cancel reports with pending status.");

  report.status = "cancelled";
  await report.save();

  return report;
};

// update reports status except cancelled status
export const updateReportStatusService = async (reportId, userId, status) => {
  const report = await Report.findOne({
    where: { id: reportId, isDeleted: false },
  });
  if (!report) throw new Error("Report not found.");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  if (report.status === "cancelled")
    throw new Error("You can not update status of cancelled report.");

  const updatedReport = await report.update({ status });

  updatedReport.statusChangedBy = user.id;
  updatedReport.changedAt = new Date();
  await updatedReport.save();

  return updatedReport;
};

// Delete Reports by ID
export const deleteReportService = async (reportId, userId) => {
  const report = await Report.findOne({
    where: { id: reportId, isDeleted: false },
  });
  if (!report) throw new Error("Report not found.");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (user.id === report.createdBy)
    throw new Error("You not authorized to delete your own reports");

  report.isDeleted = true;
  report.deletedBy = user.id;
  report.deletedAt = new Date();
  await report.save();

  return report;
};

// Retrieve all deleted reports
export const getAllDeletedReportsService = async (
  page = 1,
  limit = 10,
  status,
  category,
  search
) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: true };

  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      { model: User, as: "removedBy", attributes: ["name", "email", "id"] },
    ],
    distinct: true,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    reports: rows,
  };
};

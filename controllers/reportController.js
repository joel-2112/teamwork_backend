import db from "../models/index.js";
import path from "path";
import fs, { stat } from "fs";
import { Op } from "sequelize";
import {
  createReportService,
  getAllReportsService,
  getReportsByIdServices,
  updateReportService,
  getMyReportsService,
  cancelReportService,
  updateReportStatusService,
  deleteReportService,
  getAllDeletedReportsService,
  reportStatisticsService
} from "../services/reportService.js";
const { Report, User } = db;

export const createReport = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const regionId = parseInt(req.body.regionId);
    const zoneId = parseInt(req.body.zoneId);
    const woredaId = parseInt(req.body.woredaId);
    const userId = req.user.id;
    const files = req.files;

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found.");

    // Basic validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
      });
    }

    // Check if the report already exists
    const isExist = await Report.findOne({
      where: {
        title,
        description,
        regionId: user.regionId,
        zoneId: user.zoneId,
        woredaId: user.woredaId,
      },
    });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message:
          "Report with this title already submitted in the specified region, zone, and woreda.",
      });
    }

    // Extract secure URLs from files uploaded to Cloudinary
    let imageUrl = null;
    let videoUrl = null;
    let fileUrl = null;

    if (files?.imageUrl?.length) {
      imageUrl = files.imageUrl[0].path; // Cloudinary secure URL
    }

    if (files?.videoUrl?.length) {
      videoUrl = files.videoUrl[0].path; // Cloudinary secure URL
    }

    if (files?.fileUrl?.length) {
      fileUrl = files.fileUrl[0].path; // Cloudinary secure URL
    }

    // Create report
    const report = await createReportService({
      title,
      description,
      category,
      imageUrl,
      videoUrl,
      fileUrl,
      regionId: user.regionId,
      zoneId: user.zoneId,
      woredaId: user.woredaId,
      createdBy: user.id,
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


export const getAllReports = async (req, res) => {
  try {
    const {
      page,
      limit,
      category,
      status,
      search,
      regionId,
      zoneId,
      woredaId,
    } = req.query;

    const reports = await getAllReportsService(
      req.user,
      page,
      limit,
      category,
      status,
      search,
      regionId,
      zoneId,
      woredaId
    );

    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      statistics: reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportsById = async (req, res) => {
  try {
    const report = await getReportsByIdServices(req.params.id);
    res.status(200).json({
      success: true,
      message: `Report with id ${req.params.id} is: `,
      report: report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;

    const updatedReport = await updateReportService(
      reportId,
      userId,
      req.body,
      req.files
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, status, category, search } = req.query;
    const myReports = await getMyReportsService(
      page,
      limit,
      status,
      category,
      search,
      userId
    );

    res.status(200).json({
      success: true,
      message: "All my reports retrieved successfully.",
      report: myReports,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: error.message });
  }
};

export const cancelReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    const cancelledReport = await cancelReportService(reportId, userId);

    res.status(200).json({
      success: true,
      message: "Report cancelled successfully.",
      report: cancelledReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const user = req.user;
    const reportId = req.params.id;
    const { status } = req.body;

    const updatedReport = await updateReportStatusService(
      reportId,
      user,
      status
    );

    res.status(200).json({
      success: true,
      message: `Report with ID ${reportId} successfully updated to '${status}'.`,
      report: updatedReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    const deletedReport = await deleteReportService(reportId, userId);

    res.status(200).json({
      message: `Report '${deletedReport.title}' is deleted successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: error.message });
  }
};

export const getDeletedReports = async (req, res) => {
  try {
    const { page, limit, status, category, search } = req.query;

    const deletedReport = await getAllDeletedReportsService(
      page,
      limit,
      status,
      category,
      search
    );

    res.status(200).json({
      success: true,
      message: "All deleted report retrieved successfully.",
      report: deletedReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const reportStatistics = async (req, res) => {
  try {
    const stats = await reportStatisticsService(req.user);
    res.status(200).json({
      success: true,
      message: "Report statistics sent successfully",
      stats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

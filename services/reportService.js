import db from "../models/index.js";
import fs from "fs";
import path from "path";
import moment from "moment";
import { Op } from "sequelize";

const { Report, User, Region, Zone, Woreda, Role } = db;

export const createReportService = async (data) => {
  const report = await Report.create(data);
  return report;
};

// Retrieve all reports with pagination and filtration
export const getAllReportsService = async (
  user,
  page = 1,
  limit = 10,
  category,
  status,
  search,
  regionId,
  zoneId,
  woredaId
) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };
  const userRole = user?.Role?.name;

  if (category) where.category = category;
  if (status) where.status = status;

  // Search filters
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Role-based access control
  let allowedReporterRoleName = null;

  if (userRole === "woredaAdmin") {
    where.woredaId = user.woredaId;
    allowedReporterRoleName = "agent";
  } else if (userRole === "zoneAdmin") {
    where.zoneId = user.zoneId;
    allowedReporterRoleName = "woredaAdmin";
  } else if (userRole === "regionAdmin") {
    where.regionId = user.regionId;
    allowedReporterRoleName = "zoneAdmin";
  } else if (userRole === "admin") {
    allowedReporterRoleName = "regionAdmin";
  }

  // Override geography filtering if explicitly provided
  if (regionId) where.regionId = regionId;
  if (zoneId) where.zoneId = zoneId;
  if (woredaId) where.woredaId = woredaId;

  // Get allowed roleId for creator filter
  let allowedReporterRoleId = null;
  if (allowedReporterRoleName) {
    const role = await Role.findOne({
      where: { name: allowedReporterRoleName },
    });
    if (role) {
      allowedReporterRoleId = role.id;
    }
  }

  // Query reports with filtering on the creator's role
  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      {
        model: User,
        as: "reportedBy",
        attributes: [
          "id",
          "name",
          "email",
          "roleId",
          "regionId",
          "zoneId",
          "woredaId",
        ],
        where: allowedReporterRoleId ? { roleId: allowedReporterRoleId } : {},
        required: true,
      },
    ],
    limit: parseInt(limit),
    offset,
    distinct: true,
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
  files
) => {
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

  // Replace image if new one uploaded
  if (files?.imageUrl?.length > 0) {
    data.imageUrl = files.imageUrl[0].path; 
  }

  // Replace video if new one uploaded
  if (files?.videoUrl?.length > 0) {
    data.videoUrl = files.videoUrl[0].path; 
  }

  // Replace document if new one uploaded
  if (files?.fileUrl?.length > 0) {
    data.fileUrl = files.fileUrl[0].path; 
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
export const updateReportStatusService = async (reportId, user, status) => {
  const report = await Report.findOne({
    where: { id: reportId, isDeleted: false },
  });

  if (!report) throw new Error("Report not found.");
  if (report.status === "cancelled")
    throw new Error("You can not update status of cancelled report.");

  // Role-based access check
  const userRole = user?.Role?.name;
  if (userRole === "regionAdmin" && user.regionId !== report.regionId) {
    throw new Error(
      "You are not authorized to update this report (region mismatch)."
    );
  }

  if (userRole === "zoneAdmin" && user.zoneId !== report.zoneId) {
    throw new Error(
      "You are not authorized to update this report (zone mismatch)."
    );
  }

  if (userRole === "woredaAdmin" && user.woredaId !== report.woredaId) {
    throw new Error(
      "You are not authorized to update this report (woreda mismatch)."
    );
  }

  // Allow only admin or valid scope
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

// To send Report status in the overall company
export const reportStatisticsService = async () => {
  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  // Divide the current month into four weeks
  const weekOneStart = moment(monthStart).toDate();
  const weekOneEnd = moment(monthStart).add(6, "days").endOf("day").toDate();

  const weekTwoStart = moment(monthStart)
    .add(7, "days")
    .startOf("day")
    .toDate();
  const weekTwoEnd = moment(monthStart).add(13, "days").endOf("day").toDate();

  const weekThreeStart = moment(monthStart)
    .add(14, "days")
    .startOf("day")
    .toDate();
  const weekThreeEnd = moment(monthStart).add(20, "days").endOf("day").toDate();

  const weekFourStart = moment(monthStart)
    .add(21, "days")
    .startOf("day")
    .toDate();
  const weekFourEnd = moment(monthEnd).toDate();

  // === Count users ===
  const todayReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const weekOneReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekOneStart, weekOneEnd] },
    },
  });

  const weekTwoReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekTwoStart, weekTwoEnd] },
    },
  });

  const weekThreeReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekThreeStart, weekThreeEnd] },
    },
  });

  const weekFourReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekFourStart, weekFourEnd] },
    },
  });

  const thisMonthReports = await Report.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
    },
  });

  const totalReports = await Report.count({ where: { isDeleted: false } });

  const pendingReports = await Report.count({
    where: { status: "pending", isDeleted: false },
  });

  const openReports = await Report.count({
    where: { status: "open", isDeleted: false },
  });
  const in_progress = await Report.count({
    where: { status: "in_progress", isDeleted: false },
  });
  const cancelledReports = await Report.count({
    where: { status: "cancelled", isDeleted: false },
  });
  const resolvedReports = await Report.count({
    where: { status: "resolved", isDeleted: false },
  });

  return {
    totalReports,
    todayReports,
    weekOneReports,
    weekTwoReports,
    weekThreeReports,
    weekFourReports,
    thisMonthReports,
    pendingReports,
    openReports,
    in_progress,
    cancelledReports,
    resolvedReports,
  };
};

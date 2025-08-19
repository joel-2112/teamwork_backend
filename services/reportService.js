import db from "../models/index.js";
import moment from "moment";
import { Op, fn, col, literal } from "sequelize";

const { Report, User, Region, Zone, Woreda, Role, Agent } = db;

export const createReportService = async (data) => {
  const report = await Report.create(data);
  return report;
};

// Retrieve all reports with pagination and filtration
// export const getAllReportsService = async (
//   user,
//   page = 1,
//   limit = 10,
//   category,
//   status,
//   search,
//   regionId,
//   zoneId,
//   woredaId
// ) => {
//   const offset = (page - 1) * limit;
//   const where = { isDeleted: false };
//   const userRole = user?.Role?.name;

//   if (category) where.category = category;
//   if (status) where.status = status;

//   // Search filters
//   if (search) {
//     where[Op.or] = [
//       { title: { [Op.iLike]: `%${search}%` } },
//       { description: { [Op.iLike]: `%${search}%` } },
//     ];
//   }

//   // Role-based access control
//   let allowedReporterRoleName = null;

//   if (userRole === "woredaAdmin") {
//     where.woredaId = user.woredaId;
//     allowedReporterRoleName = "agent";
//   } else if (userRole === "zoneAdmin") {
//     where.zoneId = user.zoneId;
//     allowedReporterRoleName = "woredaAdmin";
//   } else if (userRole === "regionAdmin") {
//     where.regionId = user.regionId;
//     allowedReporterRoleName = "zoneAdmin";
//   } else if (userRole === "admin") {
//     allowedReporterRoleName = "regionAdmin";
//   }

//   // Override geography filtering if explicitly provided
//   if (regionId) where.regionId = regionId;
//   if (zoneId) where.zoneId = zoneId;
//   if (woredaId) where.woredaId = woredaId;

//   // Get allowed roleId for creator filter
//   let allowedReporterRoleId = null;
//   if (allowedReporterRoleName) {
//     const role = await Role.findOne({
//       where: { name: allowedReporterRoleName },
//     });
//     if (role) {
//       allowedReporterRoleId = role.id;
//     }
//   }

//   // Query reports with filtering on the creator's role
//   const { count, rows } = await Report.findAndCountAll({
//     where,
//     include: [
//       { model: Region, as: "Region", required: false },
//       { model: Zone, as: "Zone", required: false },
//       { model: Woreda, as: "Woreda", required: false },
//       {
//         model: User,
//         as: "reportedBy",
//         attributes: [
//           "id",
//           "name",
//           "email",
//           "roleId",
//           "regionId",
//           "zoneId",
//           "woredaId",
//         ],
//         where: allowedReporterRoleId ? { roleId: allowedReporterRoleId } : {},
//         required: true,
//       },
//     ],
//     limit: parseInt(limit),
//     offset,
//     distinct: true,
//   });

//   return {
//     total: count,
//     page: parseInt(page),
//     limit: parseInt(limit),
//     reports: rows,
//   };
// };

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

  // role-based scope
  let roleFilter = [];
  let agentTypeFilter = null;

  if (userRole === "woredaAdmin") {
    where.woredaId = user.woredaId;
    roleFilter = []; // only agent
    agentTypeFilter = "Woreda";
  } else if (userRole === "zoneAdmin") {
    where.zoneId = user.zoneId;
    roleFilter = ["woredaAdmin"];
    agentTypeFilter = "Zone";
  } else if (userRole === "regionAdmin") {
    where.regionId = user.regionId;
    roleFilter = ["zoneAdmin"];
    agentTypeFilter = "Region";
  } else if (userRole === "admin") {
    // admin sees across all regions
    roleFilter = ["regionAdmin"];
    agentTypeFilter = "Region";
  }

  // Override geography filtering if explicitly provided
  if (regionId) where.regionId = regionId;
  if (zoneId) where.zoneId = zoneId;
  if (woredaId) where.woredaId = woredaId;

  // Build OR filter for reporter
  let reporterCondition = {};
  if (roleFilter.length || agentTypeFilter) {
    reporterCondition = {
      [Op.or]: [
        roleFilter.length
          ? { "$reportedBy.Role.name$": { [Op.in]: roleFilter } }
          : null,
        agentTypeFilter
          ? { "$reportedBy.Agent.agentType$": agentTypeFilter }
          : null,
      ].filter(Boolean),
    };
  }

  const { count, rows } = await Report.findAndCountAll({
    where: {
      ...where,
      ...reporterCondition, // apply role/agentType filter properly
    },
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
        include: [
          { model: Role, as: "Role", attributes: ["id", "name"] },
          { model: Agent, as: "Agent", attributes: ["id", "agentType"] },
        ],
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

  report.status = "open";
  await report.save();

  return report;
};


// User update their own report only in the pending status
export const updateReportService = async (reportId, userId, data, files) => {
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
  // ==== Date Ranges ====
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();
  const monthStart = moment().startOf("month").toDate();
  const monthEnd = moment().endOf("month").toDate();

  const weekRanges = Array.from({ length: 4 }, (_, i) => {
    const start = moment(monthStart).add(i * 7, "days").startOf("day");
    const end =
      i === 3
        ? moment(monthEnd) // last week may not be exactly 7 days
        : moment(monthStart).add(i * 7 + 6, "days").endOf("day");
    return { start: start.toDate(), end: end.toDate() };
  });

  // ==== Aggregated Query (No role filters, no baseWhere) ====
  const results = await Report.findAll({
    where: { isDeleted: false },
    attributes: [
      [fn("COUNT", col("Report.id")), "totalReports"],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${todayStart.toISOString()}' AND '${todayEnd.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "todayReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${weekRanges[0].start.toISOString()}' AND '${weekRanges[0].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekOneReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${weekRanges[1].start.toISOString()}' AND '${weekRanges[1].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekTwoReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${weekRanges[2].start.toISOString()}' AND '${weekRanges[2].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekThreeReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${weekRanges[3].start.toISOString()}' AND '${weekRanges[3].end.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "weekFourReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."createdAt" BETWEEN '${monthStart.toISOString()}' AND '${monthEnd.toISOString()}' THEN 1 ELSE 0 END`
          )
        ),
        "thisMonthReports",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "Report"."status" = 'pending' THEN 1 ELSE 0 END`)
        ),
        "pendingReports",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "Report"."status" = 'open' THEN 1 ELSE 0 END`)
        ),
        "openReports",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "Report"."status" = 'in_progress' THEN 1 ELSE 0 END`
          )
        ),
        "in_progress",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "Report"."status" = 'cancelled' THEN 1 ELSE 0 END`)
        ),
        "cancelledReports",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN "Report"."status" = 'resolved' THEN 1 ELSE 0 END`)
        ),
        "resolvedReports",
      ],
    ],
    raw: true,
  });

  const result = results[0] || {};

  // Convert all fields to numbers
  const numericResult = {};
  for (const key in result) {
    numericResult[key] = Number(result[key]) || 0;
  }

  return numericResult;
};

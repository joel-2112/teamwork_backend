import {
  sendApplicationResultEmail,
  sendJobApplicationConfirmationEmail,
} from "../utils/sendApplicationResult.js";
import fs from "fs";
import path from "path";
import db from "../models/index.js";
const { Job, JobApplication, User } = db;

// Create job
export const createJobApplicationService = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");
  const job = await Job.findByPk(data.jobId);
  if (!job) throw new Error("Job not found");
  if (job.jobStatus !== "open") throw new Error("Job is closed");

  const requiredFields = [
    "applicantFullName",
    "applicantEmail",
    "jobId",
    "resume",
  ];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  // Send confirmation email
  await sendJobApplicationConfirmationEmail({
    userEmail: data.applicantEmail,
    fullName: data.applicantFullName,
    jobTitle: job.jobTitle || "the position",
  });

  return await JobApplication.create({
    ...data,
    userId: user.id,
  });
};

// Retrieve all applications for one job by jobId and change the status of application into reviewed
export const getApplicationsByJobIdService = async (
  jobId,
  { page = 1, limit = 10, status } = {}
) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new Error("Job not found");

  const offset = (page - 1) * limit;
  const where = { jobId };
  if (status) where.status = status;

  // Fetch paginated applications
  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Find applications with status "applied"
  const appliedIds = rows
    .filter((app) => app.status === "applied")
    .map((app) => app.id);

  // Bulk update their status to "reviewed"
  if (appliedIds.length > 0) {
    await JobApplication.update(
      { status: "reviewed" },
      {
        where: {
          id: appliedIds,
        },
      }
    );

    // Update local memory copy (rows) to reflect the change
    rows.forEach((app) => {
      if (appliedIds.includes(app.id)) {
        app.status = "reviewed";
      }
    });
  }

  // Return final result
  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    applications: rows,
  };
};

// Retrieve application by id
export const getApplicationByIdService = async (id) => {
  const application = await JobApplication.findByPk(id, {
    include: [{ model: Job, as: "Job" }],
  });

  if (!application) throw new Error("Job application not found");
  return application;
};

// Update only applied application status
export const updateApplicationStatusService = async (id, status) => {
  const application = await JobApplication.findByPk(id, {
    include: [{ model: Job, attributes: ["title"] }],
  });

  if (!application) throw new Error("Job application not found");
  if (application.status !== "applied" && application.status !== "reviewed")
    throw new Error(
      "Application status other than 'applied' or 'reviewed' cannot be updated."
    );

  // Update status
  const updatedApplication = await application.update({ status });

  // Send email notification
  await sendApplicationResultEmail({
    userEmail: application.applicantEmail,
    fullName: application.applicantFullName,
    jobTitle: application.Job.title,
    applicationStatus: status,
  });

  return updatedApplication;
};

// Delete application by id with  its resume
// export const deleteApplicationService = async (id) => {
//   const application = await JobApplication.findByPk(id);
//   if (!application) throw new Error("Job application not found");

//   // Delete the resume file if it exists
//   if (application.resume) {
//     const resumePath = path.join(
//       process.cwd(),
//       "uploads/documents",
//       path.basename(application.resume)
//     );
//     try {
//       await fs.promises.unlink(resumePath);
//       console.log(`Deleted image file: ${resumePath}`);
//     } catch (err) {
//       console.error(`Error deleting image file: ${err.message}`);
//     }
//   }

//   // Delete the application from the DB
//   return await application.destroy();
// };

export const deleteApplicationService = async (applicationId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const application = await JobApplication.findOne({
    where: { id: applicationId, isDeleted: false },
  });
  if (!application) throw new Error("Application not found or already deleted");

  application.isDeleted = true;
  application.deletedBy = user.id;
  application.deletedAt = new Date();
  await application.save();

  return application;
};

// User can get all their job applications
export const getAllMyJobApplicationService = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const userEmail = user.email;
  const applications = await JobApplication.findAll({
    where: { applicantEmail: userEmail },
    include: [{ model: Job, as: "Job" }],
    order: [["createdAt", "DESC"]],
  });

  if (!applications || applications.length === 0) {
    throw new Error("No job applications found for this user");
  }

  // Return the applications
  applications.forEach((app) => {
    app.resume = path.join(
      process.cwd(),
      "uploads/documents",
      path.basename(app.resume)
    );
  });

  return applications;
};

// To send job application statistics
export const applicationStatisticsService = async () => {
  const totalApplication = await JobApplication.count();
  const appliedApplication = await JobApplication.count({
    where: { status: "applied", isDeleted: false },
  });
  const reviewedApplication = await JobApplication.count({
    where: { status: "reviewed", isDeleted: false },
  });
  const interviewedApplication = await JobApplication.count({
    where: { status: "interviewed", isDeleted: false },
  });
  const hiredApplication = await JobApplication.count({
    where: { status: "hired", isDeleted: false },
  });
  const rejectedApplication = await JobApplication.count({
    where: { status: "rejected", isDeleted: false },
  });

  return {
    totalApplication,
    appliedApplication,
    reviewedApplication,
    interviewedApplication,
    hiredApplication,
    rejectedApplication,
  }
};

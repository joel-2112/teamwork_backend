import { sendApplicationResultEmail } from "../utils/sendApplicationResult.js";
import fs from "fs";
import path from "path";
import db from "../models/index.js";
const { Job, JobApplication, User } = db;


// Create job
export const createJobApplicationService = async (data) => {
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

  return await JobApplication.create(data);
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
  if(application.status !== "applied") throw new Error("Application status with out 'applied' can not update.")

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
export const deleteApplicationService = async (id) => {
  const application = await JobApplication.findByPk(id);
  if (!application) throw new Error("Job application not found");

  // Delete the resume file if it exists
  if (application.resume) {
      const resumePath = path.join(
        process.cwd(),
        "uploads/documents",
        path.basename(application.resume)
      );
      try {
        await fs.promises.unlink(resumePath);
        console.log(`Deleted image file: ${resumePath}`);
      } catch (err) {
        console.error(`Error deleting image file: ${err.message}`);
      }
    }

  // Delete the application from the DB
  return await application.destroy();
};


import {
  createJobApplicationService,
  getApplicationsByJobIdService,
  getApplicationByIdService,
  updateApplicationStatusService,
  deleteApplicationService,
  getAllMyJobApplicationService,
  applicationStatisticsService,
  countApplicationsPerJobService,
} from "../services/jobApplicationSevice.js";
import { Sequelize } from "sequelize";
import fs, { stat } from "fs";
import path from "path";

// Create ( apply for the job ) if the user with the same email and job is not applied
export const createJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || {};

    const data = { ...req.body };

    // Assign temporary values for validation (real values will be set after DB creation)
    if (files.document && files.document.length > 0) {
      data.resume = "placeholder-resume"; // satisfies validation
    }

    if (files.coverLetter && files.coverLetter.length > 0) {
      data.coverLetter = "placeholder-cover-letter"; // satisfies optional or required
    }

    // Step 1: Create DB record first
    const application = await createJobApplicationService(userId, data);

    // Step 2: Upload URLs from Cloudinary response
    let resumeUrl = null;
    let coverLetterUrl = null;

    if (files.document && files.document.length > 0) {
      resumeUrl = files.document[0].path; // Cloudinary URL
      await application.update({ resume: resumeUrl });
    }

    if (files.coverLetter && files.coverLetter.length > 0) {
      coverLetterUrl = files.coverLetter[0].path; // Cloudinary URL
      await application.update({ coverLetter: coverLetterUrl });
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};


// Retrieve job application for one job by job id
export const getApplicationsByJobId = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const applications = await getApplicationsByJobIdService(req.params.jobId, {
      page,
      limit,
      status,
    });
    res.status(200).json({
      success: true,
      statistics: {
        total: applications.total,
        page: applications.page,
        limit: applications.limit,
      },
      applications: applications.applications,
    });
  } catch (error) {
    console.error("Sequelize Error:", error.errors || error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
      errors: error.errors || [],
    });
  }
};

// Retrieve application by id
export const getJobApplicationById = async (req, res) => {
  try {
    const application = await getApplicationByIdService(req.params.id);
    res.status(200).json({ success: true, application: application });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// Update application by id
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await updateApplicationStatusService(
      req.params.id,
      status
    );
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete application
export const deleteJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;
    await deleteApplicationService(applicationId, userId);
    res
      .status(200)
      .json({ success: true, message: "Application deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllMyJobApplication = async (req, res) => {
  try {
    const applications = await getAllMyJobApplicationService(req.user.id);
    res.status(200).json({ success: true, applications: applications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const applicationStatistics = async (req, res) => {
  try {
    const appStat = await applicationStatisticsService();

    res.status(200).json({
      success: true,
      message: "All application statistics is successfully retrieved.",
      applicationStatus: appStat,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const countApplicationsPerJob = async (req, res) => {
  try {
    const jobs = await countApplicationsPerJobService();
    res
      .status(200)
      .json({
        success: true,
        message: "Application statistics id retrieved successfully.",
        stat: jobs,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

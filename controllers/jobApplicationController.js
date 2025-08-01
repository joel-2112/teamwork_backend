import {
  createJobApplicationService,
  getApplicationsByJobIdService,
  getApplicationByIdService,
  updateApplicationStatusService,
  deleteApplicationService,
  getAllMyJobApplicationService,
  applicationStatisticsService,
} from "../services/jobApplicationSevice.js";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";

// Create ( apply for the job ) if the user with the same email and job is not applied
export const createJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || {};
    let documentUrl = null;
    let coverLetterUrl = null;

    const data = { ...req.body };

    // Temporarily set paths for validation
    if (files.document && files.document.length > 0) {
      data.resume = "temp-path-to-resume"; // temp placeholder
    }

    if (files.coverLetter && files.coverLetter.length > 0) {
      data.coverLetter = "temp-path-to-coverLetter"; // temp placeholder
    }

    // Create application record in DB
    const application = await createJobApplicationService(userId, data);

    const uploadDir = path.join("uploads", "documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save document (resume)
    if (files.document && files.document.length > 0) {
      const file = files.document[0];
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      documentUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${fileName}`;
      await application.update({ resume: documentUrl });
    }

    // Save coverLetter
    if (files.coverLetter && files.coverLetter.length > 0) {
      const file = files.coverLetter[0];
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      coverLetterUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${fileName}`;
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


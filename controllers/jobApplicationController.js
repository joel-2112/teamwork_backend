import {
  createJobApplicationService,
  getApplicationsByJobIdService,
  getApplicationByIdService,
  updateApplicationStatusService,
  deleteApplicationService,
  getAllMyJobApplicationService
} from "../services/jobApplicationSevice.js";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";

// Create ( apply for the job ) if the user with the same email and job is not applied
export const createJobApplication = async (req, res) => {
  try {
    // If file uploaded, delay saving it until DB creation succeeds
    const file = req.file;
    let filePath = null;

    // Temporarily exclude resume to validate everything first
    const data = { ...req.body };

    if (file && file.fieldname === "document") {
      data.resume = "temp-path-to-resume";
    }

    // Try to create the application (resume field is required)
    const application = await createJobApplicationService(data);

    // If success, then save the file to disk
    if (file && file.fieldname === "document") {
      const documentsDir = path.join("uploads", "documents");

      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      filePath = path.join(documentsDir, fileName);

      // Save file from memory
      fs.writeFileSync(filePath, file.buffer);

      // Update the application with real resume path
      await application.update({ resume: filePath });
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
        limit: application.limit,
      },
      applications: applications.applications,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
    await deleteApplicationService(req.params.id);
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
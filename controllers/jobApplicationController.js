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


// Create ( apply for the job ) if the user with the same email and job is not applied
export const createJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || {};

    const data = { ...req.body };

    if (files.document && files.document.length > 0) {
      // Use local file path as placeholder
      data.resume = "placeholder-resume";
    }

    if (files.coverLetter && files.coverLetter.length > 0) {
      data.coverLetter = "placeholder-cover-letter";
    }

    const application = await createJobApplicationService(userId, data);

    let resumeUrl = null;
    let coverLetterUrl = null;

    // Update resume URL from multer storage
    if (files.document && files.document.length > 0) {
      resumeUrl = `${req.protocol}://${req.get("host")}/${files.document[0].path.replace(/\\/g, "/")}`;
      await application.update({ resume: resumeUrl });
    }

    // Update cover letter URL from multer storage
    if (files.coverLetter && files.coverLetter.length > 0) {
      coverLetterUrl = `${req.protocol}://${req.get("host")}/${files.coverLetter[0].path.replace(/\\/g, "/")}`;
      await application.update({ coverLetter: coverLetterUrl });
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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

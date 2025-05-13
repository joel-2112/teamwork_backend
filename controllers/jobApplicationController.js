const jobApplicationService = require('../services/jobApplicationSevice');

const submitApplication = async (req, res) => {
  try {
    const { jobId, fullName, phoneNumber, email, positionAppliedFor } = req.body;
    const resume = req.files?.resume ? req.files.resume[0].path : null;
    const coverLetter = req.files?.coverLetter ? req.files.coverLetter[0].path : null;

    const applicationData = {
      jobId,
      fullName,
      phoneNumber,
      email,
      positionAppliedFor,
      resume,
      coverLetter,
    };
    const application = await jobApplicationService.submitApplication(applicationData);
    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await jobApplicationService.getAllApplications();
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await jobApplicationService.getApplicationById(req.params.id);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await jobApplicationService.updateApplicationStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};
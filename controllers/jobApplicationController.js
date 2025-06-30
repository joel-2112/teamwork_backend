import {
  createJobApplicationService,
  getApplicationsByJobIdService,
  getApplicationByIdService,
  updateApplicationStatusService,
  deleteApplicationService,
} from '../services/jobApplicationSevice.js';

export const createJobApplication = async (req, res) => {
  try {
    const application = await createJobApplicationService(req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getApplicationsByJobId = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const applications = await getApplicationsByJobIdService(req.params.jobId, {
      page,
      limit,
      status,
    });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getJobApplicationById = async (req, res) => {
  try {
    const application = await getApplicationByIdService(req.params.id);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await updateApplicationStatusService(req.params.id, status);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteJobApplication = async (req, res) => {
  try {
    await deleteApplicationService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const JobApplicationService = require('../services/jobApplicationSevice');

class JobApplicationController {
  async createJobApplication(req, res) {
    try {
      const application = await JobApplicationService.createJobApplicationService(req.body);
      res.status(201).json({ success: true, data: application });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getApplicationsByJobId(req, res) {
    try {
      const { page, limit, status } = req.query;
      const applications = await JobApplicationService.getApplicationsByJobIdService(req.params.jobId, {
        page,
        limit,
        status,
      });
      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getJobApplicationById(req, res) {
    try {
      const application = await JobApplicationService.getApplicationByIdService(req.params.id);
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateApplicationStatus(req, res) {
    try {
      const { status } = req.body;
      const application = await JobApplicationService.updateApplicationStatusService(req.params.id, status);
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteJobApplication(req, res) {
    try {
      await JobApplicationService.deleteApplicationService(req.params.id);
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new JobApplicationController();
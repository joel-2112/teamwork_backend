const JobApplicationService = require('../services/jobApplicationSevice');
class JobApplicationController {
  async createJobApplication(req, res) {
    try {
      const application = await JobApplicationService.createJobApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllJobApplications(req, res) {
    try {
      const applications = await JobApplicationService.getAllJobApplications();
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getJobApplicationById(req, res) {
    try {
      const application = await JobApplicationService.getJobApplicationById(req.params.id);
      res.status(200).json(application);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateJobApplication(req, res) {
    try {
      const application = await JobApplicationService.updateJobApplication(req.params.id, req.body);
      res.status(200).json(application);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteJobApplication(req, res) {
    try {
      await JobApplicationService.deleteJobApplication(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new JobApplicationController();
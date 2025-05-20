const JobService = require("../services/jobService");

class JobController {
  async createJob(req, res) {
    try {
      const job = await JobService.createJobService(req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAllJobs(req, res) {
    try {
      const { page, limit } = req.query;
      const jobs = await JobService.getAllJobsService({ page, limit });
      res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getJobById(req, res) {
    try {
      const job = await JobService.getJobByIdService(req.params.id);
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateJob(req, res) {
    try {
      const job = await JobService.updateJobService(req.params.id, req.body);
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteJob(req, res) {
    try {
      await JobService.deleteJobService(req.params.id);
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getOpenJobs(req, res) {
    try {
      const { page, limit, category, location, jobType, search } = req.query;
      const jobs = await JobService.getOpenJobsService({
        page,
        limit,
        category,
        location,
        jobType,
        search,
      });
      res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new JobController();
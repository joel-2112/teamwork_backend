const JobService = require("../services/JobService");

class JobController {
  async createJob(req, res) {
    try {
      const job = await JobService.createJob(req.body);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllJobs(req, res) {
    try {
      const jobs = await JobService.getAllJobs();
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getJobById(req, res) {
    try {
      const job = await JobService.getJobById(req.params.id);
      res.status(200).json(job);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateJob(req, res) {
    try {
      const job = await JobService.updateJob(req.params.id, req.body);
      res.status(200).json(job);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteJob(req, res) {
    try {
      await JobService.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new JobController();
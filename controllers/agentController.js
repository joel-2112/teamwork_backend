import { agent } from "supertest";
import {
  createAgentService,
  getAllAgentsService,
  getAgentByIdService,
  updateAgentDataService,
  deleteAgentService,
  updateAgentStatusService,
  getAllDeletedAgentService,
  getMyAgentRequestService,
  getAllApprovedAgentsService,
  cancelAgentService,
} from "../services/agentService.js";
import path from "path";
import { saveImageToDisk } from "../utils/saveImage.js"; // You must have a helper like this


// export const createAgent = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const agent = await createAgentService(userId, req.body);
//     res
//       .status(201)
//       .json({ success: true, message: "Agent created successfully.", agent });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

export const createAgent = async (req, res) => {
  try {
    const userId = req.user.id;

    let profilePicture = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const uniqueName = `agent-${Date.now()}${ext}`;
      saveImageToDisk(req.file.buffer, uniqueName);
      profilePicture = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required.",
      });
    }

    // Handle multiple languages
    const languages = Array.isArray(req.body.languages)
      ? req.body.languages
      : [req.body.languages];

    const agent = await createAgentService(userId, {
      ...req.body,
      profilePicture,
      languages,
    });

    res.status(201).json({
      success: true,
      message: "Agent created successfully.",
      agent,
    });
  } catch (error) {
    console.error("Agent creation error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};



export const getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, agentType, sex } = req.query;
    const filters = { search, agentType, sex };
    const result = await getAllAgentsService(
      parseInt(page),
      parseInt(limit),
      filters
    );
    res.status(200).json({
      data: result.rows,
      total: result.count,
      page: parseInt(page),
      totalPages: Math.ceil(result.count / limit),
    });
  } catch (error) {
    console.error("Controller error in getAllAgents:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAgentById = async (req, res) => {
  try {
    const agent = await getAgentByIdService(req.params.id);
    res.status(200).json(agent);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const userId = req.user.id;
    const agent = await updateAgentDataService(agentId, userId, req.body);
    res.status(200).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAgentStatus = async (req, res) => {
  try {
    const { agentStatus } = req.body;
    const agent = await updateAgentStatusService(req.params.id, agentStatus);
    res.status(200).json({
      success: true,
      message: "Agent status updated successfully.",
      agent: agent,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelAgent = async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.id;

    const agent = await cancelAgentService(agentId, userId);

    res
      .status(200)
      .json({
        success: true,
        message: "You have successfully cancel agent request.",
        agent: agent,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.id;

    const deletedAgent = await deleteAgentService(userId, agentId);

    res.status(200).json({
      success: true,
      message: `Agent with id ${agentId} is successfully deleted.`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllDeletedAgent = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const deletedAgents = await getAllDeletedAgentService({
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "All deleted agent is successfully retrieved.",
      deletedAgents: deletedAgents,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyAgentRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const agentRequest = await getMyAgentRequestService(userId);
    res.status(200).json({
      success: true,
      message: "My agent request retrieved successfully.",
      myRequest: agentRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllApprovedAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const approvedAgents = await getAllApprovedAgentsService({ page, limit });
    res.status(200).json({
      success: true,
      message: "All approved agents retrieved successfully.",
      agents: approvedAgents,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

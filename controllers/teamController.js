import {
  createTeamService,
  getAllTeamService,
  getTeamByIdService,
  deleteTeamService,
  updateTeamService,
} from "../services/teamService.js";
import db from "../models/index.js";
const { Team } = db;

export const createTeam = async (req, res) => {
  try {
    const { fullName, title, quote } = req.body;
    if (!fullName || !title || !quote) {
      return res
        .status(400)
        .json({ message: "Full name, title, and quote are required." });
    }

    let imageUrl = null;
    const file = req.file;

    if (file) {
      imageUrl = `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`;
    }

    const newTeam = await createTeamService({
      fullName,
      title,
      imageUrl,
      quote,
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully.",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeam = async (req, res) => {
  try {
    const { page, limit, fullName, title, search } = req.query;
    const team = await getAllTeamService(page, limit, fullName, title, search);
    return res.status(200).json({
      success: true,
      message: "All team retrieved successfully",
      team: team,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await getTeamByIdService(req.params.id);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Team retrieved successfully",
      team: team,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const updateTeam = async (req, res) => {
  try {
    const team = await updateTeamService(req.params.id, req.body, req.file, req);
    res.status(200).json({
      success: true,
      message: `Team with id ${req.params.id} is successfully updated.`,
      team,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// async (req, res) => {
//   try {
//     const teamId = req.params.id;

//     const team = await Team.findOne({
//       where: { id: teamId, isDeleted: false },
//     });
//     if (!team) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Team not found." });
//     }

//     let imageUrl = team.imageUrl;

//     if (req.file) {
//       imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
//     }

//     const updatedTeam = await updateTeamService(teamId, {
//       ...req.body,
//       imageUrl,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Team updated successfully.",
//       data: updatedTeam,
//     });
//   } catch (error) {
//     console.error("Update team error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const deleteTeam = async (req, res) => {
  try {
    const team = await deleteTeamService(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

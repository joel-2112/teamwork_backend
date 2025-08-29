import {
  createPartnershipService,
  getAllPartnershipsService,
  getPartnershipByIdService,
  updatePartnershipService,
  deletePartnershipService,
  updatePartnershipStatusService,
  getMyPartnershipsService,
  cancelMyPartnershipRequestService,
  allPartnershipService,
  deleteMyPartnershipService,
} from "../services/partershipService.js";
import db from "../models/index.js";
const { User } = db;

export const createPartnership = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let profilePicture = null;

    if (user.profilePicture) {
      profilePicture = user.profilePicture;
    } else if (req.file) {
      profilePicture = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required.",
      });
    }

    const partnership = await createPartnershipService(userId, {
      ...req.body,
      profilePicture,
    });

    res.status(200).json({
      success: true,
      message: "Partnership request sent successfully",
      partnership,
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

export const getAllPartnerships = async (req, res) => {
  try {
    const { page, limit, status, abilityForPartnership, search } = req.query;
    const partnerships = await getAllPartnershipsService({
      page,
      limit,
      status,
      abilityForPartnership,
      search,
    });
    res.status(200).json({
      success: true,
      message: "All partnerships retrieved successfully",
      statistics: partnerships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allPartnership = async (req, res) => {
  try {
    const partner = await allPartnershipService();
    res.status(200).json({
      success: true,
      message: "All partner request is retrieved successfully.",
      partner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartnershipById = async (req, res) => {
  try {
    const partnership = await getPartnershipByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Partnership retrieved successfully",
      partnership: partnership,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updatePartnership = async (req, res) => {
  try {
    const partnershipId = req.params.id;
    const userId = req.user.id;
    const partnership = await updatePartnershipService(
      partnershipId,
      userId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Partnership updated successfully",
      partnership: partnership,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePartnership = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnershipId = req.params.id;
    await deletePartnershipService(partnershipId, userId);
    res
      .status(200)
      .json({ success: true, message: "Partnership deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMyPartnership = async (req, res) => {
  try {
    const partnershipId = req.params.id;
    await deleteMyPartnershipService(partnershipId);
    res
      .status(200)
      .json({ success: true, message: "Partnership deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updatePartnershipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    const partnershipId = req.params.id;
    const partnership = await updatePartnershipStatusService(
      partnershipId,
      userId,
      status
    );
    res.status(200).json({ success: true, data: partnership });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getMyPartnerships = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerships = await getMyPartnershipsService(userId);
    res.status(200).json({
      success: true,
      message: "My partnerships retrieved successfully",
      partnerships: partnerships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMyPartnershipRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const parentId = req.params.id;

    const cancelledPartner = await cancelMyPartnershipRequestService(
      parentId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Partnership request has been successfully canceled",
      partner: cancelledPartner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

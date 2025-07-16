import {
  createPartnershipService,
  getAllPartnershipsService,
  getPartnershipByIdService,
  updatePartnershipService,
  deletePartnershipService,
  updatePartnershipStatusService,
  getMyPartnershipsService
} from "../services/partershipService.js";

export const createPartnership = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnership = await createPartnershipService(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Partnership request sent successfully",
      partnership: partnership,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllPartnerships = async (req, res) => {
  try {
    const { page, limit, status, ability, search } = req.query;
    const partnerships = await getAllPartnershipsService({
      page,
      limit,
      status,
      ability,
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
// controllers/partnershipController.js
const {
  createPartnershipService,
  getAllPartnershipsService,
  getPartnershipByIdService,
  updatePartnershipService,
  deletePartnershipService,
  updatePartnershipStatusService,
} = require('../services/partershipService');

const createPartnership = async (req, res) => {
  try {
    const partnership = await createPartnershipService(req.body);
    res.status(201).json({ success: true, data: partnership });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllPartnerships = async (req, res) => {
  try {
    const { page, limit, status, ability } = req.query;
    const partnerships = await getAllPartnershipsService({ page, limit, status, ability });
    res.status(200).json({ success: true, data: partnerships });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPartnershipById = async (req, res) => {
  try {
    const partnership = await getPartnershipByIdService(req.params.id);
    res.status(200).json({ success: true, data: partnership });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updatePartnership = async (req, res) => {
  try {
    const partnership = await updatePartnershipService(req.params.id, req.body);
    res.status(200).json({ success: true, data: partnership });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deletePartnership = async (req, res) => {
  try {
    await deletePartnershipService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updatePartnershipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const partnership = await updatePartnershipStatusService(req.params.id, status);
    res.status(200).json({ success: true, data: partnership });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createPartnership,
  getAllPartnerships,
  getPartnershipById,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
};
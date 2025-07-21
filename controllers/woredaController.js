import { json } from "sequelize";
import {
  createWoredaService,
  getAllWoredasService,
  getWoredaByIdService,
  updateWoredaService,
  deleteWoredaService,
  getworedaByZoneIdService,
} from "../services/woredaService.js";

// Create woreda
export const createWoreda = async (req, res) => {
  try {
    const woreda = await createWoredaService(req.body);
    res.status(201).json({
      success: true,
      message: "Woreda created successfully.",
      woreda: woreda,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Retrieve all woreda
export const getAllWoredas = async (req, res) => {
  try {
    const woredas = await getAllWoredasService();
    res.status(200).json({
      success: true,
      message: "All woredas retrieved successfully.",
      woredas: woredas,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Retrieve woreda by id
export const getWoredaById = async (req, res) => {
  try {
    const woreda = await getWoredaByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Woreda retrieved successfully.",
      woreda: woreda,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// All woredas in one zone
export const getWoredByZoneId = async (req, res) => {
  try {
    const  zoneId  = req.params.id;

    const { woredas, zoneName } = await getworedaByZoneIdService(zoneId);

    res.status(200).json({
      success: true,
      message: `All woredas in zone: ${zoneName}`,
      woredas,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Update woreda
export const updateWoreda = async (req, res) => {
  try {
    const woreda = await updateWoredaService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Woreda updated successfully.",
      woreda: woreda,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete woreda
export const deleteWoreda = async (req, res) => {
  try {
    await deleteWoredaService(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Woreda deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

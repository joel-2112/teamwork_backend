import {
  createRegionService,
  getAllRegionsService,
  getRegionByIdService,
  updateRegionService,
  deleteRegionService,
} from "../services/regionService.js";

// Create region
export const createRegion = async (req, res) => {
  try {
    const region = await createRegionService(req.body);
    res.status(201).json({
      success: true,
      message: "Region created successfully.",
      region: region,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Retrieve all region
export const getAllRegions = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const regions = await getAllRegionsService( page, limit, search);
    res.status(200).json({
      success: true,
      message: "All region are retrieved successfully.",
      regions: regions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Retrieve region by id
export const getRegionById = async (req, res) => {
  try {
    const region = await getRegionByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Region retrieved successfully.",
      region: region,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Update Region by id
export const updateRegion = async (req, res) => {
  try {
    const region = await updateRegionService(req.params.id, req.body);
    res
      .status(200)
      .json({
        success: true,
        message: "Region updated successfully.",
        region: region,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Delete Region by id
export const deleteRegion = async (req, res) => {
  try {
    await deleteRegionService(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Region deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: true, message: error.message });
  }
};

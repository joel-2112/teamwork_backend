import {
  createZoneService,
  getAllZonesService,
  getZoneByIdService,
  updateZoneService,
  deleteZoneService,
  getZoneByRegionIdService,
} from "../services/zoneService.js";

// Create zone
export const createZone = async (req, res) => {
  try {
    const zone = await createZoneService(req.body);
    res.status(201).json({
      succuss: true,
      message: "Zone created successfully.",
      zone: zone,
    });
  } catch (error) {
    res.status(400).json({ succuss: false, message: error.message });
  }
};

// Retrieve all zone
export const getAllZones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllZonesService(page, limit);

    res.status(200).json({
      success: true,
      message: "All zones retrieved successfully.",
      statistics: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Retrieve zone by id
export const getZoneById = async (req, res) => {
  try {
    const zone = await getZoneByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Zone retrieved successfully.",
      zone: zone,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// All zones in one region
export const getZoneByRegionId = async (req, res) => {
  try {
    const { regionId } = req.body;

    const { zones, regionName } = await getZoneByRegionIdService(regionId);

    res.status(200).json({
      success: true,
      message: `All zones in region: ${regionName}`,
      zones,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update zone
export const updateZone = async (req, res) => {
  try {
    const zone = await updateZoneService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Zone updated successfully.",
      zone: zone,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete zone
export const deleteZone = async (req, res) => {
  try {
    await deleteZoneService(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Zone deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

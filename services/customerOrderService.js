import db from "../models/index.js";
import { Op } from "sequelize";
const { CustomerOrder, Region, Zone, Woreda, User } = db;

// Service creation service
export const createServiceOrderService = async (orderData) => {
  const {
    country,
    regionId,
    zoneId,
    woredaId,
    manualRegion,
    manualZone,
    manualWoreda,
    sector,
    orderTitle,
    fullName,
    sex,
    roleInSector,
    phoneNumber1,
    phoneNumber2,
    shortDescription,
    requirementFile,
  } = orderData;

  const region = await Region.findByPk(regionId);
  if (!region) throw new Error("Invalid Region");

  const zone = await Zone.findByPk(zoneId);
  if (!zone) throw new Error("Invalid Zone");
  if (regionId != zone.regionId) {
    throw new Error(
      ` Zone ${zone.name} is not in region ${region.name} please enter correct zone.`
    );
  }

  const woreda = await Woreda.findByPk(woredaId);
  if (!woreda) throw new Error("Invalid Woreda");
  if (zoneId != woreda.zoneId)
    throw new Error(
      `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
    );

  // Validation for non-Ethiopian customers
  if (country !== "Ethiopia") {
    if (!manualRegion) {
      throw new Error("Manual region is required for non-Ethiopian customers");
    }
    if (!manualZone) {
      throw new Error("Manual zone is required for non-Ethiopian customers");
    }
    if (!manualWoreda) {
      throw new Error(
        "Manual woreda/city is required for non-Ethiopian customers"
      );
    }
  }

  const newOrder = await CustomerOrder.create({
    country,
    regionId,
    zoneId,
    woredaId,
    manualRegion,
    manualZone,
    manualWoreda,
    sector,
    orderTitle,
    fullName,
    sex,
    roleInSector,
    phoneNumber1,
    phoneNumber2,
    shortDescription,
    requirementFile,
  });

  return newOrder;
};
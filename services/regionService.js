const Region = require('../models/Region');
const Zone = require('../models/Zone');
const Woreda = require('../models/Woreda');

class RegionService {
  async createRegion(data) {
    const { name } = data;
    return await Region.create({ name });
  }

  async getAllRegions() {
    return await Region.findAll({
      include: [{ model: Zone, include: [Woreda] }],
    });
  }

  async getRegionById(id) {
    const region = await Region.findByPk(id, {
      include: [{ model: Zone, include: [Woreda] }],
    });
    if (!region) throw new Error('Region not found');
    return region;
  }

  async updateRegion(id, data) {
    const region = await Region.findByPk(id);
    if (!region) throw new Error('Region not found');
    return await region.update(data);
  }

  async deleteRegion(id) {
    const region = await Region.findByPk(id);
    if (!region) throw new Error('Region not found');
    const zoneCount = await Zone.count({ where: { regionId: id } });
    if (zoneCount > 0) throw new Error('Region has associated zones');
    return await region.destroy();
  }
}

module.exports = new RegionService();
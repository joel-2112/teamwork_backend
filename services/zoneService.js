
const {Zone, Region} = require('../models');
class ZoneService {
  async createZone(data) {
    const { name, regionId } = data;
    const region = await Region.findByPk(regionId);
    if (!region) throw new Error('Invalid region ID');
    return await Zone.create({ name, regionId });
  }

  async getAllZones() {
    return await Zone.findAll({
      include: [Region],
    });
  }

  async getZoneById(id) {
    const zone = await Zone.findByPk(id, {
      include: [Region],
    });
    if (!zone) throw new Error('Zone not found');
    return zone;
  }

  async updateZone(id, data) {
    const zone = await Zone.findByPk(id);
    if (!zone) throw new Error('Zone not found');
    if (data.regionId) {
      const region = await Region.findByPk(data.regionId);
      if (!region) throw new Error('Invalid Region');
    }
    return await zone.update(data);
  }

  async deleteZone(id) {
    const zone = await Zone.findByPk(id);
    if (!zone) throw new Error('Zone not found');
    return await zone.destroy();
  }
}

module.exports = new ZoneService();
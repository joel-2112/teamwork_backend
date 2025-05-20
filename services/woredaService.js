const {Woreda, Zone} = require('../models'); 
class WoredaService {
  async createWoreda(data) {
    const { name, zoneId } = data;
    const zone = await Zone.findByPk(zoneId);
    if (!zone) throw new Error('Invalid Zone');
    return await Woreda.create({ name, zoneId });
  }

  async getAllWoredas() {
    return await Woreda.findAll({
      include: [Zone],
    });
  }

  async getWoredaById(id) {
    const woreda = await Woreda.findByPk(id, {
      include: [Zone],
    });
    if (!woreda) throw new Error('Woreda not found');
    return woreda;
  }

  async updateWoreda(id, data) {
    const woreda = await Woreda.findByPk(id);
    if (!woreda) throw new Error('Woreda not found');
    if (data.zoneId) {
      const zone = await Zone.findByPk(data.zoneId);
      if (!zone) throw new Error('Invalid Zone');
    }
    return await woreda.update(data);
  }

  async deleteWoreda(id) {
    const woreda = await Woreda.findByPk(id);
    if (!woreda) throw new Error('Woreda not found');
    return await woreda.destroy();
  }
}

module.exports = new WoredaService();
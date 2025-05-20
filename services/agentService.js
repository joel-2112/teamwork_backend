
const {Agent, Woreda, Zone, Region} = require('../models/index');
class AgentService {
  async createAgent(data) {
    const { woredaId } = data;
    const woreda = await Woreda.findByPk(woredaId);
    if (!woreda) throw new Error('Invalid Woreda');
    return await Agent.create(data);
  }

  async getAllAgents() {
    return await Agent.findAll({
      include: [
        {
          model: Woreda,
          include: [
            {
              model: Zone,
              include: [Region],
            },
          ],
        },
      ],
    });
  }

  async getAgentById(id) {
    const agent = await Agent.findByPk(id, {
      include: [
        {
          model: Woreda,
          include: [
            {
              model: Zone,
              include: [Region],
            },
          ],
        },
      ],
    });
    if (!agent) throw new Error('Agent not found');
    return agent;
  }

  async updateAgent(id, data) {
    const agent = await Agent.findByPk(id);
    if (!agent) throw new Error('Agent not found');
    if (data.woredaId) {
      const woreda = await Woreda.findByPk(data.woredaId);
      if (!woreda) throw new Error('Invalid Woreda');
    }
    return await agent.update(data);
  }

  async deleteAgent(id) {
    const agent = await Agent.findByPk(id);
    if (!agent) throw new Error('Agent not found');
    return await agent.destroy();
  }

  async getRegionHierarchy() {
    return await Region.findAll({
      include: [
        {
          model: Zone,
          include: [Woreda],
        },
      ],
    });
  }

  async getZonesByRegion(regionId) {
    const region = await Region.findByPk(regionId);
    if (!region) throw new Error('Invalid Region');
    return await Zone.findAll({ where: { regionId } });
  }

  async getWoredasByZone(zoneId) {
    const zone = await Zone.findByPk(zoneId);
    if (!zone) throw new Error('Invalid Zone');
    return await Woreda.findAll({ where: { zoneId } });
  }
}

module.exports = new AgentService();
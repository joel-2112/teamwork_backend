const { Agent, Woreda, Zone, Region } = require('../models/index');

class AgentService {
  async createAgent(data) {
    const { regionId, zoneId, woredaId } = data;
    
    const region = await Region.findByPk(regionId);
    if (!region) throw new Error('Invalid Region');
    
    const zone = await Zone.findByPk(zoneId);
    if (!zone) throw new Error('Invalid Zone');
    
    const woreda = await Woreda.findByPk(woredaId);
    if (!woreda) throw new Error('Invalid Woreda');
    
    return await Agent.create(data);
  }

  async getAllAgents(page = 1, limit = 10, filters = {}) {
    const { search } = filters;
    const where = {};
    
    if (search) {
      where[Sequelize.Op.or] = [
        { fullName: { [Sequelize.Op.iLike]: `%${search}%` } },
        { profession: { [Sequelize.Op.iLike]: `%${search}%` } },
        { educationLevel: { [Sequelize.Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (filters.agentType) where.agentType = filters.agentType;
    if (filters.sex) where.sex = filters.sex;
    
    const offset = (page - 1) * limit;
    
    return await Agent.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Region, as: 'Region' },
        { model: Zone, as: 'Zone' },
        { model: Woreda, as: 'Woreda' }
      ]
    });
  }

  async getAgentById(id) {
    const agent = await Agent.findByPk(id, {
      include: [
        { model: Region, as: 'Region' },
        { model: Zone, as: 'Zone' },
        { model: Woreda, as: 'Woreda' }
      ]
    });
    if (!agent) throw new Error('Agent not found');
    return agent;
  }

  async updateAgent(id, data) {
    const agent = await Agent.findByPk(id);
    if (!agent) throw new Error('Agent not found');
    
    if (data.regionId) {
      const region = await Region.findByPk(data.regionId);
      if (!region) throw new Error('Invalid Region');
    }
    
    if (data.zoneId) {
      const zone = await Zone.findByPk(data.zoneId);
      if (!zone) throw new Error('Invalid Zone');
    }
    
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
}

module.exports = new AgentService();
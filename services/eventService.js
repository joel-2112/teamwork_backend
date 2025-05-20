const {Event} = require('../models');
class EventService {
  async createEvent(data) {
    return await Event.create(data);
  }

  async getAllEvents() {
    return await Event.findAll({
      order: [['eventDate', 'ASC']],
    });
  }

  async getEventById(id) {
    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async updateEvent(id, data) {
    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');
    return await event.update(data);
  }

  async deleteEvent(id) {
    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');
    return await event.destroy();
  }
}

module.exports = new EventService();
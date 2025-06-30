import db from '../models/index.js';
const { Event } = db;


export const createEvent = async (data) => {
  return await Event.create(data);
};

export const getAllEvents = async () => {
  return await Event.findAll({
    order: [['eventDate', 'ASC']],
  });
};

export const getEventById = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) throw new Error('Event not found');
  return event;
};

export const updateEvent = async (id, data) => {
  const event = await Event.findByPk(id);
  if (!event) throw new Error('Event not found');
  return await event.update(data);
};

export const deleteEvent = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) throw new Error('Event not found');
  return await event.destroy();
};

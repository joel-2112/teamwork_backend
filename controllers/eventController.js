import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../services/eventService.js';

export const createEventController = async (req, res) => {
  try {
    const event = await createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllEventsController = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateEventController = async (req, res) => {
  try {
    const event = await updateEvent(req.params.id, req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEventController = async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

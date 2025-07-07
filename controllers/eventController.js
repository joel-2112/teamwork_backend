import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../services/eventService.js";
import { saveImageToDisk } from "../utils/saveImage.js";
import fs from "fs";
import path from "path";

export const createEventController = async (req, res) => {
  try {
    const { title, description, location, eventDate } = req.body;

    // Duplicate check
    const existingNews = await createEvent(
      { title, location, eventDate },
      true
    );

    // Save image to disk only if file exists and news is valid
    let imageUrl = null;
    if (req.file) {
      const uniqueName = `picture-${Date.now()}${path.extname(req.file.originalname)}`;
      const savedPath = saveImageToDisk(req.file.buffer, uniqueName);
      imageUrl = `/uploads/assets/${uniqueName}`;
    }

    // Now create the news
    const events = await createEvent({
      title,
      description,
      location,
      eventDate,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: events,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// To get all event with pagination and filtering if it is necessary
export const getAllEventsController = async (req, res) => {
  try {
    const { page, limit, title, description, location, search } = req.query;

    const events = await getAllEvents({
      page,
      limit,
      title,
      description,
      location,
      search,
    });

    res.status(200).json({
      success: true,
      message: "All event retrieved successfully.",
      events: events,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json({
      success: true,
      message: `Event with id ${req.params.id}  is:`,
      event: event,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateEventController = async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;
    const eventId = req.params.id;
    const event = await updateEvent(
      eventId,
      title,
      description,
      eventDate,
      location
    );
    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: event,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteEventController = async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

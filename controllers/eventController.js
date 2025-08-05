import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  eventStatisticsService,
} from "../services/eventService.js";
import db from "../models/index.js";
const { Image, Event } = db;
import { saveImageToDisk } from "../utils/saveImage.js";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";

// Create event
export const createEventController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, location, eventDate } = req.body;

    // Validate images
    const files = req.files || [];
    if (files.length < 1 || files.length > 5) {
      return res.status(400).json({
        message: "Please upload between 1 and 5 images for the event.",
      });
    }

    // Create event
    const event = await createEvent(userId, {
      title,
      description,
      location,
      eventDate,
    });

    // Save images and link to the event
    const imageRecords = await Promise.all(
      files.map((file) => {
        const uniqueName = `event-${Date.now()}-${file.originalname}`;
        saveImageToDisk(file.buffer, uniqueName);
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
        return Image.create({ eventId: event.id, imageUrl });
      })
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: [
        {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          location: event.location,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          images: imageRecords,
        },
      ],
    });
  } catch (error) {
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event with the same title, location and event date already exist",
      });
    }

    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

//  To retrieve event by id
export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json({
      success: true,
      message: `Event with id ${req.params.id}  is:`,
      event: event,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Update event by id
export const updateEventController = async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;
    const eventId = req.params.id;

    // Load event with images to delete old images if needed
    const event = await Event.findByPk(eventId, {
      include: [{ model: Image, as: "images" }],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Update event fields using service
    await updateEvent(eventId, title, description, location, eventDate);

    // Handle new images if uploaded
    const files = req.files || [];
    if (files.length > 0) {
      if (files.length > 5) {
        return res.status(400).json({
          message: "You can upload a maximum of 5 images.",
        });
      }

      // Delete old images from disk and DB
      await Promise.all(
        event.images.map(async (img) => {
          const imagePath = path.join(
            process.cwd(),
            "uploads/assets",
            path.basename(img.imageUrl)
          );
          try {
            await fs.promises.unlink(imagePath);
          } catch (err) {
            console.error("Error deleting image:", err.message);
          }
          await img.destroy();
        })
      );

      // Save new images
      const newImages = await Promise.all(
        files.map((file) => {
          const uniqueName = `event-${Date.now()}-${file.originalname}`;
          saveImageToDisk(file.buffer, uniqueName);
          const imageUrl = `/uploads/assets/${uniqueName}`;
          return Image.create({ eventId: event.id, imageUrl });
        })
      );

      return res.status(200).json({
        success: true,
        message: "Event updated and images replaced successfully.",
        event,
        images: newImages,
      });
    }

    // No image update, just event updated
    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: event,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete event by id
export const deleteEventController = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const deletedEvent = await deleteEvent(eventId, userId);
    res.status(200).json({
      success: true,
      message: "Event and its images deleted successfully.",
      deletedEvent,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const eventStatisticsController = async (req, res) => {
  try {
    const eventStat = await eventStatisticsService();

    res
      .status(200)
      .json({
        success: true,
        message: "Event Statistics is sent successfully.",
        eventStat,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

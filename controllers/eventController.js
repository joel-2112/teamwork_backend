import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  eventStatisticsService,
} from "../services/eventService.js";
import db from "../models/index.js";
import { Sequelize } from "sequelize";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicIdFromUrl } from "../utils/cloudinaryHelpers.js";

const { Image, Event } = db;

// Create event
export const createEventController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, location, eventDate } = req.body;

    const files = req.files || [];

    if (files.length < 1 || files.length > 5) {
      return res.status(400).json({
        message: "Please upload between 1 and 5 images for the event.",
      });
    }

    // Create the event
    const event = await createEvent(userId, {
      title,
      description,
      location,
      eventDate,
    });

    // Save images linked to event, using Cloudinary URLs from multer
    const imageRecords = await Promise.all(
      files.map((file) =>
        Image.create({ eventId: event.id, imageUrl: file.path })
      )
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        images: imageRecords,
      },
    });
  } catch (error) {
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event with the same title, location and event date already exists",
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

    // Get existing Cloudinary image URLs from the form (those to retain)
    let incomingImages = req.body.images || [];
    if (typeof incomingImages === "string") {
      incomingImages = [incomingImages];
    }

    const newImageFiles = req.files || [];

    const event = await Event.findByPk(eventId, {
      include: [{ model: Image, as: "images" }],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Update event details
    await updateEvent(eventId, title, description, location, eventDate);

    const existingImageUrls = event.images.map((img) => img.imageUrl);

    // Filter: Images to keep
    const keepImageUrls = existingImageUrls.filter((url) =>
      incomingImages.includes(url)
    );

    // Images to delete
    const deleteImages = event.images.filter(
      (img) => !keepImageUrls.includes(img.imageUrl)
    );

    // Delete from Cloudinary and DB
    await Promise.all(
      deleteImages.map(async (img) => {
        const publicId = extractPublicIdFromUrl(img.imageUrl);
        if (publicId && img.imageUrl.startsWith("http")) {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        }
        await img.destroy(); // DB delete
      })
    );

    // Check final image count before uploading
    const totalImages = keepImageUrls.length + newImageFiles.length;
    if (totalImages > 5) {
      return res.status(400).json({
        message: "You can only have a maximum of 5 images in total.",
      });
    }

    // Upload new image files to Cloudinary
    await Promise.all(
      newImageFiles.map(async (file) => {
        const imageRecord = await Image.create({
          eventId: event.id,
          imageUrl: file.path, // already uploaded by multer & Cloudinary
        });
        return imageRecord;
      })
    );

    // Refetch updated event
    const updatedEvent = await Event.findByPk(eventId, {
      include: [{ model: Image, as: "images" }],
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
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

    res.status(200).json({
      success: true,
      message: "Event Statistics is sent successfully.",
      eventStat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

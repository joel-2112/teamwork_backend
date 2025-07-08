import db from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
const { Event, Image } = db;

// Create event if it is not exist
export const createEvent = async (data, checkOnly = false) => {
  const existingEvent = await Event.findOne({
    where: {
      title: data.title,
      location: data.location,
      eventDate: data.eventDate,
    },
  });

  if (existingEvent) {
    throw new Error(
      "Event with the same title, location and event date already exists."
    );
  }

  if (checkOnly) return null;

  return await Event.create(data);
};

// Retrieve all events with pagination and filtration by title, description, and location
export const getAllEvents = async ({
  page = 1,
  limit = 10,
  title,
  description,
  location,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (title) where.title = title;
  if (description) where.description = description;
  if (location) where.location = location;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { location: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Event.findAndCountAll({
    where,
    include: [
      {
        model: Image,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
    ],
    distinct: true,
    order: [["eventDate", "ASC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    Events: rows,
  };
};

//Retrieve event by id
export const getEventById = async (id) => {
  const event = await Event.findOne({
    where: { id },
    include: [
      {
        model: Image,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
    ],
  });

  if (!event) throw new Error("Event not found");
  return event;
};

// To update Event
export const updateEvent = async (
  id,
  title,
  description,
  location,
  eventDate
) => {
  const event = await Event.findByPk(id);

  if (!event) throw new Error("Event not found");

  return await event.update({
    title,
    description,
    location,
    eventDate,
  });
};

// Delete event by id with its image from uploads/assets directory
export const deleteEvent = async (id) => {
  const event = await Event.findByPk(id, {
    include: [{ model: Image, as: "images" }],
  });

  if (!event) throw new Error("Event not found");

  // Delete all associated images
  await Promise.all(
    event.images.map(async (img) => {
      const imagePath = path.join(
        process.cwd(),
        "uploads/assets",
        path.basename(img.imageUrl)
      );
      try {
        await fs.promises.unlink(imagePath);
        console.log(`Deleted image file: ${imagePath}`);
      } catch (err) {
        console.error(`Error deleting image file: ${err.message}`);
      }

      // Remove image record from DB
      await img.destroy();
    })
  );

  // Finally delete the event itself
  return await event.destroy();
};

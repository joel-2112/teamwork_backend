import db from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
const { Event } = db;

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

export const getEventById = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) throw new Error("Event not found");
  return event;
};

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

export const deleteEvent = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) throw new Error("Event not found");

  // Delete associated image if it exists
  if (event.imageUrl) {
    const imagePath = path.join(
      process.cwd(),
      "uploads/assets",
      path.basename(event.imageUrl)
    );
    try {
      await fs.promises.unlink(imagePath);
      console.log(`Deleted image file: ${imagePath}`);
    } catch (err) {
      console.error(`Error deleting image file: ${err.message}`);
    }
  }

  // Delete the news record from DB
  return await event.destroy();
};

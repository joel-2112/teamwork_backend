import db from "../models/index.js";
import { Op, where } from "sequelize";
import fs from "fs";
import path from "path";
import moment from "moment";
import { Sequelize } from "sequelize";
const { Event, Image, User } = db;

// Create event if it is not exist
export const createEvent = async (userId, data, checkOnly = false) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");
  return await Event.create({
    ...data,
    postedBy: user.id,
  });
};

// Retrieve all events with pagination and filtration by title, description, and location
export const getAllEvents = async ({
  page = 1,
  limit = 10,
  title,
  description,
  location,
  search,
  status, 
} = {}) => {
  const offset = (page - 1) * limit;

  // Base DB filter
  const where = { isDeleted: false };

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

  // Count all non-deleted events for "total"
  const total = await Event.count({
    where: { isDeleted: false },
  });

  // Fetch WITHOUT pagination first so we can filter by computed status
  const rows = await Event.findAll({
    where,
    include: [
      {
        model: Image,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
    ],
    order: [["eventDate", "ASC"]],
  });

  // Add computed status
  const now = moment();
  const twoHoursLater = moment().add(2, "hours");

  let eventsWithStatus = rows.map((event) => {
    const eventMoment = moment(event.eventDate);
    let computedStatus = "upcoming";

    if (eventMoment.isBefore(now)) {
      computedStatus = "completed";
    } else if (eventMoment.isBetween(now, twoHoursLater, null, "[)")) {
      computedStatus = "ongoing";
    }

    return {
      ...event.toJSON(),
      status: computedStatus,
    };
  });

  // Filter by computed status
  if (status) {
    eventsWithStatus = eventsWithStatus.filter(
      (e) => e.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Apply pagination AFTER filtering
  const paginatedEvents = eventsWithStatus.slice(offset, offset + parseInt(limit));

  return {
    total, 
    totalFiltered: eventsWithStatus.length, 
    page: parseInt(page),
    limit: parseInt(limit),
    Events: paginatedEvents,
  };
};



// Retrieve event by id
export const getEventById = async (id) => {
  const event = await Event.findOne({
    where: { id: id, isDeleted: false },
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
  const event = await Event.findOne({ where: { id: id, isDeleted: false } });

  if (!event) throw new Error("Event not found");

  return await event.update({
    title,
    description,
    location,
    eventDate,
  });
};

// Delete event by id with its image from uploads/assets directory
// export const deleteEvent = async (id) => {
//   const event = await Event.findByPk(id, {
//     include: [{ model: Image, as: "images" }],
//   });

//   if (!event) throw new Error("Event not found");

//   // Delete all associated images
//   await Promise.all(
//     event.images.map(async (img) => {
//       const imagePath = path.join(
//         process.cwd(),
//         "uploads/assets",
//         path.basename(img.imageUrl)
//       );
//       try {
//         await fs.promises.unlink(imagePath);
//         console.log(`Deleted image file: ${imagePath}`);
//       } catch (err) {
//         console.error(`Error deleting image file: ${err.message}`);
//       }

//       // Remove image record from DB
//       await img.destroy();
//     })
//   );

//   // Finally delete the event itself
//   return await event.destroy();
// };

export const deleteEvent = async (eventId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const event = await Event.findOne({
    where: { id: eventId, isDeleted: false },
  });
  if (!event) throw new Error("Event not found or already deleted");

  event.isDeleted = true;
  event.deletedBy = user.id;
  event.deletedAt = new Date();
  await event.save();

  return event;
};

// SEnd event statistics
export const eventStatisticsService = async () => {
  const now = moment();
  const twoHoursLater = moment().add(2, "hours");

  const totalEvents = await Event.count({
    where: {
      isDeleted: false,
    },
  });

  const upcomingEvents = await Event.count({
    where: {
      isDeleted: false,
      eventDate: {
        [db.Sequelize.Op.gt]: twoHoursLater.toDate(), // after 2 hours later
      },
    },
  });

  const ongoingEvents = await Event.count({
    where: {
      isDeleted: false,
      eventDate: {
        [db.Sequelize.Op.between]: [now.toDate(), twoHoursLater.toDate()], // eventDate is between now and 2 hours later
      },
    },
  });

  const completedEvents = await Event.count({
    where: {
      isDeleted: false,
      eventDate: {
        [db.Sequelize.Op.lt]: now.toDate(), // before now
      },
    },
  });

  return {
    totalEvents,
    upcomingEvents,
    ongoingEvents,
    completedEvents,
  };
};

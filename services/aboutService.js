import { Op } from "sequelize";
import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { saveImageToDisk } from "../utils/saveImage.js";

const { About, User } = db;

// Create about with image
export const createAboutService = async (userId, data, checkOnly = false) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const existingAbout = await About.findOne({
    where: {
      title: data.title,
      content: data.content,
    },
  });

  if (existingAbout) {
    throw new Error(
      "About section with the same title and content already exists"
    );
  }

  if (checkOnly) return null;

  return await About.create({
    ...data,
    postedBy: user.id,
  });
};

// Retrieve all about sections with pagination and optional title filter
export const getAllAboutService = async ({
  page = 1,
  limit = 10,
  title,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };
  if (title) where.title = title;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await About.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    abouts: rows,
  };
};

// Retrieve about section by ID
export const getAboutByIdService = async (id) => {
  const about = await About.findOne({ where: { id: id, isDeleted: false } });
  if (!about) throw new Error("About not found");
  return about;
};

export const updateAboutService = async (id, data, file, req) => {
  const about = await About.findOne({ where: { id: id, isDeleted: false } });
  if (!about) throw new Error("About not found");

  if (file) {
    if (about.aboutImage) {
      const oldImagePath = path.join(
        "uploads/assets",
        path.basename(about.aboutImage)
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const uniqueName = `picture-${Date.now()}${path.extname(file.originalname)}`;
    saveImageToDisk(file.buffer, uniqueName);
    data.aboutImage = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
  }

  if (data.values) {
    let parsedValues;

    try {
      parsedValues =
        typeof data.values === "string" ? JSON.parse(data.values) : data.values;
    } catch (err) {
      throw new Error("Values must be a valid JSON array.");
    }

    if (!Array.isArray(parsedValues)) {
      throw new Error("Values must be an array of objects.");
    }

    const updatedValues = parsedValues.map((newVal) => {
      if (!newVal.title || !newVal.description) {
        throw new Error("Each value must have a title and description.");
      }
      return {
        title: newVal.title,
        description: newVal.description,
      };
    });

    data.values = updatedValues;
  }

  return await about.update(data);
};

// Update about section by id
// export const updateAboutService = async (id, data, file, req) => {
//   const about = await About.findByPk(id);
//   if (!about) throw new Error("About not found");

//   // Handle image replacement if a new image is uploaded
//   if (file) {
//     // Delete old image if it exists
//     if (about.aboutImage) {
//       const oldImagePath = path.join(
//         "uploads/assets",
//         path.basename(about.aboutImage)
//       );
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//       }
//     }

//     // Save new image
//     const uniqueName = `picture-${Date.now()}${path.extname(file.originalname)}`;
//     const savedPath = saveImageToDisk(file.buffer, uniqueName);

//     // Set new image URL
//     data.aboutImage = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
//   }

//   // Handle values merging
//   let currentValues = Array.isArray(about.values) ? about.values : [];

//   if (data.values && typeof data.values === "string") {
//     try {
//       data.values = JSON.parse(data.values);
//     } catch (err) {
//       throw new Error("Invalid JSON format for values");
//     }
//   }

//   if (Array.isArray(data.values)) {
//     const updates = data.values;

//     // Merge values
//     const mergedValues = currentValues.map((existingVal) => {
//       const update = updates.find((val) => val.title === existingVal.title);
//       if (update) {
//         return {
//           title: update.title || existingVal.title,
//           description: update.description || existingVal.description,
//         };
//       }
//       return existingVal;
//     });

//     // Add new entries that don't exist yet
//     updates.forEach((val) => {
//       const exists = mergedValues.some((v) => v.title === val.title);
//       if (!exists && val.title && val.description) {
//         mergedValues.push({
//           title: val.title,
//           description: val.description,
//         });
//       }
//     });

//     data.values = mergedValues;
//   }

//   return await about.update(data);
// };

// Delete about section by id
// export const deleteAboutService = async (id) => {
//   const about = await About.findByPk(id);
//   if (!about) throw new Error("About not found");

//   // Delete associated image if it exists
//   if (about.aboutImage) {
//     const imagePath = path.join(
//       process.cwd(),
//       "uploads/assets",
//       path.basename(about.aboutImage)
//     );
//     try {
//       await fs.promises.unlink(imagePath);
//       console.log(`Deleted image file: ${imagePath}`);
//     } catch (err) {
//       console.error(`Error deleting image file: ${err.message}`);
//     }
//   }

//   // Delete the about record from DB
//   return await about.destroy();
// };

export const deleteAboutService = async (aboutId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const about = await About.findOne({ where: { id: aboutId, isDeleted: false } });
  if (!about) throw new Error("About not found or already deleted.");

  about.isDeleted = true;
  about.deletedBy = user.id;
  about.deletedAt = new Date();
  await about.save();

  return about;
};

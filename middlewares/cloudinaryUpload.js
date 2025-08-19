// middlewares/cloudinaryUpload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "uploads";

    if (file.mimetype.startsWith("image/")) {
      folder = "Images";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "Videos";
    } else {
      folder = "Documents";
    }

    return {
      folder,
      resource_type: "auto", 
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      type: "upload", 
      access_control: [
        {
          access_type: "anonymous", 
        },
      ],
    };
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
    "image/x-icon",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/3gpp",
    "application/octet-stream",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/rtf",
    "application/vnd.oasis.opendocument.text",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Multer middleware
const cloudinaryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export default cloudinaryUpload;

// upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
const imageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
];

const videoTypes = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/3gpp",
  "application/octet-stream",  // Add this line
];

const docTypes = [
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


  if (
    (["picture", "pictures", "aboutImage", "imageUrl"].includes(file.fieldname) &&
      imageTypes.includes(file.mimetype)) ||
    (["videoUrl", "videos"].includes(file.fieldname) && videoTypes.includes(file.mimetype)) ||
    (["document", "requirementFile", "fileUrl"].includes(file.fieldname) && docTypes.includes(file.mimetype))

  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type for " + file.fieldname), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 5 MB
});

export default upload;



// // upload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Ensure uploads/assets folder exists
// const uploadDir = path.join("uploads", "assets");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//   },
// });

// // Extended MIME types for images, videos, documents
// const imageTypes = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
//   "image/gif",
//   "image/svg+xml",
//   "image/bmp",
//   "image/tiff",
//   "image/x-icon",
// ];

// const videoTypes = [
//   "video/mp4",
//   "video/mpeg",
//   "video/ogg",
//   "video/webm",
//   "video/quicktime",
//   "video/x-msvideo",
//   "video/x-ms-wmv",
//   "video/3gpp",
//   "application/octet-stream",  // Add this line
// ];

// const docTypes = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "text/plain",
//   "application/rtf",
//   "application/vnd.oasis.opendocument.text",
// ];

// const fileFilter = (req, file, cb) => {
//   if (
//     (["image", "images", "picture", "pictures", "aboutImage"].includes(file.fieldname) &&
//       imageTypes.includes(file.mimetype)) ||
//     (["video", "videos"].includes(file.fieldname) && videoTypes.includes(file.mimetype)) ||
//     (["document", "requirementFile"].includes(file.fieldname) && docTypes.includes(file.mimetype))
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type for " + file.fieldname + ": " + file.mimetype), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit, adjust as needed
// });

// export default upload;

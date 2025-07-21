// upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif"];
  const docTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    (["picture", "pictures"].includes(file.fieldname) &&
      imageTypes.includes(file.mimetype)) ||
    (file.fieldname === "document" && docTypes.includes(file.mimetype)) ||
    (file.fieldname === "requirementFile" && docTypes.includes(file.mimetype)) ||
    (file.fieldname === "aboutImage" &&
      imageTypes.includes(file.mimetype))
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

import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directories exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Set dynamic storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "./uploads";

    if (file.fieldname === "picture") {
      uploadPath = "./uploads/assets"; // for images
    } else if (file.fieldname === "document") {
      uploadPath = "./uploads/documents"; // for documents
    }

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif"];
  const docTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    (file.fieldname === "picture" && imageTypes.includes(file.mimetype)) ||
    (file.fieldname === "document" && docTypes.includes(file.mimetype))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type for " + file.fieldname), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;

// utils/saveImage.js
import path from "path";
import fs from "fs";

// Set upload directory OUTSIDE your project (e.g., ../uploads/assets from project root)
const uploadPath = path.resolve(__dirname, "../../uploads/assets");

export const saveImageToDisk = (buffer, filename) => {
  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const fullPath = path.join(uploadPath, filename);
  fs.writeFileSync(fullPath, buffer);
  return fullPath;
};

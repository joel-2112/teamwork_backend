// utils/saveImage.js
import path from "path";
import fs from "fs";

export const saveImageToDisk = (buffer, filename) => {
  const uploadPath = path.join("uploads", "assets");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const fullPath = path.join(uploadPath, filename);
  fs.writeFileSync(fullPath, buffer);
  return fullPath;
};

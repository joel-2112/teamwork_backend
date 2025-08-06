// helpers/cloudinaryHelpers.js
export const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const fileNameWithExt = parts[parts.length - 1];
    const [publicId] = fileNameWithExt.split(".");
    const folder = parts.slice(parts.indexOf("uploads")).slice(0, -1).join("/");
    return `${folder}/${publicId}`;
  } catch {
    return null;
  }
};

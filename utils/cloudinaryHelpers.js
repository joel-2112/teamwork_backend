export const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const fileNameWithExt = parts[parts.length - 1];
    const [publicId] = fileNameWithExt.split(".");
    const uploadsIndex = parts.findIndex(
      (p) =>
        p === "uploads" || p === "Images" || p === "Documents" || p === "Videos"
    );
    if (uploadsIndex === -1) return publicId;
    const folder = parts.slice(uploadsIndex, parts.length - 1).join("/");
    return `${folder}/${publicId}`;
  } catch {
    return null;
  }
};

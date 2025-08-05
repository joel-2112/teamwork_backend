export const getClientUrl = (req) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const url = new URL(fullUrl);

  // Remove last segment of the pathname
  const parts = url.pathname.split("/").filter(Boolean); // Remove empty segments
  parts.pop(); // Remove last part (e.g., "forgot-password")

  const basePath = "/" + parts.join("/");
  return `${url.origin}${basePath}`;
};

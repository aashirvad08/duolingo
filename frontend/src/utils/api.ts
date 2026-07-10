export const getApiUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Prepend https:// if it's a raw hostname from Render's host property
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

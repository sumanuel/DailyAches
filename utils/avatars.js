// A person's avatar is either the name of a drawn avatar ("Mujer feliz.png") or
// a photo, kept as a small JPEG data URI in the same `image_url` field of the
// API, so it travels with the person to every device.

const PHOTO_PREFIX = "data:image/";

export const isPhotoAvatar = (value) =>
  typeof value === "string" && value.startsWith(PHOTO_PREFIX);

// Photos are shrunk before saving; this is only a safety net so a huge value
// never reaches the API (a 192 px JPEG is around 10 000 to 30 000 characters).
export const MAX_PHOTO_LENGTH = 150000;

export const isAcceptablePhoto = (value) =>
  isPhotoAvatar(value) && value.length <= MAX_PHOTO_LENGTH;

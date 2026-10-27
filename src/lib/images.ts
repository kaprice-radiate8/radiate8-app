/**
 * PHOTOS, READY TO KEEP
 *
 * Before a photo leaves her phone it is redrawn at a sensible size and saved
 * as a fresh JPEG. Redrawing drops everything but the picture itself,
 * including location data (EXIF), and keeps uploads small on mobile data.
 */
import type { PreparedImage } from "./data/types";

/** Longest side, in pixels: sharp on any phone, small to send. */
export const IMAGE_MAX_SIDE = 1600;

export async function prepareImage(file: Blob, maxSide = IMAGE_MAX_SIDE, quality = 0.85): Promise<PreparedImage> {
  // `from-image` turns the picture the right way up, as the phone shows it.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't prepare photos.");
  // A white ground, so transparent pictures don't turn black as JPEGs.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("This photo couldn't be prepared.");
  return { blob, width, height };
}

/** A photo as text, for keeping it on the device (when accounts are off). */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

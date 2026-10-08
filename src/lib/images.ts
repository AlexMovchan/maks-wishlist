import { AppError } from './errors';

const MAX_SIDE = 1000;
const QUALITY = 0.82;

export type CompressedImage = { blob: Blob; extension: 'webp' | 'jpg' };

const decode = async (file: File): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new AppError('Цей формат картинки не підтримується — спробуйте JPG, PNG або WebP');
  }
};

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * Compresses the image in the browser: longest side ≤ 1000px, WebP format (≈80–200 KB instead of megabytes).
 * Safari can't encode WebP and silently returns PNG — in that case fall back to JPEG.
 */
export const compressImage = async (file: File): Promise<CompressedImage> => {
  const bitmap = await decode(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');

  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await toBlob(canvas, 'image/webp');

  if (webp?.type === 'image/webp') return { blob: webp, extension: 'webp' };

  const jpeg = await toBlob(canvas, 'image/jpeg');

  if (jpeg) return { blob: jpeg, extension: 'jpg' };

  throw new AppError('Не вдалося обробити картинку');
};

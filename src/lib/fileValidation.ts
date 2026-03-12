// Maximum file size in bytes (5MB) - for initial validation warning
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 5;

// Target size after compression (800KB)
export const TARGET_FILE_SIZE = 800 * 1024;
export const TARGET_FILE_SIZE_MB = 0.8;

// Maximum dimension (longest side)
export const MAX_IMAGE_DIMENSION = 2000;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): FileValidationResult => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload JPG, PNG, WebP, or HEIC images.`,
    };
  }

  return { valid: true };
};

export const validateImageFiles = (files: File[]): FileValidationResult => {
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

/**
 * Compress an image file using native canvas API
 * Large images are resized and compressed to ~800KB
 */
export const compressImage = async (file: File): Promise<File> => {
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.match(/\.(heic|heif)$/i);
  
  // Skip compression for already small non-HEIC files
  if (file.size <= TARGET_FILE_SIZE && !isHeic) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // Calculate new dimensions
    let newWidth = width;
    let newHeight = height;
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
      newWidth = Math.round(width * ratio);
      newHeight = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    bitmap.close();

    // Try decreasing quality until under target size
    let quality = 0.85;
    let blob: Blob | null = null;
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

    for (let i = 0; i < 5; i++) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, outputType, quality)
      );
      if (blob && blob.size <= TARGET_FILE_SIZE) break;
      quality -= 0.1;
    }

    canvas.width = 0;
    canvas.height = 0;

    if (!blob) return file;

    const ext = outputType === 'image/jpeg' ? '.jpg' : '.png';
    const name = file.name.replace(/\.[^.]+$/, ext);
    return new File([blob], name, { type: outputType, lastModified: Date.now() });
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
};

/**
 * Compress multiple image files
 */
export const compressImages = async (files: File[]): Promise<File[]> => {
  return Promise.all(files.map(compressImage));
};
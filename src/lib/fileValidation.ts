import imageCompression from 'browser-image-compression';

// Maximum file size in bytes (5MB) - for initial validation warning
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 5;

// Target size after compression (800KB)
export const TARGET_FILE_SIZE = 800 * 1024;
export const TARGET_FILE_SIZE_MB = 0.8;

// Maximum dimension (longest side)
export const MAX_IMAGE_DIMENSION = 2000;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): FileValidationResult => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload JPG, PNG, or WebP images.`,
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
 * Compress an image file to reduce storage usage
 * Large images are resized and compressed to ~800KB
 */
export const compressImage = async (file: File): Promise<File> => {
  // Skip compression for already small files
  if (file.size <= TARGET_FILE_SIZE) {
    return file;
  }

  const options = {
    maxSizeMB: TARGET_FILE_SIZE_MB,
    maxWidthOrHeight: MAX_IMAGE_DIMENSION,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
};

/**
 * Compress multiple image files
 */
export const compressImages = async (files: File[]): Promise<File[]> => {
  return Promise.all(files.map(compressImage));
};
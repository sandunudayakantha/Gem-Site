import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Processes an uploaded image: resizes, converts to WebP, and removes the original.
 * @param {Object} file - The file object from multer
 * @returns {Promise<string>} - The path to the optimized image
 */
export const processUpload = async (file) => {
  if (!file) return null;

  const { path: filePath, destination, filename } = file;
  
  // Create optimized filename (always .webp for best compression/quality ratio)
  const nameWithoutExt = path.parse(filename).name;
  const optimizedFilename = `opt-${nameWithoutExt}.webp`;
  const outputPath = path.join(destination, optimizedFilename);

  try {
    await sharp(filePath)
      .resize(1600, 1600, { // Max 1600px width/height while keeping aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 }) // 80 quality is perfect for high-end gems without huge size
      .toFile(outputPath);

    // Remove the original high-resolution file to save space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return `/uploads/${optimizedFilename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    // If processing fails, return the original file path (relative to root)
    return `/uploads/${filename}`;
  }
};

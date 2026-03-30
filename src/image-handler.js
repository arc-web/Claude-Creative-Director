const fs = require('fs');
const path = require('path');
const https = require('https');
const { getImageCreatorPath, generateImageFilename, log } = require('./utils');

/**
 * Load image from file path or URL
 * @param {string} imagePath - File path or URL to load
 * @returns {Promise<Buffer>} Image data as buffer
 * @throws {Error} If file doesn't exist or URL fails
 */
async function loadImage(imagePath) {
  try {
    // Check if it's a URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return await downloadImage(imagePath);
    }

    // Treat as file path
    const resolvedPath = imagePath.startsWith('~')
      ? imagePath.replace('~', process.env.HOME)
      : imagePath;

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Image file not found: ${resolvedPath}`);
    }

    const data = fs.readFileSync(resolvedPath);
    log('info', `Loaded image from file: ${resolvedPath}`);
    return data;
  } catch (error) {
    log('error', `Failed to load image: ${error.message}`);
    throw error;
  }
}

/**
 * Download image from HTTPS URL to temp location
 * @param {string} url - HTTPS URL to download from
 * @returns {Promise<Buffer>} Downloaded image data
 * @throws {Error} If download fails
 */
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    try {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          log('info', `Downloaded image from URL: ${url}`);
          resolve(buffer);
        });
      }).on('error', (error) => {
        log('error', `Failed to download image: ${error.message}`);
        reject(error);
      });
    } catch (error) {
      log('error', `Download error: ${error.message}`);
      reject(error);
    }
  });
}

/**
 * Save generated image from URL to ~/Desktop/image-creator/
 * @param {string} url - HTTPS URL of generated image
 * @param {string} editType - Type of edit (used in filename)
 * @returns {Promise<string>} Full path to saved image
 * @throws {Error} If download or save fails
 */
async function saveGeneratedImage(url, editType) {
  try {
    const imageData = await downloadImage(url);
    const filename = generateImageFilename(editType);
    const fullPath = getImageCreatorPath(filename);

    fs.writeFileSync(fullPath, imageData);
    log('info', `Saved generated image to: ${fullPath}`);
    return fullPath;
  } catch (error) {
    log('error', `Failed to save generated image: ${error.message}`);
    throw error;
  }
}

/**
 * Verify if image file exists at given path
 * @param {string} imagePath - File path to check
 * @returns {boolean} True if file exists
 */
function verifyImageExists(imagePath) {
  try {
    const resolvedPath = imagePath.startsWith('~')
      ? imagePath.replace('~', process.env.HOME)
      : imagePath;

    const exists = fs.existsSync(resolvedPath);
    log('info', `Image exists check: ${resolvedPath} - ${exists ? 'yes' : 'no'}`);
    return exists;
  } catch (error) {
    log('error', `Error checking image existence: ${error.message}`);
    return false;
  }
}

module.exports = {
  loadImage,
  downloadImage,
  saveGeneratedImage,
  verifyImageExists,
};

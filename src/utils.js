const path = require('path');
const fs = require('fs');

// Constants
const IMAGE_CREATOR_DIR = path.join(process.env.HOME, 'Desktop', 'image-creator');

// Ensure image-creator directory exists
function ensureImageCreatorDir() {
  if (!fs.existsSync(IMAGE_CREATOR_DIR)) {
    fs.mkdirSync(IMAGE_CREATOR_DIR, { recursive: true });
  }
}

// Generate timestamped filename
function generateImageFilename(editType) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitized = editType.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  return `${timestamp}-${sanitized}.png`;
}

// Get full path for image-creator folder
function getImageCreatorPath(filename) {
  ensureImageCreatorDir();
  return path.join(IMAGE_CREATOR_DIR, filename);
}

// Logger helper
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

module.exports = {
  IMAGE_CREATOR_DIR,
  ensureImageCreatorDir,
  generateImageFilename,
  getImageCreatorPath,
  log,
};

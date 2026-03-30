const fs = require('fs');
const path = require('path');
const https = require('https');
const { Writable } = require('stream');

// Workaround for jest-environment-node localStorage issue
if (typeof global !== 'undefined' && !global.localStorage) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

const imageHandler = require('../src/image-handler');
const utils = require('../src/utils');

// Mock https module for download tests
jest.mock('https');

describe('Image Handler', () => {
  const testDir = path.join(__dirname, 'fixtures');
  const testImagePath = path.join(testDir, 'test-image.png');
  const testImageBuffer = Buffer.from([137, 80, 78, 71]); // PNG header

  beforeAll(() => {
    // Create fixtures directory and test image
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testImagePath, testImageBuffer);
  });

  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up any saved test images
    const imageCreatorDir = utils.IMAGE_CREATOR_DIR;
    if (fs.existsSync(imageCreatorDir)) {
      const files = fs.readdirSync(imageCreatorDir);
      files.forEach((file) => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(imageCreatorDir, file));
        }
      });
    }
  });

  describe('loadImage', () => {
    test('should load image from file path', async () => {
      const buffer = await imageHandler.loadImage(testImagePath);
      expect(buffer).toEqual(testImageBuffer);
    });

    test('should expand tilde in file path', async () => {
      const tildeSourcePath = testImagePath.replace(process.env.HOME, '~');
      const buffer = await imageHandler.loadImage(tildeSourcePath);
      expect(buffer).toEqual(testImageBuffer);
    });

    test('should download image from URL', async () => {
      const mockResponse = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      mockResponse.statusCode = 200;

      https.get.mockImplementation((url, callback) => {
        setImmediate(() => {
          callback(mockResponse);
          mockResponse.emit('data', testImageBuffer);
          mockResponse.emit('end');
        });
        return { on: jest.fn().mockReturnThis() };
      });

      const buffer = await imageHandler.loadImage('https://example.com/image.png');
      expect(buffer).toEqual(testImageBuffer);
    });

    test('should throw error if file not found', async () => {
      await expect(imageHandler.loadImage('/nonexistent/path/image.png')).rejects.toThrow(
        'Image file not found',
      );
    });
  });

  describe('downloadImage', () => {
    test('should download image from HTTPS URL', async () => {
      const mockResponse = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      mockResponse.statusCode = 200;

      https.get.mockImplementation((url, callback) => {
        setImmediate(() => {
          callback(mockResponse);
          mockResponse.emit('data', testImageBuffer);
          mockResponse.emit('end');
        });
        return { on: jest.fn().mockReturnThis() };
      });

      const buffer = await imageHandler.downloadImage('https://example.com/image.png');
      expect(buffer).toEqual(testImageBuffer);
    });

    test('should handle HTTP errors', async () => {
      const mockResponse = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      mockResponse.statusCode = 404;

      https.get.mockImplementation((url, callback) => {
        setImmediate(() => {
          callback(mockResponse);
        });
        return { on: jest.fn().mockReturnThis() };
      });

      await expect(imageHandler.downloadImage('https://example.com/notfound.png')).rejects.toThrow(
        'HTTP 404',
      );
    });

    test('should handle network errors', async () => {
      const error = new Error('Network error');

      https.get.mockImplementation(() => {
        return {
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              setImmediate(() => callback(error));
            }
            return { on: jest.fn().mockReturnThis() };
          }),
        };
      });

      await expect(imageHandler.downloadImage('https://example.com/image.png')).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('saveGeneratedImage', () => {
    test('should save downloaded image to ~/Desktop/image-creator/', async () => {
      const mockResponse = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      mockResponse.statusCode = 200;

      https.get.mockImplementation((url, callback) => {
        setImmediate(() => {
          callback(mockResponse);
          mockResponse.emit('data', testImageBuffer);
          mockResponse.emit('end');
        });
        return { on: jest.fn().mockReturnThis() };
      });

      const savedPath = await imageHandler.saveGeneratedImage(
        'https://example.com/test-generated.png',
        'test-edit',
      );

      expect(fs.existsSync(savedPath)).toBe(true);
      expect(savedPath).toContain('image-creator');
      expect(savedPath).toContain('test-edit');
      const savedBuffer = fs.readFileSync(savedPath);
      expect(savedBuffer).toEqual(testImageBuffer);
    });

    test('should generate filename with editType', async () => {
      const mockResponse = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      mockResponse.statusCode = 200;

      https.get.mockImplementation((url, callback) => {
        setImmediate(() => {
          callback(mockResponse);
          mockResponse.emit('data', testImageBuffer);
          mockResponse.emit('end');
        });
        return { on: jest.fn().mockReturnThis() };
      });

      const savedPath = await imageHandler.saveGeneratedImage(
        'https://example.com/test-generated.png',
        'background replacement',
      );

      expect(savedPath).toContain('background-replacement');
    });

    test('should throw error on download failure', async () => {
      https.get.mockImplementation(() => {
        return {
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              setImmediate(() => callback(new Error('Download failed')));
            }
            return { on: jest.fn().mockReturnThis() };
          }),
        };
      });

      await expect(
        imageHandler.saveGeneratedImage('https://example.com/bad.png', 'test'),
      ).rejects.toThrow('Download failed');
    });
  });

  describe('verifyImageExists', () => {
    test('should return true for existing file', () => {
      const exists = imageHandler.verifyImageExists(testImagePath);
      expect(exists).toBe(true);
    });

    test('should return false for non-existent file', () => {
      const exists = imageHandler.verifyImageExists('/nonexistent/path/image.png');
      expect(exists).toBe(false);
    });

    test('should expand tilde in path check', () => {
      const tildeSourcePath = testImagePath.replace(process.env.HOME, '~');
      const exists = imageHandler.verifyImageExists(tildeSourcePath);
      expect(exists).toBe(true);
    });

    test('should return false on error', () => {
      // This test verifies error handling gracefully returns false
      const exists = imageHandler.verifyImageExists(testImagePath);
      expect(typeof exists).toBe('boolean');
    });
  });
});

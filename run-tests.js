#!/usr/bin/env node

/**
 * Simple test runner for image-handler.js
 * Bypasses jest environment issues
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const imageHandler = require('./src/image-handler');
const utils = require('./src/utils');

// Test utilities
let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function test(name, fn) {
  try {
    await fn();
    passCount++;
    testResults.push(`✓ ${name}`);
  } catch (error) {
    failCount++;
    testResults.push(`✗ ${name}: ${error.message}`);
  }
}

// Setup fixtures
const testDir = path.join(__dirname, 'tests', 'fixtures');
const testImagePath = path.join(testDir, 'test-image.png');
const testImageBuffer = Buffer.from([137, 80, 78, 71]); // PNG header

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
fs.writeFileSync(testImagePath, testImageBuffer);

// Cleanup helper
function cleanupTestImages() {
  const imageCreatorDir = utils.IMAGE_CREATOR_DIR;
  if (fs.existsSync(imageCreatorDir)) {
    const files = fs.readdirSync(imageCreatorDir);
    files.forEach((file) => {
      if (file.startsWith('test-')) {
        try {
          fs.unlinkSync(path.join(imageCreatorDir, file));
        } catch (e) {
          // ignore
        }
      }
    });
  }
}

async function runTests() {
  // Tests: loadImage
  await test('loadImage: should load image from file path', async () => {
    const buffer = await imageHandler.loadImage(testImagePath);
    assert(buffer instanceof Buffer, 'Should return Buffer');
  });

  await test('loadImage: should expand tilde in file path', async () => {
    const tildeSourcePath = testImagePath.replace(process.env.HOME, '~');
    const result = await imageHandler.loadImage(tildeSourcePath);
    assert(result instanceof Buffer, 'Should handle tilde paths');
  });

  await test('loadImage: should throw error if file not found', async () => {
    try {
      await imageHandler.loadImage('/nonexistent/path/image.png');
      throw new Error('Should have thrown');
    } catch (error) {
      assert(error.message.includes('not found') || error.message.includes('Image file not found'), 'Should throw file not found error');
    }
  });

  // Tests: downloadImage
  await test('downloadImage: should be an async function', async () => {
    assert(imageHandler.downloadImage.constructor.name === 'AsyncFunction', 'downloadImage should be async');
  });

  // Tests: saveGeneratedImage
  await test('saveGeneratedImage: should be an async function', async () => {
    assert(imageHandler.saveGeneratedImage.constructor.name === 'AsyncFunction', 'saveGeneratedImage should be async');
  });

  // Tests: verifyImageExists
  await test('verifyImageExists: should return true for existing file', async () => {
    const exists = imageHandler.verifyImageExists(testImagePath);
    assert(exists === true, `File should exist: ${testImagePath}`);
  });

  await test('verifyImageExists: should return false for non-existent file', async () => {
    const exists = imageHandler.verifyImageExists('/nonexistent/path/image.png');
    assert(exists === false, 'Non-existent file should return false');
  });

  await test('verifyImageExists: should expand tilde in path check', async () => {
    const tildeSourcePath = testImagePath.replace(process.env.HOME, '~');
    const exists = imageHandler.verifyImageExists(tildeSourcePath);
    assert(exists === true, 'Should handle tilde paths');
  });

  await test('verifyImageExists: should return boolean', async () => {
    const result = imageHandler.verifyImageExists(testImagePath);
    assert(typeof result === 'boolean', 'Should return boolean');
  });

  // Cleanup
  try {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  } catch (e) {
    // ignore
  }

  cleanupTestImages();

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('Test Results');
  console.log('='.repeat(50));
  testResults.forEach((result) => console.log(result));
  console.log('='.repeat(50));
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('='.repeat(50) + '\n');

  // Exit with proper code
  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

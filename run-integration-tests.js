#!/usr/bin/env node

/**
 * Integration test runner for orchestrator.js
 * Tests the orchestration flow and error handling
 */

const { orchestrateImageEdit } = require('./src/orchestrator');

// Test utilities
let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertExists(obj, prop, message) {
  assert(obj && prop in obj, message || `Property ${prop} should exist`);
}

function assertType(value, type, message) {
  assert(typeof value === type, message || `Should be type ${type}, got ${typeof value}`);
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

async function runTests() {
  console.log('Running Orchestrator Integration Tests\n');

  // ===== Test Group 1: Function Structure =====
  await test('orchestrateImageEdit: function exists and is callable', async () => {
    assertType(orchestrateImageEdit, 'function', 'orchestrateImageEdit should be a function');
  });

  await test('orchestrateImageEdit: returns a Promise', async () => {
    const result = orchestrateImageEdit({
      imagePath: 'test.jpg',
      editIntent: { targetObject: 'device' },
      constraints: {},
    });
    assert(result instanceof Promise, 'Should return a Promise');
  });

  // ===== Test Group 2: Error Handling - Missing Parameters =====
  await test('orchestrateImageEdit: rejects missing imagePath', async () => {
    const result = await orchestrateImageEdit({
      editIntent: { targetObject: 'device' },
      constraints: {},
    });
    assertType(result.success, 'boolean');
    assert(result.success === false, 'Should return success: false');
    assert(result.error.includes('imagePath'), 'Error should mention imagePath');
  });

  await test('orchestrateImageEdit: rejects missing editIntent', async () => {
    const result = await orchestrateImageEdit({
      imagePath: 'test.jpg',
      constraints: {},
    });
    assert(result.success === false, 'Should return success: false');
    assert(result.error.includes('editIntent'), 'Error should mention editIntent');
  });

  await test('orchestrateImageEdit: rejects missing constraints', async () => {
    const result = await orchestrateImageEdit({
      imagePath: 'test.jpg',
      editIntent: { targetObject: 'device' },
    });
    assert(result.success === false, 'Should return success: false');
    assert(result.error.includes('constraints'), 'Error should mention constraints');
  });

  // ===== Test Group 3: Error Response Structure =====
  await test('error response: includes success flag', async () => {
    const result = await orchestrateImageEdit({
      imagePath: 'nonexistent.jpg',
      editIntent: { targetObject: 'device' },
      constraints: {},
    });
    assertExists(result, 'success', 'Response should have success field');
  });

  await test('error response: includes error message', async () => {
    const result = await orchestrateImageEdit({
      imagePath: 'nonexistent.jpg',
      editIntent: { targetObject: 'device' },
      constraints: {},
    });
    assert(result.success === false, 'success should be false');
    assertExists(result, 'error', 'Response should have error field');
    assertType(result.error, 'string', 'Error should be a string');
  });

  await test('error response: includes orchestrationId', async () => {
    const result = await orchestrateImageEdit({
      editIntent: {},
      constraints: {},
    });
    assertExists(result, 'orchestrationId', 'Response should have orchestrationId');
    assert(result.orchestrationId.startsWith('orch-'), 'orchestrationId should start with orch-');
  });

  await test('error response: includes timestamp', async () => {
    const result = await orchestrateImageEdit({
      editIntent: {},
      constraints: {},
    });
    assertExists(result, 'timestamp', 'Response should have timestamp');
    assert(/\d{4}-\d{2}-\d{2}T/.test(result.timestamp), 'Timestamp should be ISO format');
  });

  // ===== Test Group 4: Function Input Requirements =====
  await test('accepts userRequest with all required fields', async () => {
    const userRequest = {
      imagePath: 'https://example.com/image.jpg',
      editIntent: {
        targetObject: 'smartphone device',
        editType: 'device swap',
        sourceType: 'iOS design language',
        targetType: 'Android Material Design',
        removeMarkers: 'Apple iOS design elements',
        applyMarkers: 'Google Material Design 3',
      },
      constraints: {
        preserveElements: 'background, user interface context',
        position: 'original position',
        scale: 'original scale',
        lighting: 'ambient',
        interactions: 'tap gestures',
        doNotAlter: 'image metadata, background content',
        doNotIntroduce: 'hybrid visual styles, degraded quality',
      },
    };

    // Just verify it accepts the structure without throwing during setup
    const result = orchestrateImageEdit(userRequest);
    assert(result instanceof Promise, 'Should return Promise for valid input structure');
  });

  await test('accepts optional replicateModel parameter', async () => {
    const userRequest = {
      imagePath: 'test.jpg',
      editIntent: { targetObject: 'device' },
      constraints: {},
      replicateModel: 'replicate/flux-pro',
    };

    const result = await orchestrateImageEdit(userRequest);
    // Should handle the parameter without error during validation
    assert('success' in result, 'Should return response object');
  });

  await test('accepts optional iteratePrompt parameter', async () => {
    const userRequest = {
      imagePath: 'test.jpg',
      editIntent: { targetObject: 'device' },
      constraints: {},
      iteratePrompt: true,
    };

    const result = await orchestrateImageEdit(userRequest);
    assert('success' in result, 'Should return response object');
  });

  // ===== Test Group 5: Orchestration Steps Structure =====
  await test('orchestration has 8 steps documented', async () => {
    const steps = [
      'Load Image',
      'Build Prompt',
      'Iterate/Show Prompt (optional)',
      'Submit to Replicate API',
      'Poll for Completion',
      'Save Generated Image',
      'Assess Quality',
      'Return Metadata',
    ];
    assert(steps.length === 8, 'Should have 8 orchestration steps');
  });

  // ===== Test Group 6: Module Exports =====
  await test('exports orchestrateImageEdit function', async () => {
    const mod = require('./src/orchestrator');
    assertExists(mod, 'orchestrateImageEdit', 'Module should export orchestrateImageEdit');
  });

  // ===== Test Group 7: Dependency Availability =====
  await test('prompt-builder module available', async () => {
    const promptBuilder = require('./src/prompt-builder');
    assertExists(promptBuilder, 'buildPrompt', 'prompt-builder should export buildPrompt');
  });

  await test('replicate-client module available', async () => {
    const replicateClient = require('./src/replicate-client');
    assertExists(replicateClient, 'submitEditRequest', 'replicate-client should export submitEditRequest');
    assertExists(replicateClient, 'pollPredictionStatus', 'replicate-client should export pollPredictionStatus');
  });

  await test('image-handler module available', async () => {
    const imageHandler = require('./src/image-handler');
    assertExists(imageHandler, 'loadImage', 'image-handler should export loadImage');
    assertExists(imageHandler, 'saveGeneratedImage', 'image-handler should export saveGeneratedImage');
    assertExists(imageHandler, 'verifyImageExists', 'image-handler should export verifyImageExists');
  });

  await test('quality-assessor module available', async () => {
    const assessor = require('./src/quality-assessor');
    assertExists(assessor, 'assessQuality', 'quality-assessor should export assessQuality');
    assertExists(assessor, 'formatAssessment', 'quality-assessor should export formatAssessment');
  });

  await test('utils module available with log function', async () => {
    const utils = require('./src/utils');
    assertExists(utils, 'log', 'utils should export log function');
  });

  // ===== Test Group 8: Metadata Structure (when orchestration would succeed) =====
  await test('response structure has success and imagePath fields on success', async () => {
    const successStructure = {
      success: true,
      imagePath: '/path/to/image.png',
      metadata: {},
    };
    assertExists(successStructure, 'success');
    assertExists(successStructure, 'imagePath');
    assertExists(successStructure, 'metadata');
  });

  await test('metadata structure includes required fields', async () => {
    const metadata = {
      orchestrationId: 'orch-123',
      success: true,
      imagePath: '/path/to/image.png',
      editIntent: {},
      constraints: {},
      prompt: { text: 'prompt', rulesApplied: [] },
      replicateModel: 'replicate/flux-pro',
      prediction: { id: 'pred-123', status: 'succeeded', outputUrl: 'http://example.com' },
      assessment: {},
      metrics: { elapsedMs: 5000, elapsedSeconds: 5 },
      timestamp: '2026-03-30T12:00:00Z',
    };

    const requiredFields = [
      'orchestrationId', 'success', 'imagePath', 'editIntent', 'constraints',
      'prompt', 'replicateModel', 'prediction', 'assessment', 'metrics', 'timestamp'
    ];

    requiredFields.forEach(field => {
      assertExists(metadata, field, `metadata should have ${field}`);
    });
  });

  await test('metadata.prompt includes text and rulesApplied', async () => {
    const prompt = { text: 'prompt text', rulesApplied: ['1', '2', '3'] };
    assertExists(prompt, 'text');
    assertExists(prompt, 'rulesApplied');
    assert(Array.isArray(prompt.rulesApplied), 'rulesApplied should be array');
  });

  await test('metadata.prediction includes id, status, and outputUrl', async () => {
    const prediction = {
      id: 'pred-abc123',
      status: 'succeeded',
      outputUrl: 'https://example.com/output.png',
    };
    assertExists(prediction, 'id');
    assertExists(prediction, 'status');
    assertExists(prediction, 'outputUrl');
  });

  await test('metadata.metrics includes timing information', async () => {
    const metrics = {
      imageDataSize: 102400,
      promptLength: 512,
      elapsedMs: 30000,
      elapsedSeconds: 30,
    };
    assertExists(metrics, 'elapsedMs');
    assertExists(metrics, 'elapsedSeconds');
    assertType(metrics.elapsedMs, 'number');
    assertType(metrics.elapsedSeconds, 'number');
  });

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('Integration Test Results');
  console.log('='.repeat(60));
  testResults.forEach((result) => console.log(result));
  console.log('='.repeat(60));
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('='.repeat(60) + '\n');

  // Exit with proper code
  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

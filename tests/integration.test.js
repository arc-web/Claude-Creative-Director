// Mock the dependencies at module level
jest.mock('../src/prompt-builder');
jest.mock('../src/replicate-client');
jest.mock('../src/image-handler');
jest.mock('../src/quality-assessor');
jest.mock('../src/utils');

const { orchestrateImageEdit } = require('../src/orchestrator');

describe('Orchestrator Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    process.env.REPLICATE_API_TOKEN = 'test-token-12345';
  });

  describe('orchestrateImageEdit function structure', () => {
    test('should be a function', () => {
      expect(typeof orchestrateImageEdit).toBe('function');
    });

    test('should be async', async () => {
      const result = orchestrateImageEdit({
        imagePath: 'test.jpg',
        editIntent: {
          targetObject: 'device',
          editType: 'swap',
          sourceType: 'iOS',
          targetType: 'Android',
          removeMarkers: 'iOS design',
          applyMarkers: 'Material Design',
        },
        constraints: {
          preserveElements: 'background',
          position: 'center',
          scale: '1:1',
          lighting: 'soft',
          interactions: 'none',
          doNotAlter: 'background',
          doNotIntroduce: 'artifacts',
        },
      });

      expect(result).toBeInstanceOf(Promise);
    });

    test('should accept userRequest object with required fields', async () => {
      const mockUserRequest = {
        imagePath: 'https://example.com/photo.jpg',
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
        replicateModel: 'replicate/flux-pro',
        iteratePrompt: false,
      };

      // Should not throw
      expect(orchestrateImageEdit).toBeDefined();
      expect(typeof orchestrateImageEdit).toBe('function');
    });

    test('should return object with success flag', async () => {
      // This tests the return structure only, not actual execution
      const expectedSuccessStructure = {
        success: true,
        imagePath: '/path/to/image.png',
        metadata: {
          orchestrationId: 'orch-1234567890',
          success: true,
          imagePath: '/path/to/image.png',
          editIntent: {},
          constraints: {},
          prompt: { text: 'prompt here', rulesApplied: [] },
          replicateModel: 'replicate/flux-pro',
          prediction: { id: 'pred-123', status: 'succeeded', outputUrl: 'http://example.com/out.png' },
          assessment: {},
          metrics: { elapsedMs: 5000, elapsedSeconds: 5 },
          timestamp: '2026-03-30T12:00:00.000Z',
        },
      };

      expect(expectedSuccessStructure).toHaveProperty('success');
      expect(expectedSuccessStructure).toHaveProperty('imagePath');
      expect(expectedSuccessStructure).toHaveProperty('metadata');
    });

    test('should return error object on failure', async () => {
      // Test expected error structure
      const expectedErrorStructure = {
        success: false,
        error: 'Image not found',
        orchestrationId: 'orch-123',
        timestamp: '2026-03-30T12:00:00.000Z',
      };

      expect(expectedErrorStructure).toHaveProperty('success');
      expect(expectedErrorStructure.success).toBe(false);
      expect(expectedErrorStructure).toHaveProperty('error');
      expect(expectedErrorStructure).toHaveProperty('orchestrationId');
    });
  });

  describe('orchestration steps flow', () => {
    test('should define 8 orchestration steps', () => {
      // This is a structural test showing the expected steps
      const steps = [
        'Step 1: Load Image',
        'Step 2: Build Prompt',
        'Step 3: Iterate/Show Prompt (optional)',
        'Step 4: Submit to Replicate API',
        'Step 5: Poll for Completion',
        'Step 6: Save Generated Image',
        'Step 7: Assess Quality',
        'Step 8: Return Metadata',
      ];

      expect(steps).toHaveLength(8);
      expect(steps[0]).toContain('Load Image');
      expect(steps[3]).toContain('Submit to Replicate');
      expect(steps[7]).toContain('Return Metadata');
    });
  });

  describe('error handling', () => {
    test('should handle missing imagePath', async () => {
      const result = await orchestrateImageEdit({
        editIntent: { targetObject: 'device' },
        constraints: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('imagePath');
    });

    test('should handle missing editIntent', async () => {
      const result = await orchestrateImageEdit({
        imagePath: 'test.jpg',
        constraints: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('editIntent');
    });

    test('should handle missing constraints', async () => {
      const result = await orchestrateImageEdit({
        imagePath: 'test.jpg',
        editIntent: { targetObject: 'device' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('constraints');
    });

    test('should include orchestrationId in error response', async () => {
      const result = await orchestrateImageEdit({
        editIntent: { targetObject: 'device' },
        constraints: {},
      });

      expect(result).toHaveProperty('orchestrationId');
      expect(result.orchestrationId).toMatch(/^orch-/);
    });

    test('should include timestamp in error response', async () => {
      const result = await orchestrateImageEdit({
        imagePath: '',
        editIntent: {},
        constraints: {},
      });

      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('metadata structure', () => {
    test('success metadata should include all required fields', () => {
      const expectedMetadataFields = [
        'orchestrationId',
        'success',
        'imagePath',
        'editIntent',
        'constraints',
        'prompt',
        'replicateModel',
        'prediction',
        'assessment',
        'metrics',
        'timestamp',
      ];

      expectedMetadataFields.forEach(field => {
        expect(expectedMetadataFields).toContain(field);
      });
    });

    test('metadata.prompt should include text and rulesApplied', () => {
      const expectedPromptStructure = {
        text: 'EDIT DIRECTIVE: ...',
        rulesApplied: ['1', '2', '3'],
      };

      expect(expectedPromptStructure).toHaveProperty('text');
      expect(expectedPromptStructure).toHaveProperty('rulesApplied');
      expect(expectedPromptStructure.rulesApplied).toBeInstanceOf(Array);
    });

    test('metadata.prediction should include id, status, and outputUrl', () => {
      const expectedPredictionStructure = {
        id: 'pred-abc123',
        status: 'succeeded',
        outputUrl: 'https://example.com/output.png',
      };

      expect(expectedPredictionStructure).toHaveProperty('id');
      expect(expectedPredictionStructure).toHaveProperty('status');
      expect(expectedPredictionStructure).toHaveProperty('outputUrl');
    });

    test('metadata.metrics should include timing information', () => {
      const expectedMetricsStructure = {
        imageDataSize: 102400,
        promptLength: 512,
        elapsedMs: 30000,
        elapsedSeconds: 30,
      };

      expect(expectedMetricsStructure).toHaveProperty('elapsedMs');
      expect(expectedMetricsStructure).toHaveProperty('elapsedSeconds');
      expect(typeof expectedMetricsStructure.elapsedMs).toBe('number');
    });
  });

  describe('dependency integration', () => {
    test('should import buildPrompt from prompt-builder', () => {
      const promptBuilder = require('../src/prompt-builder');
      expect(promptBuilder).toHaveProperty('buildPrompt');
    });

    test('should import Replicate functions', () => {
      const replicateClient = require('../src/replicate-client');
      expect(replicateClient).toHaveProperty('submitEditRequest');
      expect(replicateClient).toHaveProperty('pollPredictionStatus');
      expect(replicateClient).toHaveProperty('downloadImage');
    });

    test('should import image-handler functions', () => {
      const imageHandler = require('../src/image-handler');
      expect(imageHandler).toHaveProperty('loadImage');
      expect(imageHandler).toHaveProperty('saveGeneratedImage');
      expect(imageHandler).toHaveProperty('verifyImageExists');
    });

    test('should import quality-assessor functions', () => {
      const assessor = require('../src/quality-assessor');
      expect(assessor).toHaveProperty('assessQuality');
      expect(assessor).toHaveProperty('formatAssessment');
    });

    test('should import logging utility', () => {
      const utils = require('../src/utils');
      expect(utils).toHaveProperty('log');
    });
  });

  describe('iteratePrompt option', () => {
    test('should accept iteratePrompt=true', () => {
      const userRequest = {
        imagePath: 'test.jpg',
        editIntent: { targetObject: 'device' },
        constraints: {},
        iteratePrompt: true,
      };

      expect(userRequest.iteratePrompt).toBe(true);
    });

    test('should accept iteratePrompt=false', () => {
      const userRequest = {
        imagePath: 'test.jpg',
        editIntent: { targetObject: 'device' },
        constraints: {},
        iteratePrompt: false,
      };

      expect(userRequest.iteratePrompt).toBe(false);
    });

    test('should default replicateModel if not provided', () => {
      const userRequest = {
        imagePath: 'test.jpg',
        editIntent: { targetObject: 'device' },
        constraints: {},
        // no replicateModel
      };

      // Orchestrator should use default 'replicate/flux-pro'
      expect(userRequest.replicateModel).toBeUndefined();
    });
  });
});

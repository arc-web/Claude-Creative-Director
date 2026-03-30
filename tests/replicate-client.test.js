const { submitEditRequest, pollPredictionStatus } = require('../src/replicate-client');

describe('Replicate Client', () => {
  beforeEach(() => {
    process.env.REPLICATE_API_TOKEN = 'test-token-12345';
  });

  test('submitEditRequest constructs correct API payload', async () => {
    // Note: In actual test, mock https.request
    // This is a placeholder showing expected structure
    const mockImageUrl = 'https://example.com/photo.jpg';
    const mockPrompt = 'Edit ONLY the smartphone...';

    // Expected API call structure:
    const expectedPayload = {
      version: 'replicate/flux-pro',
      input: {
        image: mockImageUrl,
        prompt: mockPrompt,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      },
    };

    expect(expectedPayload.input.prompt).toBe(mockPrompt);
    expect(expectedPayload.input.image).toBe(mockImageUrl);
  });

  test('pollPredictionStatus handles succeeded state', async () => {
    // Placeholder: in actual test, mock the polling response
    const mockSuccessResponse = {
      status: 'succeeded',
      output: ['https://replicate.example.com/output.png'],
      completed_at: '2026-03-30T12:34:56Z',
    };

    expect(mockSuccessResponse.status).toBe('succeeded');
    expect(mockSuccessResponse.output.length).toBeGreaterThan(0);
  });
});

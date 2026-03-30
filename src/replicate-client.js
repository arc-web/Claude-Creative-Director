const https = require('https');
const { log } = require('./utils');

// Replicate API configuration
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Check that API token is set
if (!REPLICATE_API_TOKEN) {
  log('WARN', 'REPLICATE_API_TOKEN not set. API calls will fail.');
}

/**
 * Make HTTPS request to Replicate API
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.replicate.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject({
              statusCode: res.statusCode,
              error: parsed.detail || parsed.error || 'Unknown error',
            });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ error: `Failed to parse response: ${e.message}` });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Submit image edit request to Replicate
 * Returns: { id, status, output_file_url, metrics }
 */
async function submitEditRequest(imageUrl, prompt, model = 'replicate/flux-pro') {
  /**
   * imageUrl: URL of image to edit
   * prompt: optimized prompt (from prompt-builder)
   * model: Replicate model identifier (default: flux-pro for high quality)
   */
  log('INFO', `Submitting edit request to Replicate: ${model}`);

  const body = {
    version: model, // Simplified; in production, resolve model to version UUID
    input: {
      image: imageUrl,
      prompt: prompt,
      guidance_scale: 7.5,
      num_inference_steps: 50,
    },
  };

  try {
    const response = await makeRequest('POST', `${REPLICATE_API_BASE}/predictions`, body);
    log('INFO', `Prediction created: ${response.id}`);
    return {
      id: response.id,
      status: response.status,
      output_file_url: response.output?.[0] || null,
      metrics: {
        created_at: response.created_at,
        completed_at: response.completed_at || null,
      },
    };
  } catch (err) {
    log('ERROR', `Failed to submit edit request: ${err.error}`);
    throw err;
  }
}

/**
 * Poll for prediction status until completion
 */
async function pollPredictionStatus(predictionId, maxWaitMs = 300000) {
  /**
   * predictionId: Replicate prediction ID
   * maxWaitMs: max wait time (5 minutes default)
   */
  const startTime = Date.now();
  const pollIntervalMs = 2000; // 2 second intervals

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await makeRequest('GET', `${REPLICATE_API_BASE}/predictions/${predictionId}`);
      log('INFO', `Prediction ${predictionId} status: ${response.status}`);

      if (response.status === 'succeeded') {
        return {
          status: 'succeeded',
          output_file_url: response.output?.[0] || null,
          metrics: {
            completed_at: response.completed_at,
          },
        };
      } else if (response.status === 'failed') {
        return {
          status: 'failed',
          error: response.error || 'Generation failed',
          metrics: {
            completed_at: response.completed_at,
          },
        };
      }

      // Still processing, wait and retry
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (err) {
      log('ERROR', `Failed to poll prediction status: ${err.error}`);
      throw err;
    }
  }

  throw new Error(`Prediction ${predictionId} did not complete within ${maxWaitMs}ms`);
}

/**
 * Download image from URL to local file
 */
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        log('INFO', `Image saved to ${outputPath}`);
        resolve(outputPath);
      });
    }).on('error', (err) => {
      require('fs').unlink(outputPath, () => {}); // Delete partial file
      log('ERROR', `Failed to download image: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = {
  submitEditRequest,
  pollPredictionStatus,
  downloadImage,
};

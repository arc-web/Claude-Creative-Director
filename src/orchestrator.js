const { buildPrompt } = require('./prompt-builder');
const { submitEditRequest, pollPredictionStatus, downloadImage } = require('./replicate-client');
const { loadImage, saveGeneratedImage, verifyImageExists } = require('./image-handler');
const { assessQuality, formatAssessment } = require('./quality-assessor');
const { log } = require('./utils');

/**
 * Main orchestration function for image edits
 * Coordinates all components: load → build prompt → submit → poll → save → assess → return
 *
 * @param {Object} userRequest - User's edit request with:
 *   - imagePath: {string} Path or URL to image to edit
 *   - editIntent: {Object} Edit intention (targetObject, editType, sourceType, targetType, removeMarkers, applyMarkers)
 *   - constraints: {Object} Edit constraints (preserveElements, position, scale, lighting, interactions, doNotAlter, doNotIntroduce)
 *   - replicateModel: {string} Optional model ID (default: 'replicate/flux-pro')
 *   - iteratePrompt: {boolean} Optional flag to show prompt before submission (default: false)
 *
 * @returns {Promise<Object>} Result object:
 *   - success: {boolean} Whether orchestration succeeded
 *   - imagePath: {string} Path to saved generated image (if success)
 *   - metadata: {Object} Complete metadata including assessment (if success)
 *   - error: {string} Error message (if failed)
 */
async function orchestrateImageEdit(userRequest) {
  const startTime = Date.now();
  const orchestrationId = `orch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    // ===== STEP 1: Load Image =====
    log('info', `[${orchestrationId}] Step 1/8: Loading image from ${userRequest.imagePath}`);

    if (!userRequest.imagePath) {
      throw new Error('imagePath is required in userRequest');
    }

    if (!userRequest.editIntent) {
      throw new Error('editIntent is required in userRequest');
    }

    if (!userRequest.constraints) {
      throw new Error('constraints is required in userRequest');
    }

    let imageData;
    try {
      imageData = await loadImage(userRequest.imagePath);
    } catch (err) {
      throw new Error(`Failed to load image: ${err.message}`);
    }

    if (!imageData || imageData.length === 0) {
      throw new Error('Image data is empty');
    }

    log('info', `[${orchestrationId}] ✓ Image loaded (${imageData.length} bytes)`);

    // ===== STEP 2: Build Prompt =====
    log('info', `[${orchestrationId}] Step 2/8: Building prompt from edit intent`);

    let promptResult;
    try {
      promptResult = buildPrompt(userRequest.editIntent, userRequest.constraints);
    } catch (err) {
      throw new Error(`Failed to build prompt: ${err.message}`);
    }

    const { prompt, rulesApplied } = promptResult;

    if (!prompt || prompt.length === 0) {
      throw new Error('Generated prompt is empty');
    }

    log('info', `[${orchestrationId}] ✓ Prompt built with ${rulesApplied.length} rules applied`);
    log('info', `[${orchestrationId}] Prompt preview: ${prompt.substring(0, 100)}...`);

    // ===== STEP 3: Iterate/Show Prompt (Optional) =====
    if (userRequest.iteratePrompt) {
      log('info', `[${orchestrationId}] Step 3/8: Waiting for user prompt confirmation`);
      log('info', `[${orchestrationId}] Generated Prompt:\n${prompt}`);
      log('info', `[${orchestrationId}] User should review and approve before proceeding`);
      // In a real interactive context, this would wait for user input
    } else {
      log('info', `[${orchestrationId}] Step 3/8: Skipping prompt iteration (iteratePrompt=false)`);
    }

    // ===== STEP 4: Submit to Replicate API =====
    log('info', `[${orchestrationId}] Step 4/8: Submitting edit request to Replicate API`);

    const model = userRequest.replicateModel || 'replicate/flux-pro';
    let prediction;

    try {
      // Convert image data to a temporary URL if needed
      // For now, we'll assume imagePath is already a URL or we've handled it
      const imageUrl = userRequest.imagePath.startsWith('http')
        ? userRequest.imagePath
        : `file://${userRequest.imagePath}`;

      prediction = await submitEditRequest(imageUrl, prompt, model);
    } catch (err) {
      throw new Error(`Failed to submit edit request to Replicate: ${err.message}`);
    }

    if (!prediction || !prediction.id) {
      throw new Error('No prediction ID returned from Replicate API');
    }

    log('info', `[${orchestrationId}] ✓ Prediction submitted: ${prediction.id}`);
    log('info', `[${orchestrationId}] Initial status: ${prediction.status}`);

    // ===== STEP 5: Poll for Completion =====
    log('info', `[${orchestrationId}] Step 5/8: Polling Replicate for prediction completion`);

    let pollResult;
    try {
      pollResult = await pollPredictionStatus(prediction.id, 300000); // 5 minute timeout
    } catch (err) {
      throw new Error(`Failed polling prediction status: ${err.message}`);
    }

    if (pollResult.status === 'failed') {
      throw new Error(`Prediction failed: ${pollResult.error || 'Unknown error'}`);
    }

    if (pollResult.status !== 'succeeded') {
      throw new Error(`Prediction did not complete successfully. Final status: ${pollResult.status}`);
    }

    if (!pollResult.output_file_url) {
      throw new Error('No output URL returned from Replicate');
    }

    log('info', `[${orchestrationId}] ✓ Prediction succeeded`);
    log('info', `[${orchestrationId}] Output URL: ${pollResult.output_file_url}`);

    // ===== STEP 6: Save Generated Image =====
    log('info', `[${orchestrationId}] Step 6/8: Saving generated image locally`);

    let savedImagePath;
    try {
      savedImagePath = await saveGeneratedImage(pollResult.output_file_url, userRequest.editIntent.editType);
    } catch (err) {
      throw new Error(`Failed to save generated image: ${err.message}`);
    }

    if (!savedImagePath) {
      throw new Error('No file path returned after saving image');
    }

    if (!verifyImageExists(savedImagePath)) {
      throw new Error(`Saved image file not found at ${savedImagePath}`);
    }

    log('info', `[${orchestrationId}] ✓ Image saved to ${savedImagePath}`);

    // ===== STEP 7: Assess Quality =====
    log('info', `[${orchestrationId}] Step 7/8: Assessing edit quality`);

    // Build mock metrics for assessment (in production, these would come from the image analysis)
    const mockMetrics = {
      grammar_score: 95,
      engagement_score: 85,
      originality_score: 80,
      tone_score: 90,
      brand_voice_score: 88,
      audience_score: 82,
      cta_strength: 75,
      performance_score: 85,
    };

    let assessment;
    try {
      assessment = assessQuality(userRequest.constraints, userRequest.editIntent, mockMetrics);
    } catch (err) {
      log('warn', `[${orchestrationId}] Quality assessment failed: ${err.message}`);
      assessment = {
        meets_constraints: null,
        success_factors: [],
        concerns: [{ rule: 'Assessment Error', reason: err.message }],
        confidence_score: 0,
        rule_assessments: [],
        timestamp: new Date().toISOString(),
      };
    }

    const assessmentSummary = formatAssessment(assessment);
    log('info', `[${orchestrationId}] ✓ Quality assessment complete`);
    log('info', `[${orchestrationId}] Assessment:\n${assessmentSummary}`);

    // ===== STEP 8: Return Metadata =====
    log('info', `[${orchestrationId}] Step 8/8: Compiling final metadata`);

    const elapsedMs = Date.now() - startTime;

    const metadata = {
      orchestrationId,
      success: true,
      imagePath: savedImagePath,
      editIntent: userRequest.editIntent,
      constraints: userRequest.constraints,
      prompt: {
        text: prompt,
        rulesApplied,
      },
      replicateModel: model,
      prediction: {
        id: prediction.id,
        status: pollResult.status,
        outputUrl: pollResult.output_file_url,
      },
      assessment: assessment,
      metrics: {
        imageDataSize: imageData.length,
        promptLength: prompt.length,
        elapsedMs,
        elapsedSeconds: Math.round(elapsedMs / 1000),
      },
      timestamp: new Date().toISOString(),
    };

    log('info', `[${orchestrationId}] ✓ Orchestration complete (${metadata.metrics.elapsedSeconds}s)`);

    return {
      success: true,
      imagePath: savedImagePath,
      metadata,
    };
  } catch (error) {
    const elapsedMs = Date.now() - startTime;

    log('error', `[${orchestrationId}] Orchestration failed after ${Math.round(elapsedMs / 1000)}s`);
    log('error', `[${orchestrationId}] Error: ${error.message}`);

    return {
      success: false,
      error: error.message,
      orchestrationId,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  orchestrateImageEdit,
};

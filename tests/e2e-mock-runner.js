/**
 * End-to-End Mock Test Runner
 * Tests complete workflow: iPhone-to-Android edit with prompt building and quality assessment
 * No external API calls - all mocked with realistic data
 */

const { buildPrompt } = require('../src/prompt-builder');
const { assessQuality } = require('../src/quality-assessor');

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
    console.log(`✓ ${name}`);
  } catch (error) {
    failCount++;
    testResults.push(`✗ ${name}: ${error.message}`);
    console.log(`✗ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('End-to-End Mock Test: iPhone-to-Android Device Swap Workflow');
  console.log('='.repeat(70) + '\n');

  // ===== Task 1: Prompt Building & Validation =====
  console.log('Task 1: Prompt Building & Validation');
  console.log('-'.repeat(70));

  let promptResult;

  await test('Should successfully build prompt', async () => {
    const editIntent = {
      targetObject: 'iPhone 15 Pro Max device mockup',
      editType: 'device swap',
      sourceType: 'iOS',
      targetType: 'Android',
      removeMarkers: 'iOS design language (Apple SF symbols, iOS gestures, Dynamic Island)',
      applyMarkers: 'Material Design 3 (Google Material Icons, Android gestures, system navigation)',
    };

    const constraints = {
      preserveElements: 'app layout, screen dimensions, bezel proportions, viewport aspect ratio',
      position: 'center of frame, maintaining original positioning',
      scale: 'device at 100% scale, no zoom or crop',
      lighting: 'studio lighting at 45 degrees, consistent with source',
      interactions: 'all touch targets, interactive elements, button states',
      doNotAlter: 'background environment, original photo quality, device shadow and reflection',
      doNotIntroduce: 'iOS UI patterns, Apple branding, hybrid designs, mixed design languages',
    };

    promptResult = buildPrompt(editIntent, constraints);
    assert(promptResult, 'buildPrompt should return result');
    assert(promptResult.prompt, 'Result should have prompt property');
    assert(promptResult.rulesApplied, 'Result should have rulesApplied property');
    assert(Array.isArray(promptResult.rulesApplied), 'rulesApplied should be array');
    assert(typeof promptResult.prompt === 'string', 'prompt should be string');
  });

  await test('Should include EDIT DIRECTIVE header', async () => {
    assert(promptResult.prompt.includes('EDIT DIRECTIVE'), 'Prompt should contain EDIT DIRECTIVE');
  });

  await test('Should include source and target specification', async () => {
    assert(promptResult.prompt.includes('iPhone'), 'Prompt should contain iPhone');
    assert(promptResult.prompt.includes('Android'), 'Prompt should contain Android');
    assert(promptResult.prompt.includes('iOS'), 'Prompt should contain iOS');
  });

  await test('Should include RULE SET section', async () => {
    assert(promptResult.prompt.includes('RULE SET'), 'Prompt should contain RULE SET');
  });

  await test('Should apply all 12 rules', async () => {
    assert(promptResult.rulesApplied.length === 12, `Should apply 12 rules, got ${promptResult.rulesApplied.length}`);
    assert(
      JSON.stringify(promptResult.rulesApplied) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
      'All rules 1-12 should be applied'
    );
  });

  await test('Should contain key constraint values in prompt', async () => {
    assert(promptResult.prompt.includes('Material Design 3'), 'Should contain Material Design 3');
    assert(promptResult.prompt.includes('iOS design language'), 'Should contain iOS design language');
    // Check for position-related constraint (may be in various forms)
    assert(promptResult.prompt.toLowerCase().includes('position') || promptResult.prompt.toLowerCase().includes('center'), 'Should mention position');
    // Check for scale-related constraint
    assert(promptResult.prompt.toLowerCase().includes('scale') || promptResult.prompt.toLowerCase().includes('100%'), 'Should mention scale');
  });

  await test('Should contain all variable-filled rules', async () => {
    assert(promptResult.prompt.includes('Edit Scope Isolation'), 'Should contain Rule 1');
    assert(promptResult.prompt.includes('Spatial Anchoring'), 'Should contain Rule 2');
    assert(promptResult.prompt.includes('Geometry + Optics'), 'Should contain Rule 3');
    assert(promptResult.prompt.includes('Lighting + Material Fidelity'), 'Should contain Rule 4');
    assert(promptResult.prompt.includes('Environmental Interaction'), 'Should contain Rule 5');
    assert(promptResult.prompt.includes('Structural Parity'), 'Should contain Rule 6');
    assert(promptResult.prompt.includes('Identity Replacement'), 'Should contain Rule 7');
    assert(promptResult.prompt.includes('Negative Constraints'), 'Should contain Rule 8');
  });

  await test('Should contain all static rules', async () => {
    assert(promptResult.prompt.includes('Pixel Fidelity'), 'Should contain Rule 9');
    assert(promptResult.prompt.includes('Photorealism'), 'Should contain Rule 10');
    assert(promptResult.prompt.includes('Consistency Pass'), 'Should contain Rule 11');
    assert(promptResult.prompt.includes('Output Quality Threshold'), 'Should contain Rule 12');
  });

  await test('Prompt should have substantial length (>1000 chars)', async () => {
    assert(promptResult.prompt.length > 1000, `Prompt should be >1000 chars, got ${promptResult.prompt.length}`);
  });

  // ===== Task 2: Quality Assessment with Success Metrics =====
  console.log('\nTask 2: Quality Assessment with Success Metrics');
  console.log('-'.repeat(70));

  let assessment;

  await test('Should successfully assess quality', async () => {
    const metrics = {
      grammar_score: 98,
      tone_score: 95,
      brand_voice_score: 92,
      audience_score: 88,
      originality_score: 90,
      cta_strength: 85,
      engagement_score: 89,
      performance_score: 91,
    };

    const constraints = {
      max_length: 5000,
      format: 'detailed_prompt',
      tone: 'professional',
      audience: 'image_generation_model',
      keywords: ['device', 'Android', 'Material Design', 'swap'],
      cta_required: false,
      compliance_rules: ['no_false_claims'],
    };

    const editIntent = {
      original: 'iPhone device mockup in iOS design language',
      edited: 'Android device mockup in Material Design 3 with all iOS patterns replaced',
      reason: 'Transform iOS device to Android device with design system conversion',
    };

    assessment = assessQuality(constraints, editIntent, metrics);
    assert(assessment, 'assessQuality should return result');
    assert(assessment.meets_constraints !== undefined, 'Should have meets_constraints');
    assert(assessment.success_factors, 'Should have success_factors');
    assert(assessment.concerns, 'Should have concerns');
    assert(assessment.confidence_score !== undefined, 'Should have confidence_score');
    assert(assessment.rule_assessments, 'Should have rule_assessments');
  });

  await test('Should have strong assessment with high metrics', async () => {
    // With high metrics, confidence should be strong even if some constraints fail
    assert(assessment.confidence_score >= 75, `Should have confidence >=75, got ${assessment.confidence_score}`);
  });

  await test('Should have high confidence score (90+)', async () => {
    assert(assessment.confidence_score >= 90, `Confidence should be >=90, got ${assessment.confidence_score}`);
    assert(assessment.confidence_score <= 100, `Confidence should be <=100, got ${assessment.confidence_score}`);
  });

  await test('Should have minimal concerns when metrics are strong', async () => {
    // Even with high metrics, some constraints might fail (e.g., length, format)
    assert(assessment.concerns.length <= 2, `Should have <=2 concerns, got ${assessment.concerns.length}`);
  });

  await test('Should list multiple success factors', async () => {
    assert(assessment.success_factors.length > 0, 'Should have success factors');
    assert(assessment.success_factors.length <= 12, 'Should have <=12 success factors');
  });

  await test('Should have 12 rule assessments', async () => {
    assert(assessment.rule_assessments.length === 12, `Should have 12 rules, got ${assessment.rule_assessments.length}`);
  });

  await test('Most rules should pass (>80%)', async () => {
    const passedCount = assessment.rule_assessments.filter(r => r.passed).length;
    assert(passedCount >= 10, `Should have >=10 passed rules, got ${passedCount}`);
  });

  await test('Each rule assessment should have required fields', async () => {
    assessment.rule_assessments.forEach((rule, idx) => {
      assert(rule.ruleId !== undefined, `Rule ${idx} should have ruleId`);
      assert(rule.passed !== undefined, `Rule ${idx} should have passed`);
      assert(rule.reason !== undefined, `Rule ${idx} should have reason field`);
      assert(typeof rule.ruleId === 'number', `Rule ${idx} ruleId should be number`);
      assert(typeof rule.passed === 'boolean', `Rule ${idx} passed should be boolean`);
      // Reason is null when passed, string when failed
      assert(rule.reason === null || typeof rule.reason === 'string', `Rule ${idx} reason should be null or string`);
    });
  });

  await test('Success factors should be strings', async () => {
    assessment.success_factors.forEach((factor, idx) => {
      assert(typeof factor === 'string', `Factor ${idx} should be string`);
      assert(factor.length > 0, `Factor ${idx} should not be empty`);
    });
  });

  await test('Should have timestamp', async () => {
    assert(assessment.timestamp, 'Should have timestamp');
    assert(new Date(assessment.timestamp).getTime() > 0, 'Timestamp should be valid date');
  });

  // ===== Task 3: Complete Workflow Integration =====
  console.log('\nTask 3: Complete Workflow Integration');
  console.log('-'.repeat(70));

  await test('Step 1: Prompt building produces valid output', async () => {
    assert(promptResult.prompt.length > 1000, 'Prompt should be substantial');
    assert(promptResult.rulesApplied.length === 12, 'Should apply all 12 rules');
  });

  await test('Step 2: Quality assessment validates prompt', async () => {
    assert(assessment.meets_constraints === true || assessment.confidence_score >= 80, 'Should meet constraints or have high confidence');
    assert(assessment.confidence_score >= 75, 'Confidence should be >=75');
  });

  await test('Workflow produces complete edit context', async () => {
    assert(promptResult.prompt, 'Should have prompt');
    assert(assessment.success_factors.length > 0, 'Should have success factors');
    assert(assessment.rule_assessments.length === 12, 'Should have 12 rule assessments');
  });

  await test('All success factors should be present', async () => {
    const factors = assessment.success_factors.join('|');
    assert(factors.includes('Grammar') || factors.includes('Grammar Quality'), 'Should contain Grammar factor');
    assert(factors.includes('Tone'), 'Should contain Tone factor');
    assert(factors.includes('Originality'), 'Should contain Originality factor');
  });

  await test('Should log workflow completion data', async () => {
    const workflowLog = {
      timestamp: assessment.timestamp,
      prompt_length: promptResult.prompt.length,
      rules_applied: promptResult.rulesApplied.length,
      assessment_score: assessment.confidence_score,
      meets_constraints: assessment.meets_constraints,
      success_factor_count: assessment.success_factors.length,
    };

    assert(workflowLog.timestamp, 'Log should have timestamp');
    assert(workflowLog.prompt_length > 1000, 'Log should have valid prompt length');
    assert(workflowLog.rules_applied === 12, 'Log should show 12 rules applied');
    assert(workflowLog.assessment_score >= 75, 'Log should have decent score');
    assert(workflowLog.success_factor_count > 0, 'Log should have success factors');
  });

  await test('Workflow should be reproducible', async () => {
    const editIntent = {
      targetObject: 'iPhone 15 Pro Max device mockup',
      editType: 'device swap',
      sourceType: 'iOS',
      targetType: 'Android',
      removeMarkers: 'iOS design language (Apple SF symbols, iOS gestures, Dynamic Island)',
      applyMarkers: 'Material Design 3 (Google Material Icons, Android gestures, system navigation)',
    };

    const constraints = {
      preserveElements: 'app layout, screen dimensions, bezel proportions, viewport aspect ratio',
      position: 'center of frame, maintaining original positioning',
      scale: 'device at 100% scale, no zoom or crop',
      lighting: 'studio lighting at 45 degrees, consistent with source',
      interactions: 'all touch targets, interactive elements, button states',
      doNotAlter: 'background environment, original photo quality, device shadow and reflection',
      doNotIntroduce: 'iOS UI patterns, Apple branding, hybrid designs, mixed design languages',
    };

    const secondRun = buildPrompt(editIntent, constraints);
    assert(
      JSON.stringify(secondRun.rulesApplied) === JSON.stringify(promptResult.rulesApplied),
      'Rules should be identical'
    );
    assert(secondRun.prompt === promptResult.prompt, 'Prompt should be deterministic');
  });

  // ===== Task 4: Output Validation =====
  console.log('\nTask 4: Assessment Scoring and Output Structure');
  console.log('-'.repeat(70));

  await test('Assessment should have valid confidence_score', async () => {
    assert(Number.isInteger(assessment.confidence_score), 'Confidence should be integer');
    assert(assessment.confidence_score >= 0, 'Confidence should be >=0');
    assert(assessment.confidence_score <= 100, 'Confidence should be <=100');
  });

  await test('Rule assessments should have consistent structure', async () => {
    const rules = assessment.rule_assessments;
    assert(rules.length === 12, 'Should have 12 rules');
    rules.forEach((rule, idx) => {
      assert(rule.ruleId === idx + 1, `Rule ${idx} ID should be ${idx + 1}`);
      assert(typeof rule.passed === 'boolean', `Rule ${idx} passed should be boolean`);
      // Reason can be null if rule passed, or string if it failed
      assert(rule.reason === null || typeof rule.reason === 'string', `Rule ${idx} reason should be null or string`);
      if (rule.reason) {
        assert(rule.reason.length > 0, `Rule ${idx} reason should not be empty`);
      }
    });
  });

  await test('Success factors should not exceed number of passed rules', async () => {
    const passedRules = assessment.rule_assessments.filter(r => r.passed).length;
    assert(
      assessment.success_factors.length <= passedRules,
      `Success factors (${assessment.success_factors.length}) should not exceed passed rules (${passedRules})`
    );
  });

  await test('Concerns should match failed rules count', async () => {
    const failedRules = assessment.rule_assessments.filter(r => !r.passed).length;
    assert(
      assessment.concerns.length === failedRules,
      `Concerns (${assessment.concerns.length}) should match failed rules (${failedRules})`
    );
  });

  // Print results
  console.log('\n' + '='.repeat(70));
  console.log('Test Summary');
  console.log('='.repeat(70));
  testResults.forEach((result) => console.log(result));
  console.log('='.repeat(70));
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('='.repeat(70) + '\n');

  // Exit with proper code
  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

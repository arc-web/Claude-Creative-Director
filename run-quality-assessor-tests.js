#!/usr/bin/env node

/**
 * Test runner for quality-assessor.js
 * Bypasses jest environment issues
 */

const { assessQuality, formatAssessment, ASSESSMENT_RULES } = require('./src/quality-assessor');

// Test utilities
let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(`${message} - Expected true, got ${value}`);
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(`${message} - Expected false, got ${value}`);
  }
}

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(`${message} - Expected > ${expected}, got ${actual}`);
  }
}

function assertGreaterThanOrEqual(actual, expected, message) {
  if (actual < expected) {
    throw new Error(`${message} - Expected >= ${expected}, got ${actual}`);
  }
}

function assertLessThan(actual, expected, message) {
  if (actual >= expected) {
    throw new Error(`${message} - Expected < ${expected}, got ${actual}`);
  }
}

function assertLessThanOrEqual(actual, expected, message) {
  if (actual > expected) {
    throw new Error(`${message} - Expected <= ${expected}, got ${actual}`);
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(`${message}\nString should contain: "${substring}"\nGot: "${str}"`);
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

async function runTests() {
  console.log('Running Quality Assessor Tests...\n');

  // ===== Test Case 1: Success Case (All rules pass) =====
  console.log('Test Case 1: Success - All constraints met');
  console.log('─'.repeat(50));

  await test('TC1: meets_constraints should be true', async () => {
    const assessment = assessQuality(
      {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      },
      {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      },
      {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      }
    );
    assertTrue(assessment.meets_constraints, 'meets_constraints');
  });

  await test('TC1: confidence_score should be 100', async () => {
    const assessment = assessQuality(
      {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      },
      {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      },
      {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      }
    );
    assertEqual(assessment.confidence_score, 100, 'confidence_score');
  });

  await test('TC1: concerns should be empty', async () => {
    const assessment = assessQuality(
      {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      },
      {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      },
      {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      }
    );
    assertEqual(assessment.concerns.length, 0, 'concerns.length');
  });

  await test('TC1: success_factors should have 12 items', async () => {
    const assessment = assessQuality(
      {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      },
      {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      },
      {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      }
    );
    assertEqual(assessment.success_factors.length, 12, 'success_factors.length');
  });

  await test('TC1: formatAssessment should show PASS status', async () => {
    const assessment = assessQuality(
      {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      },
      {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      },
      {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      }
    );
    const formatted = formatAssessment(assessment);
    assertContains(formatted, 'Status: PASS', 'formatAssessment');
  });

  // ===== Test Case 2: Failure Case (Multiple rules fail) =====
  console.log('\nTest Case 2: Failure - Multiple constraints violated');
  console.log('─'.repeat(50));

  await test('TC2: meets_constraints should be false', async () => {
    const assessment = assessQuality(
      {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      },
      {
        original: 'Original headline text',
        edited: 'Original headline text',
        reason: 'Attempt to maintain original'
      },
      {
        grammar_score: 92,
        tone_score: 55,
        brand_voice_score: 65,
        audience_score: 60,
        originality_score: 35,
        cta_strength: 45,
        engagement_score: 50,
        performance_score: 55
      }
    );
    assertFalse(assessment.meets_constraints, 'meets_constraints');
  });

  await test('TC2: confidence_score should be less than 100', async () => {
    const assessment = assessQuality(
      {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      },
      {
        original: 'Original headline text',
        edited: 'Original headline text',
        reason: 'Attempt to maintain original'
      },
      {
        grammar_score: 92,
        tone_score: 55,
        brand_voice_score: 65,
        audience_score: 60,
        originality_score: 35,
        cta_strength: 45,
        engagement_score: 50,
        performance_score: 55
      }
    );
    assertLessThan(assessment.confidence_score, 100, 'confidence_score');
  });

  await test('TC2: concerns should have multiple items', async () => {
    const assessment = assessQuality(
      {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      },
      {
        original: 'Original headline text',
        edited: 'Original headline text',
        reason: 'Attempt to maintain original'
      },
      {
        grammar_score: 92,
        tone_score: 55,
        brand_voice_score: 65,
        audience_score: 60,
        originality_score: 35,
        cta_strength: 45,
        engagement_score: 50,
        performance_score: 55
      }
    );
    assertGreaterThan(assessment.concerns.length, 0, 'concerns.length');
  });

  await test('TC2: should fail on originality rule', async () => {
    const assessment = assessQuality(
      {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      },
      {
        original: 'Original headline text',
        edited: 'Original headline text',
        reason: 'Attempt to maintain original'
      },
      {
        grammar_score: 92,
        tone_score: 55,
        brand_voice_score: 65,
        audience_score: 60,
        originality_score: 35,
        cta_strength: 45,
        engagement_score: 50,
        performance_score: 55
      }
    );
    const originalityRule = assessment.rule_assessments.find(r => r.ruleId === 9);
    assertFalse(originalityRule.passed, 'originalityRule.passed');
  });

  await test('TC2: formatAssessment should show REVIEW NEEDED', async () => {
    const assessment = assessQuality(
      {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      },
      {
        original: 'Original headline text',
        edited: 'Original headline text',
        reason: 'Attempt to maintain original'
      },
      {
        grammar_score: 92,
        tone_score: 55,
        brand_voice_score: 65,
        audience_score: 60,
        originality_score: 35,
        cta_strength: 45,
        engagement_score: 50,
        performance_score: 55
      }
    );
    const formatted = formatAssessment(assessment);
    assertContains(formatted, 'Status: REVIEW NEEDED', 'formatAssessment');
  });

  // ===== Test Case 3: Edge Case (Partial pass with keyword check) =====
  console.log('\nTest Case 3: Edge Case - Missing required keywords');
  console.log('─'.repeat(50));

  await test('TC3: should fail keyword integration rule', async () => {
    const assessment = assessQuality(
      {
        max_length: 300,
        format: 'paragraph',
        tone: 'conversational',
        audience: 'small_business_owners',
        keywords: ['automation', 'efficiency', 'scalable'],
        cta_required: true,
        compliance_rules: []
      },
      {
        original: 'Save time with our software.',
        edited: 'Our solution enables automation and improves efficiency in your workflow. Boost productivity today!',
        reason: 'Improve clarity and add missing keyword'
      },
      {
        grammar_score: 88,
        tone_score: 80,
        brand_voice_score: 82,
        audience_score: 79,
        originality_score: 78,
        cta_strength: 75,
        engagement_score: 80,
        performance_score: 76
      }
    );
    const keywordRule = assessment.rule_assessments.find(r => r.ruleId === 7);
    assertFalse(keywordRule.passed, 'keywordRule.passed');
  });

  await test('TC3: confidence_score should be between 50-100', async () => {
    const assessment = assessQuality(
      {
        max_length: 300,
        format: 'paragraph',
        tone: 'conversational',
        audience: 'small_business_owners',
        keywords: ['automation', 'efficiency', 'scalable'],
        cta_required: true,
        compliance_rules: []
      },
      {
        original: 'Save time with our software.',
        edited: 'Our solution enables automation and improves efficiency in your workflow. Boost productivity today!',
        reason: 'Improve clarity and add missing keyword'
      },
      {
        grammar_score: 88,
        tone_score: 80,
        brand_voice_score: 82,
        audience_score: 79,
        originality_score: 78,
        cta_strength: 75,
        engagement_score: 80,
        performance_score: 76
      }
    );
    assertGreaterThanOrEqual(assessment.confidence_score, 50, 'confidence_score >= 50');
    assertLessThanOrEqual(assessment.confidence_score, 100, 'confidence_score <= 100');
  });

  await test('TC3: should have some success factors', async () => {
    const assessment = assessQuality(
      {
        max_length: 300,
        format: 'paragraph',
        tone: 'conversational',
        audience: 'small_business_owners',
        keywords: ['automation', 'efficiency', 'scalable'],
        cta_required: true,
        compliance_rules: []
      },
      {
        original: 'Save time with our software.',
        edited: 'Our solution enables automation and improves efficiency in your workflow. Boost productivity today!',
        reason: 'Improve clarity and add missing keyword'
      },
      {
        grammar_score: 88,
        tone_score: 80,
        brand_voice_score: 82,
        audience_score: 79,
        originality_score: 78,
        cta_strength: 75,
        engagement_score: 80,
        performance_score: 76
      }
    );
    assertGreaterThan(assessment.success_factors.length, 0, 'success_factors.length > 0');
    assertLessThan(assessment.success_factors.length, 12, 'success_factors.length < 12');
  });

  await test('TC3: should pass at least 10 rules', async () => {
    const assessment = assessQuality(
      {
        max_length: 300,
        format: 'paragraph',
        tone: 'conversational',
        audience: 'small_business_owners',
        keywords: ['automation', 'efficiency', 'scalable'],
        cta_required: true,
        compliance_rules: []
      },
      {
        original: 'Save time with our software.',
        edited: 'Our solution enables automation and improves efficiency in your workflow. Boost productivity today!',
        reason: 'Improve clarity and add missing keyword'
      },
      {
        grammar_score: 88,
        tone_score: 80,
        brand_voice_score: 82,
        audience_score: 79,
        originality_score: 78,
        cta_strength: 75,
        engagement_score: 80,
        performance_score: 76
      }
    );
    const passedCount = assessment.rule_assessments.filter(r => r.passed).length;
    assertGreaterThanOrEqual(passedCount, 10, 'passedCount >= 10');
  });

  // ===== Additional Tests: Function Contract & Error Handling =====
  console.log('\nAdditional Tests: Function Contract & Error Handling');
  console.log('─'.repeat(50));

  await test('Should throw on missing constraints', async () => {
    try {
      assessQuality(null, {}, {});
      throw new Error('Should have thrown');
    } catch (error) {
      if (!error.message.includes('assessQuality requires')) {
        throw error;
      }
    }
  });

  await test('Should throw on missing editIntent', async () => {
    try {
      assessQuality({}, null, {});
      throw new Error('Should have thrown');
    } catch (error) {
      if (!error.message.includes('assessQuality requires')) {
        throw error;
      }
    }
  });

  await test('Should throw on missing metrics', async () => {
    try {
      assessQuality({}, {}, null);
      throw new Error('Should have thrown');
    } catch (error) {
      if (!error.message.includes('assessQuality requires')) {
        throw error;
      }
    }
  });

  await test('Assessment object should have required properties', async () => {
    const assessment = assessQuality(
      { max_length: 100 },
      { original: 'text', edited: 'new text', reason: 'test' },
      { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
        originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
    );

    assert(assessment.hasOwnProperty('meets_constraints'), 'has meets_constraints');
    assert(assessment.hasOwnProperty('success_factors'), 'has success_factors');
    assert(assessment.hasOwnProperty('concerns'), 'has concerns');
    assert(assessment.hasOwnProperty('confidence_score'), 'has confidence_score');
    assert(assessment.hasOwnProperty('rule_assessments'), 'has rule_assessments');
    assert(assessment.hasOwnProperty('timestamp'), 'has timestamp');
  });

  await test('formatAssessment should return string', async () => {
    const assessment = assessQuality(
      { max_length: 100 },
      { original: 'text', edited: 'new text', reason: 'test' },
      { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
        originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
    );

    const formatted = formatAssessment(assessment);
    assert(typeof formatted === 'string', 'is string');
    assert(formatted.length > 0, 'is non-empty');
  });

  await test('confidence_score should be integer 0-100', async () => {
    const assessment = assessQuality(
      { max_length: 100 },
      { original: 'text', edited: 'new text', reason: 'test' },
      { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
        originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
    );

    assert(Number.isInteger(assessment.confidence_score), 'is integer');
    assertGreaterThanOrEqual(assessment.confidence_score, 0, 'confidence_score >= 0');
    assertLessThanOrEqual(assessment.confidence_score, 100, 'confidence_score <= 100');
  });

  await test('All 12 assessment rules should be defined', async () => {
    assertEqual(Object.keys(ASSESSMENT_RULES).length, 12, 'ASSESSMENT_RULES count');
    for (let i = 1; i <= 12; i++) {
      assert(ASSESSMENT_RULES[i] !== undefined, `Rule ${i} defined`);
      assert(ASSESSMENT_RULES[i].hasOwnProperty('id'), `Rule ${i} has id`);
      assert(ASSESSMENT_RULES[i].hasOwnProperty('name'), `Rule ${i} has name`);
      assert(ASSESSMENT_RULES[i].hasOwnProperty('desc'), `Rule ${i} has desc`);
    }
  });

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

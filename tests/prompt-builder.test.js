const {
  loadRuleTemplate,
  fillRule,
  buildPrompt,
} = require('../src/prompt-builder');

/**
 * Test suite for prompt-builder.js
 * Tests the core functionality: loading templates, filling rules, and building complete prompts
 */

// Test 1: Load Rule Template
console.log('Test 1: Load Rule Template');
try {
  const template = loadRuleTemplate();
  console.assert(template.rules, 'Template should have rules array');
  console.assert(template.rules.length === 12, `Should have 12 rules, got ${template.rules.length}`);
  console.assert(template.rules[0].id === 1, 'First rule should have id 1');
  console.assert(template.rules[11].id === 12, 'Last rule should have id 12');
  console.log('✓ Rule template loaded successfully\n');
} catch (error) {
  console.error('✗ Failed to load rule template:', error.message, '\n');
  process.exit(1);
}

// Test 2: Fill Rule with Variables
console.log('Test 2: Fill Rule with Variables');
try {
  const template = loadRuleTemplate();
  const rule = template.rules[0]; // Rule 1: Edit Scope Isolation

  const variables = {
    TARGET_OBJECT: 'iPhone device',
    ALL_NON_TARGET_ELEMENTS: 'all other UI elements and background',
  };

  const filled = fillRule(rule, variables);
  console.assert(
    filled.includes('iPhone device'),
    'Filled rule should contain TARGET_OBJECT value'
  );
  console.assert(
    filled.includes('all other UI elements'),
    'Filled rule should contain ALL_NON_TARGET_ELEMENTS value'
  );
  console.assert(
    !filled.includes('[TARGET_OBJECT]'),
    'Filled rule should not contain placeholder'
  );
  console.log('✓ Rule filled correctly with variables\n');
} catch (error) {
  console.error('✗ Failed to fill rule:', error.message, '\n');
  process.exit(1);
}

// Test 3: Build Prompt - iPhone to Android Conversion
console.log('Test 3: Build Prompt - iPhone to Android Conversion');
try {
  const editIntent = {
    targetObject: 'iPhone device mockup',
    editType: 'device swap',
    sourceType: 'iOS',
    targetType: 'Android',
    removeMarkers: 'iOS design language (Apple SF symbols, iOS gestures)',
    applyMarkers: 'Material Design 3 (Google Material Icons, Android gestures)',
  };

  const constraints = {
    preserveElements: 'app layout, screen dimensions, bezel proportions',
    position: 'center of frame',
    scale: 'device at 100% scale',
    lighting: 'studio lighting at 45 degrees',
    interactions: 'all touch targets and interactive elements',
    doNotAlter: 'background, original photo quality, device shadow',
    doNotIntroduce: 'iOS UI patterns, Apple branding, inconsistent Material Design',
  };

  const result = buildPrompt(editIntent, constraints);

  console.assert(result.prompt, 'Result should have prompt property');
  console.assert(result.rulesApplied, 'Result should have rulesApplied property');
  console.assert(
    Array.isArray(result.rulesApplied),
    'rulesApplied should be an array'
  );
  console.assert(
    result.rulesApplied.length === 12,
    `Should apply all 12 rules, got ${result.rulesApplied.length}`
  );

  // Verify prompt structure
  console.assert(
    result.prompt.includes('EDIT DIRECTIVE'),
    'Prompt should have EDIT DIRECTIVE header'
  );
  console.assert(
    result.prompt.includes('from iOS to Android'),
    'Prompt should mention source and target types'
  );
  console.assert(
    result.prompt.includes('RULE SET'),
    'Prompt should have RULE SET section'
  );

  // Verify specific content from filled rules
  console.assert(
    result.prompt.includes('Material Design 3'),
    'Prompt should contain apply markers'
  );
  console.assert(
    result.prompt.includes('iOS design language'),
    'Prompt should contain remove markers'
  );
  console.assert(
    result.prompt.includes('Edit Scope Isolation'),
    'Prompt should include rule names'
  );
  console.assert(
    result.prompt.includes('Pixel Fidelity'),
    'Prompt should include rule without variables (Rule 9)'
  );
  console.assert(
    result.prompt.includes('Photorealism'),
    'Prompt should include rule without variables (Rule 10)'
  );
  console.assert(
    result.prompt.includes('Consistency Pass'),
    'Prompt should include rule without variables (Rule 11)'
  );

  // Check that rule IDs are correct
  console.assert(
    result.rulesApplied[0] === 1,
    'First applied rule should be 1'
  );
  console.assert(
    result.rulesApplied[11] === 12,
    'Last applied rule should be 12'
  );

  console.log('✓ Prompt built successfully for iPhone to Android conversion');
  console.log(`✓ All 12 rules applied: ${result.rulesApplied.join(', ')}\n`);
} catch (error) {
  console.error('✗ Failed to build prompt:', error.message, '\n');
  process.exit(1);
}

// Test 4: Verify Prompt Content Quality
console.log('Test 4: Verify Prompt Content Quality');
try {
  const editIntent = {
    targetObject: 'iPhone device mockup',
    editType: 'device swap',
    sourceType: 'iOS',
    targetType: 'Android',
    removeMarkers: 'iOS design language',
    applyMarkers: 'Material Design 3',
  };

  const constraints = {
    preserveElements: 'app layout, screen dimensions',
    position: 'center of frame',
    scale: 'device at 100% scale',
    lighting: 'studio lighting',
    interactions: 'all touch targets',
    doNotAlter: 'background, photo quality',
    doNotIntroduce: 'iOS UI patterns, hybrid designs',
  };

  const result = buildPrompt(editIntent, constraints);
  const prompt = result.prompt;

  // Verify all 12 rule names are present
  const expectedRules = [
    'Edit Scope Isolation',
    'Spatial Anchoring',
    'Geometry + Optics',
    'Lighting + Material Fidelity',
    'Environmental Interaction',
    'Structural Parity',
    'Identity Replacement',
    'Negative Constraints',
    'Pixel Fidelity',
    'Photorealism',
    'Consistency Pass',
    'Output Quality Threshold',
  ];

  expectedRules.forEach((ruleName, index) => {
    console.assert(
      prompt.includes(ruleName),
      `Prompt should include "${ruleName}" (Rule ${index + 1})`
    );
  });

  console.log('✓ All 12 rule names present in prompt\n');
} catch (error) {
  console.error('✗ Prompt content quality check failed:', error.message, '\n');
  process.exit(1);
}

// All tests passed
console.log('========================================');
console.log('All tests passed successfully!');
console.log('========================================');

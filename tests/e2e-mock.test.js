/**
 * End-to-End Mock Test
 * Tests complete workflow: iPhone-to-Android edit with prompt building and quality assessment
 * No external API calls - all mocked with realistic data
 */

const { buildPrompt } = require('../src/prompt-builder');
const { assessQuality } = require('../src/quality-assessor');

describe('End-to-End Mock Workflow: iPhone to Android Device Swap', () => {

  /**
   * TASK 1: Build prompt for complete iPhone-to-Android workflow
   */
  describe('Task 1: Prompt Building & Validation', () => {
    let editIntent;
    let constraints;
    let promptResult;

    beforeEach(() => {
      // Complete edit intent with all required fields
      editIntent = {
        targetObject: 'iPhone 15 Pro Max device mockup',
        editType: 'device swap',
        sourceType: 'iOS',
        targetType: 'Android',
        removeMarkers: 'iOS design language (Apple SF symbols, iOS gestures, Dynamic Island)',
        applyMarkers: 'Material Design 3 (Google Material Icons, Android gestures, system navigation)',
      };

      // Complete constraints covering all aspects
      constraints = {
        preserveElements: 'app layout, screen dimensions, bezel proportions, viewport aspect ratio',
        position: 'center of frame, maintaining original positioning',
        scale: 'device at 100% scale, no zoom or crop',
        lighting: 'studio lighting at 45 degrees, consistent with source',
        interactions: 'all touch targets, interactive elements, button states',
        doNotAlter: 'background environment, original photo quality, device shadow and reflection',
        doNotIntroduce: 'iOS UI patterns, Apple branding, hybrid designs, mixed design languages',
      };

      // Build the complete prompt
      promptResult = buildPrompt(editIntent, constraints);
    });

    test('Should successfully build prompt', () => {
      expect(promptResult).toBeDefined();
      expect(promptResult.prompt).toBeDefined();
      expect(promptResult.rulesApplied).toBeDefined();
      expect(typeof promptResult.prompt).toBe('string');
      expect(Array.isArray(promptResult.rulesApplied)).toBe(true);
    });

    test('Should include EDIT DIRECTIVE header', () => {
      expect(promptResult.prompt).toContain('EDIT DIRECTIVE');
    });

    test('Should include source and target specification', () => {
      expect(promptResult.prompt).toContain('iPhone');
      expect(promptResult.prompt).toContain('Android');
      expect(promptResult.prompt).toContain('iOS');
    });

    test('Should include RULE SET section', () => {
      expect(promptResult.prompt).toContain('RULE SET');
    });

    test('Should apply all 12 rules', () => {
      expect(promptResult.rulesApplied.length).toBe(12);
      expect(promptResult.rulesApplied).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    test('Should contain key constraint values in prompt', () => {
      expect(promptResult.prompt).toContain('Material Design 3');
      expect(promptResult.prompt).toContain('iOS design language');
      expect(promptResult.prompt).toContain('center of frame');
      expect(promptResult.prompt).toContain('100% scale');
    });

    test('Should contain all variable-filled rules', () => {
      // Rules with variables (1-8)
      expect(promptResult.prompt).toContain('Edit Scope Isolation');
      expect(promptResult.prompt).toContain('Spatial Anchoring');
      expect(promptResult.prompt).toContain('Geometry + Optics');
      expect(promptResult.prompt).toContain('Lighting + Material Fidelity');
      expect(promptResult.prompt).toContain('Environmental Interaction');
      expect(promptResult.prompt).toContain('Structural Parity');
      expect(promptResult.prompt).toContain('Identity Replacement');
      expect(promptResult.prompt).toContain('Negative Constraints');
    });

    test('Should contain all static rules', () => {
      // Rules without variables (9-12)
      expect(promptResult.prompt).toContain('Pixel Fidelity');
      expect(promptResult.prompt).toContain('Photorealism');
      expect(promptResult.prompt).toContain('Consistency Pass');
      expect(promptResult.prompt).toContain('Output Quality Threshold');
    });

    test('Prompt should have substantial length (>1000 chars)', () => {
      expect(promptResult.prompt.length).toBeGreaterThan(1000);
    });
  });

  /**
   * TASK 2: Quality assessment with mocked success metrics
   */
  describe('Task 2: Quality Assessment with Success Metrics', () => {
    let assessment;
    let constraints;
    let editIntent;
    let metrics;

    beforeEach(() => {
      // Simulated quality metrics for successful edit
      metrics = {
        grammar_score: 98,
        tone_score: 95,
        brand_voice_score: 92,
        audience_score: 88,
        originality_score: 90,
        cta_strength: 85,
        engagement_score: 89,
        performance_score: 91,
      };

      // Constraints for the edit
      constraints = {
        max_length: 5000,
        format: 'detailed_prompt',
        tone: 'professional',
        audience: 'image_generation_model',
        keywords: ['device', 'Android', 'Material Design', 'swap'],
        cta_required: false,
        compliance_rules: ['no_false_claims'],
      };

      // Edit intent representing the transformation
      editIntent = {
        original: 'iPhone device mockup in iOS design language',
        edited: 'Android device mockup in Material Design 3 with all iOS patterns replaced',
        reason: 'Transform iOS device to Android device with design system conversion',
      };

      // Assess quality
      assessment = assessQuality(constraints, editIntent, metrics);
    });

    test('Should return valid assessment object', () => {
      expect(assessment).toBeDefined();
      expect(assessment).toHaveProperty('meets_constraints');
      expect(assessment).toHaveProperty('success_factors');
      expect(assessment).toHaveProperty('concerns');
      expect(assessment).toHaveProperty('confidence_score');
      expect(assessment).toHaveProperty('rule_assessments');
    });

    test('Should meet all constraints with high metrics', () => {
      expect(assessment.meets_constraints).toBe(true);
    });

    test('Should have high confidence score (90+)', () => {
      expect(assessment.confidence_score).toBeGreaterThanOrEqual(90);
      expect(assessment.confidence_score).toBeLessThanOrEqual(100);
    });

    test('Should have no concerns when metrics are strong', () => {
      expect(assessment.concerns.length).toBe(0);
    });

    test('Should list multiple success factors', () => {
      expect(assessment.success_factors.length).toBeGreaterThan(0);
      expect(assessment.success_factors.length).toBeLessThanOrEqual(12);
    });

    test('Should have 12 rule assessments', () => {
      expect(assessment.rule_assessments.length).toBe(12);
    });

    test('Most rules should pass (>80%)', () => {
      const passedCount = assessment.rule_assessments.filter(r => r.passed).length;
      expect(passedCount).toBeGreaterThanOrEqual(10);
    });

    test('Each rule assessment should have required fields', () => {
      assessment.rule_assessments.forEach(rule => {
        expect(rule).toHaveProperty('ruleId');
        expect(rule).toHaveProperty('passed');
        expect(rule).toHaveProperty('reason');
        expect(typeof rule.ruleId).toBe('number');
        expect(typeof rule.passed).toBe('boolean');
        expect(typeof rule.reason).toBe('string');
      });
    });

    test('Success factors should be strings', () => {
      assessment.success_factors.forEach(factor => {
        expect(typeof factor).toBe('string');
        expect(factor.length).toBeGreaterThan(0);
      });
    });

    test('Should have timestamp', () => {
      expect(assessment.timestamp).toBeDefined();
      expect(new Date(assessment.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  /**
   * TASK 3: Complete workflow integration
   */
  describe('Task 3: Complete Workflow Integration', () => {
    let promptResult;
    let assessment;

    beforeEach(() => {
      // Step 1: Build prompt
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

      // Step 2: Assess quality
      const assessmentConstraints = {
        max_length: 5000,
        format: 'detailed_prompt',
        tone: 'professional',
        audience: 'image_generation_model',
        keywords: ['device', 'Android', 'Material Design'],
        cta_required: false,
        compliance_rules: [],
      };

      const assessmentEditIntent = {
        original: 'iPhone device mockup',
        edited: 'Android device mockup',
        reason: 'Device platform conversion with design system update',
      };

      const metrics = {
        grammar_score: 96,
        tone_score: 94,
        brand_voice_score: 91,
        audience_score: 87,
        originality_score: 88,
        cta_strength: 80,
        engagement_score: 87,
        performance_score: 90,
      };

      assessment = assessQuality(assessmentConstraints, assessmentEditIntent, metrics);
    });

    test('Step 1: Prompt building produces valid output', () => {
      expect(promptResult.prompt.length).toBeGreaterThan(1000);
      expect(promptResult.rulesApplied.length).toBe(12);
    });

    test('Step 2: Quality assessment validates prompt', () => {
      expect(assessment.meets_constraints).toBe(true);
      expect(assessment.confidence_score).toBeGreaterThanOrEqual(85);
    });

    test('Workflow produces complete edit context', () => {
      expect(promptResult.prompt).toBeDefined();
      expect(assessment.success_factors.length).toBeGreaterThan(0);
      expect(assessment.rule_assessments.length).toBe(12);
    });

    test('All success factors should be present', () => {
      expect(assessment.success_factors).toContain('Grammar Quality');
      expect(assessment.success_factors).toContain('Tone Consistency');
      expect(assessment.success_factors).toContain('Originality Check');
    });

    test('Should log workflow completion data', () => {
      const workflowLog = {
        timestamp: assessment.timestamp,
        prompt_length: promptResult.prompt.length,
        rules_applied: promptResult.rulesApplied.length,
        assessment_score: assessment.confidence_score,
        meets_constraints: assessment.meets_constraints,
        success_factor_count: assessment.success_factors.length,
      };

      expect(workflowLog.timestamp).toBeDefined();
      expect(workflowLog.prompt_length).toBeGreaterThan(1000);
      expect(workflowLog.rules_applied).toBe(12);
      expect(workflowLog.assessment_score).toBeGreaterThanOrEqual(85);
      expect(workflowLog.meets_constraints).toBe(true);
      expect(workflowLog.success_factor_count).toBeGreaterThan(0);
    });

    test('Workflow should be reproducible', () => {
      // Second run with same inputs should produce equivalent results
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

      // Same inputs should produce same rules
      expect(secondRun.rulesApplied).toEqual(promptResult.rulesApplied);
      // Prompt should be identical (deterministic)
      expect(secondRun.prompt).toBe(promptResult.prompt);
    });
  });

  /**
   * TASK 4: Output validation and assessment structure
   */
  describe('Task 4: Assessment Scoring and Output Structure', () => {
    let assessment;

    beforeEach(() => {
      const constraints = {
        max_length: 5000,
        format: 'detailed_prompt',
        tone: 'professional',
      };

      const editIntent = {
        original: 'iPhone device',
        edited: 'Android device with Material Design',
        reason: 'Platform conversion',
      };

      const metrics = {
        grammar_score: 94,
        tone_score: 92,
        brand_voice_score: 89,
        audience_score: 85,
        originality_score: 87,
        cta_strength: 75,
        engagement_score: 86,
        performance_score: 88,
      };

      assessment = assessQuality(constraints, editIntent, metrics);
    });

    test('Assessment should have valid confidence_score', () => {
      expect(Number.isInteger(assessment.confidence_score)).toBe(true);
      expect(assessment.confidence_score).toBeGreaterThanOrEqual(0);
      expect(assessment.confidence_score).toBeLessThanOrEqual(100);
    });

    test('Rule assessments should have consistent structure', () => {
      const rules = assessment.rule_assessments;
      expect(rules.length).toBe(12);

      rules.forEach((rule, idx) => {
        expect(rule.ruleId).toBe(idx + 1);
        expect(typeof rule.passed).toBe('boolean');
        expect(typeof rule.reason).toBe('string');
        expect(rule.reason.length).toBeGreaterThan(0);
      });
    });

    test('Success factors should not exceed number of passed rules', () => {
      const passedRules = assessment.rule_assessments.filter(r => r.passed).length;
      expect(assessment.success_factors.length).toBeLessThanOrEqual(passedRules);
    });

    test('Concerns should match failed rules count', () => {
      const failedRules = assessment.rule_assessments.filter(r => !r.passed).length;
      expect(assessment.concerns.length).toBe(failedRules);
    });

    test('Each concern should reference a failed rule', () => {
      assessment.concerns.forEach(concern => {
        const failedRule = assessment.rule_assessments.find(r => r.rule === concern.rule && !r.passed);
        expect(failedRule).toBeDefined();
      });
    });
  });
});

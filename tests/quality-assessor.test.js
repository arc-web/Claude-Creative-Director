/**
 * Quality Assessor Tests
 * Test cases for quality assessment logic
 */

const { assessQuality, formatAssessment, ASSESSMENT_RULES } = require('../src/quality-assessor');

describe('Quality Assessor', () => {

  // ===== Test Case 1: Success Case (All rules pass) =====
  describe('Test Case 1: Success - All constraints met', () => {
    let assessment;

    beforeEach(() => {
      const constraints = {
        max_length: 200,
        format: 'paragraph',
        tone: 'professional',
        audience: 'marketing_executives',
        keywords: ['performance', 'optimization'],
        cta_required: true,
        compliance_rules: ['no_claims']
      };

      const editIntent = {
        original: 'Increase your marketing performance.',
        edited: 'Transform your marketing performance with our proven optimization strategies. Unlock growth potential and maximize ROI. Contact us today to get started.',
        reason: 'Enhance engagement and clarity'
      };

      const metrics = {
        grammar_score: 95,
        tone_score: 85,
        brand_voice_score: 90,
        audience_score: 88,
        originality_score: 85,
        cta_strength: 92,
        engagement_score: 87,
        performance_score: 89
      };

      assessment = assessQuality(constraints, editIntent, metrics);
    });

    test('Should return meets_constraints = true', () => {
      expect(assessment.meets_constraints).toBe(true);
    });

    test('Should have confidence_score of 100', () => {
      expect(assessment.confidence_score).toBe(100);
    });

    test('Should have no concerns', () => {
      expect(assessment.concerns.length).toBe(0);
    });

    test('Should list all success factors', () => {
      expect(assessment.success_factors.length).toBe(12);
      expect(assessment.success_factors).toContain('Length Compliance');
      expect(assessment.success_factors).toContain('Grammar Quality');
      expect(assessment.success_factors).toContain('Keyword Integration');
    });

    test('Should have all 12 rules in assessment', () => {
      expect(assessment.rule_assessments.length).toBe(12);
      expect(assessment.rule_assessments.every(r => r.passed)).toBe(true);
    });

    test('formatAssessment should show PASS status', () => {
      const formatted = formatAssessment(assessment);
      expect(formatted).toContain('Status: PASS');
      expect(formatted).toContain('12/12 rules passed');
      expect(formatted).toContain('Confidence Score: 100/100');
    });

    test('formatAssessment should list success factors', () => {
      const formatted = formatAssessment(assessment);
      expect(formatted).toContain('Success Factors (12):');
      expect(formatted).toContain('Length Compliance');
    });
  });

  // ===== Test Case 2: Failure Case (Multiple rules fail) =====
  describe('Test Case 2: Failure - Multiple constraints violated', () => {
    let assessment;

    beforeEach(() => {
      const constraints = {
        max_length: 50,
        format: 'headline',
        tone: 'professional',
        audience: 'executives',
        keywords: ['innovation', 'leadership'],
        cta_required: true,
        compliance_rules: ['no_hype', 'no_false_claims']
      };

      const editIntent = {
        original: 'Original headline text',
        edited: 'Original headline text', // No change = fails originality
        reason: 'Attempt to maintain original'
      };

      const metrics = {
        grammar_score: 92,
        tone_score: 55, // Too low
        brand_voice_score: 65, // Below threshold (75)
        audience_score: 60, // Below threshold (70)
        originality_score: 35, // Way too low
        cta_strength: 45, // Below threshold (70)
        engagement_score: 50, // Below threshold (65)
        performance_score: 55 // Below threshold (70)
      };

      assessment = assessQuality(constraints, editIntent, metrics);
    });

    test('Should return meets_constraints = false', () => {
      expect(assessment.meets_constraints).toBe(false);
    });

    test('Should have confidence_score below 100', () => {
      expect(assessment.confidence_score).toBeLessThan(100);
      expect(assessment.confidence_score).toBeGreaterThan(0);
    });

    test('Should have multiple concerns', () => {
      expect(assessment.concerns.length).toBeGreaterThan(0);
      const rulesThatFailed = assessment.rule_assessments.filter(r => !r.passed).length;
      expect(assessment.concerns.length).toBe(rulesThatFailed);
    });

    test('Should fail on tone consistency', () => {
      const toneRule = assessment.rule_assessments.find(r => r.ruleId === 3);
      expect(toneRule.passed).toBe(false);
      expect(toneRule.reason).toContain('Tone score');
    });

    test('Should fail on originality', () => {
      const originalityRule = assessment.rule_assessments.find(r => r.ruleId === 9);
      expect(originalityRule.passed).toBe(false);
    });

    test('Should fail on CTA strength', () => {
      const ctaRule = assessment.rule_assessments.find(r => r.ruleId === 8);
      expect(ctaRule.passed).toBe(false);
    });

    test('formatAssessment should show REVIEW NEEDED status', () => {
      const formatted = formatAssessment(assessment);
      expect(formatted).toContain('Status: REVIEW NEEDED');
      expect(formatted).toContain('Concerns (');
    });

    test('formatAssessment should list failed rules', () => {
      const formatted = formatAssessment(assessment);
      expect(formatted).toContain('Rule Breakdown:');
      const failedRules = assessment.rule_assessments.filter(r => !r.passed);
      expect(failedRules.length).toBeGreaterThan(0);
    });
  });

  // ===== Test Case 3: Edge Case (Partial pass with keyword check) =====
  describe('Test Case 3: Edge Case - Missing required keywords', () => {
    let assessment;

    beforeEach(() => {
      const constraints = {
        max_length: 300,
        format: 'paragraph',
        tone: 'conversational',
        audience: 'small_business_owners',
        keywords: ['automation', 'efficiency', 'scalable'], // All required
        cta_required: true,
        compliance_rules: []
      };

      const editIntent = {
        original: 'Save time with our software.',
        edited: 'Our solution enables automation and improves efficiency in your workflow. Boost productivity today!',
        reason: 'Improve clarity and add missing keyword'
        // Note: Missing 'scalable' keyword
      };

      const metrics = {
        grammar_score: 88,
        tone_score: 80,
        brand_voice_score: 82,
        audience_score: 79,
        originality_score: 78,
        cta_strength: 75,
        engagement_score: 80,
        performance_score: 76
      };

      assessment = assessQuality(constraints, editIntent, metrics);
    });

    test('Should have some failed rules due to missing keyword', () => {
      const keywordRule = assessment.rule_assessments.find(r => r.ruleId === 7);
      expect(keywordRule.passed).toBe(false);
      expect(keywordRule.reason).toContain('scalable');
    });

    test('Should have confidence score between 50-100', () => {
      expect(assessment.confidence_score).toBeGreaterThanOrEqual(50);
      expect(assessment.confidence_score).toBeLessThanOrEqual(100);
    });

    test('Should have at least some success factors', () => {
      expect(assessment.success_factors.length).toBeGreaterThan(0);
      expect(assessment.success_factors.length).toBeLessThan(12);
    });

    test('Should have specific concern about keyword integration', () => {
      expect(assessment.concerns.some(c => c.rule === 'Keyword Integration')).toBe(true);
    });

    test('formatAssessment should show partial pass', () => {
      const formatted = formatAssessment(assessment);
      const passedRules = assessment.rule_assessments.filter(r => r.passed).length;
      expect(formatted).toContain(`${passedRules}/12 rules passed`);
      expect(formatted).toContain('Keyword Integration');
    });

    test('Should still pass most other rules', () => {
      const passedCount = assessment.rule_assessments.filter(r => r.passed).length;
      expect(passedCount).toBeGreaterThanOrEqual(10); // At least 10 out of 12
    });
  });

  // ===== Additional Tests: Function Contract & Error Handling =====
  describe('Function Contract & Error Handling', () => {

    test('assessQuality should throw on missing constraints', () => {
      expect(() => {
        assessQuality(null, {}, {});
      }).toThrow('assessQuality requires constraints, editIntent, and metrics objects');
    });

    test('assessQuality should throw on missing editIntent', () => {
      expect(() => {
        assessQuality({}, null, {});
      }).toThrow('assessQuality requires constraints, editIntent, and metrics objects');
    });

    test('assessQuality should throw on missing metrics', () => {
      expect(() => {
        assessQuality({}, {}, null);
      }).toThrow('assessQuality requires constraints, editIntent, and metrics objects');
    });

    test('Assessment object should have required properties', () => {
      const assessment = assessQuality(
        { max_length: 100 },
        { original: 'text', edited: 'new text', reason: 'test' },
        { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
          originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
      );

      expect(assessment).toHaveProperty('meets_constraints');
      expect(assessment).toHaveProperty('success_factors');
      expect(assessment).toHaveProperty('concerns');
      expect(assessment).toHaveProperty('confidence_score');
      expect(assessment).toHaveProperty('rule_assessments');
      expect(assessment).toHaveProperty('timestamp');
    });

    test('formatAssessment should return string', () => {
      const assessment = assessQuality(
        { max_length: 100 },
        { original: 'text', edited: 'new text', reason: 'test' },
        { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
          originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
      );

      const formatted = formatAssessment(assessment);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('confidence_score should be integer 0-100', () => {
      const assessment = assessQuality(
        { max_length: 100 },
        { original: 'text', edited: 'new text', reason: 'test' },
        { grammar_score: 90, tone_score: 80, brand_voice_score: 85, audience_score: 75,
          originality_score: 70, cta_strength: 75, engagement_score: 75, performance_score: 75 }
      );

      expect(Number.isInteger(assessment.confidence_score)).toBe(true);
      expect(assessment.confidence_score).toBeGreaterThanOrEqual(0);
      expect(assessment.confidence_score).toBeLessThanOrEqual(100);
    });

    test('All 12 assessment rules should be defined', () => {
      expect(Object.keys(ASSESSMENT_RULES).length).toBe(12);
      for (let i = 1; i <= 12; i++) {
        expect(ASSESSMENT_RULES[i]).toBeDefined();
        expect(ASSESSMENT_RULES[i]).toHaveProperty('id');
        expect(ASSESSMENT_RULES[i]).toHaveProperty('name');
        expect(ASSESSMENT_RULES[i]).toHaveProperty('desc');
      }
    });
  });
});

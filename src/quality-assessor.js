/**
 * Quality Assessor Module
 * Evaluates edits against constraints and metrics
 */

const ASSESSMENT_RULES = {
  1: { id: 1, name: 'Length Compliance', desc: 'Output within character limits' },
  2: { id: 2, name: 'Format Compliance', desc: 'Output matches required format' },
  3: { id: 3, name: 'Tone Consistency', desc: 'Tone aligns with constraints' },
  4: { id: 4, name: 'Brand Voice', desc: 'Voice preserves brand identity' },
  5: { id: 5, name: 'Audience Alignment', desc: 'Content targets correct audience' },
  6: { id: 6, name: 'Grammar Quality', desc: 'No grammar or spelling errors' },
  7: { id: 7, name: 'Keyword Integration', desc: 'Required keywords present' },
  8: { id: 8, name: 'Call-to-Action', desc: 'CTA is clear and compelling' },
  9: { id: 9, name: 'Originality', desc: 'Content is original and distinct' },
  10: { id: 10, name: 'Compliance', desc: 'Meets regulatory/policy requirements' },
  11: { id: 11, name: 'Engagement Potential', desc: 'Content has strong engagement potential' },
  12: { id: 12, name: 'Performance Alignment', desc: 'Aligns with performance metrics goals' }
};

/**
 * Assess quality of an edit against constraints
 * @param {Object} constraints - Edit constraints { max_length, tone, audience, keywords, cta_required, format, etc }
 * @param {Object} editIntent - User intent { original, edited, reason }
 * @param {Object} metrics - Performance metrics { grammar_score, engagement_score, originality_score, etc }
 * @returns {Object} Assessment with { meets_constraints, success_factors, concerns, confidence_score, rule_assessments }
 */
function assessQuality(constraints, editIntent, metrics) {
  if (!constraints || !editIntent || !metrics) {
    throw new Error('assessQuality requires constraints, editIntent, and metrics objects');
  }

  const ruleResults = evaluateRules(constraints, editIntent, metrics);
  const passedRules = ruleResults.filter(r => r.passed).length;
  const totalRules = ruleResults.length;

  // Extract success factors and concerns
  const successFactors = ruleResults
    .filter(r => r.passed)
    .map(r => ASSESSMENT_RULES[r.ruleId].name);

  const concerns = ruleResults
    .filter(r => !r.passed)
    .map(r => ({
      rule: ASSESSMENT_RULES[r.ruleId].name,
      reason: r.reason
    }));

  // Calculate confidence score (0-100)
  const baseScore = (passedRules / totalRules) * 100;
  const confidenceScore = Math.round(baseScore);

  // Determine if all constraints are met
  const meetsConstraints = passedRules === totalRules;

  return {
    meets_constraints: meetsConstraints,
    success_factors: successFactors,
    concerns: concerns,
    confidence_score: confidenceScore,
    rule_assessments: ruleResults,
    timestamp: new Date().toISOString()
  };
}

/**
 * Evaluate all 12 rules against constraints and metrics
 * @private
 */
function evaluateRules(constraints, editIntent, metrics) {
  return [
    // Rule 1: Length Compliance
    {
      ruleId: 1,
      passed: checkLengthCompliance(editIntent.edited, constraints.max_length),
      reason: !checkLengthCompliance(editIntent.edited, constraints.max_length)
        ? `Text length ${editIntent.edited.length} exceeds max ${constraints.max_length}`
        : null
    },
    // Rule 2: Format Compliance
    {
      ruleId: 2,
      passed: checkFormatCompliance(editIntent.edited, constraints.format),
      reason: !checkFormatCompliance(editIntent.edited, constraints.format)
        ? `Does not match required format: ${constraints.format}`
        : null
    },
    // Rule 3: Tone Consistency
    {
      ruleId: 3,
      passed: checkToneConsistency(editIntent.edited, constraints.tone, metrics.tone_score),
      reason: !checkToneConsistency(editIntent.edited, constraints.tone, metrics.tone_score)
        ? `Tone score ${metrics.tone_score} doesn't match required tone: ${constraints.tone}`
        : null
    },
    // Rule 4: Brand Voice
    {
      ruleId: 4,
      passed: checkBrandVoice(editIntent.edited, metrics.brand_voice_score),
      reason: !checkBrandVoice(editIntent.edited, metrics.brand_voice_score)
        ? `Brand voice score ${metrics.brand_voice_score} below threshold (75)`
        : null
    },
    // Rule 5: Audience Alignment
    {
      ruleId: 5,
      passed: checkAudienceAlignment(editIntent.edited, constraints.audience, metrics.audience_score),
      reason: !checkAudienceAlignment(editIntent.edited, constraints.audience, metrics.audience_score)
        ? `Audience alignment score ${metrics.audience_score} below threshold (70)`
        : null
    },
    // Rule 6: Grammar Quality
    {
      ruleId: 6,
      passed: checkGrammarQuality(metrics.grammar_score),
      reason: !checkGrammarQuality(metrics.grammar_score)
        ? `Grammar score ${metrics.grammar_score} below threshold (85)`
        : null
    },
    // Rule 7: Keyword Integration
    {
      ruleId: 7,
      passed: checkKeywordIntegration(editIntent.edited, constraints.keywords),
      reason: !checkKeywordIntegration(editIntent.edited, constraints.keywords)
        ? `Required keywords not found: ${constraints.keywords.join(', ')}`
        : null
    },
    // Rule 8: Call-to-Action
    {
      ruleId: 8,
      passed: checkCallToAction(editIntent.edited, constraints.cta_required, metrics.cta_strength),
      reason: !checkCallToAction(editIntent.edited, constraints.cta_required, metrics.cta_strength)
        ? `CTA missing or weak (strength: ${metrics.cta_strength})`
        : null
    },
    // Rule 9: Originality
    {
      ruleId: 9,
      passed: checkOriginality(editIntent.edited, editIntent.original, metrics.originality_score),
      reason: !checkOriginality(editIntent.edited, editIntent.original, metrics.originality_score)
        ? `Originality score ${metrics.originality_score} below threshold (60)`
        : null
    },
    // Rule 10: Compliance
    {
      ruleId: 10,
      passed: checkCompliance(editIntent.edited, constraints.compliance_rules),
      reason: !checkCompliance(editIntent.edited, constraints.compliance_rules)
        ? 'Does not meet compliance requirements'
        : null
    },
    // Rule 11: Engagement Potential
    {
      ruleId: 11,
      passed: checkEngagementPotential(metrics.engagement_score),
      reason: !checkEngagementPotential(metrics.engagement_score)
        ? `Engagement score ${metrics.engagement_score} below threshold (65)`
        : null
    },
    // Rule 12: Performance Alignment
    {
      ruleId: 12,
      passed: checkPerformanceAlignment(editIntent.edited, metrics.performance_score),
      reason: !checkPerformanceAlignment(editIntent.edited, metrics.performance_score)
        ? `Performance score ${metrics.performance_score} below threshold (70)`
        : null
    }
  ];
}

// ===== Individual Rule Evaluators =====

function checkLengthCompliance(text, maxLength) {
  if (!maxLength) return true; // No max length constraint
  return text.length <= maxLength;
}

function checkFormatCompliance(text, format) {
  if (!format) return true; // No format constraint
  switch (format) {
    case 'bullet_points':
      return text.split('\n').some(line => line.trim().startsWith('-'));
    case 'headline':
      return text.length > 10 && text.length < 100;
    case 'paragraph':
      return text.includes(' ') && text.length > 50;
    default:
      return true;
  }
}

function checkToneConsistency(text, tone, toneScore) {
  if (!tone) return true;
  return toneScore >= 70;
}

function checkBrandVoice(text, brandVoiceScore) {
  return brandVoiceScore >= 75;
}

function checkAudienceAlignment(text, audience, audienceScore) {
  if (!audience) return true;
  return audienceScore >= 70;
}

function checkGrammarQuality(grammarScore) {
  return grammarScore >= 85;
}

function checkKeywordIntegration(text, keywords) {
  if (!keywords || keywords.length === 0) return true;
  const lowerText = text.toLowerCase();
  return keywords.every(keyword => lowerText.includes(keyword.toLowerCase()));
}

function checkCallToAction(text, ctaRequired, ctaStrength) {
  if (!ctaRequired) return true;
  return ctaStrength >= 70; // CTA strength 0-100
}

function checkOriginality(edited, original, originalityScore) {
  // Must differ from original and have good originality score
  if (edited === original) return false;
  return originalityScore >= 60;
}

function checkCompliance(text, complianceRules) {
  if (!complianceRules || complianceRules.length === 0) return true;
  // Check that none of the prohibited patterns appear
  return !complianceRules.some(rule => text.includes(rule));
}

function checkEngagementPotential(engagementScore) {
  return engagementScore >= 65;
}

function checkPerformanceAlignment(text, performanceScore) {
  return performanceScore >= 70;
}

/**
 * Format an assessment for human-readable output
 * @param {Object} assessment - Assessment object from assessQuality()
 * @returns {string} Human-readable assessment summary
 */
function formatAssessment(assessment) {
  const status = assessment.meets_constraints ? 'PASS' : 'REVIEW NEEDED';
  const ruleCount = assessment.rule_assessments.length;
  const passedCount = assessment.rule_assessments.filter(r => r.passed).length;

  let output = '';
  output += `Quality Assessment Report\n`;
  output += `${'='.repeat(50)}\n`;
  output += `Status: ${status} (${passedCount}/${ruleCount} rules passed)\n`;
  output += `Confidence Score: ${assessment.confidence_score}/100\n`;
  output += `Timestamp: ${assessment.timestamp}\n\n`;

  // Success Factors
  if (assessment.success_factors.length > 0) {
    output += `Success Factors (${assessment.success_factors.length}):\n`;
    output += `-${assessment.success_factors.map(f => ` ${f}`).join('\n-')}\n\n`;
  }

  // Concerns
  if (assessment.concerns.length > 0) {
    output += `Concerns (${assessment.concerns.length}):\n`;
    assessment.concerns.forEach(concern => {
      output += `- ${concern.rule}\n`;
      if (concern.reason) {
        output += `  Reason: ${concern.reason}\n`;
      }
    });
    output += '\n';
  }

  // Detailed Rule Assessment
  output += `Rule Breakdown:\n`;
  output += `-${'-'.repeat(49)}\n`;
  assessment.rule_assessments.forEach(rule => {
    const ruleInfo = ASSESSMENT_RULES[rule.ruleId];
    const symbol = rule.passed ? '✓' : '✗';
    output += `${symbol} Rule ${rule.ruleId}: ${ruleInfo.name}\n`;
    if (!rule.passed && rule.reason) {
      output += `  ${rule.reason}\n`;
    }
  });

  return output;
}

module.exports = {
  assessQuality,
  formatAssessment,
  ASSESSMENT_RULES
};

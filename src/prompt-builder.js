const fs = require('fs');
const path = require('path');
const { log } = require('./utils');

/**
 * Load rule template from JSON file
 * @returns {Object} Rule template object with rules array
 * @throws {Error} If template file not found or invalid JSON
 */
function loadRuleTemplate() {
  try {
    const templatePath = path.join(__dirname, 'rule-template.json');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Rule template not found at: ${templatePath}`);
    }

    const content = fs.readFileSync(templatePath, 'utf8');
    const template = JSON.parse(content);
    log('info', `Loaded rule template with ${template.rules.length} rules`);
    return template;
  } catch (error) {
    log('error', `Failed to load rule template: ${error.message}`);
    throw error;
  }
}

/**
 * Fill a single rule template with variables
 * @param {Object} rule - Rule object with id, name, template, and variables array
 * @param {Object} variables - Key-value pairs to fill into template
 * @returns {string} Filled rule text
 */
function fillRule(rule, variables) {
  try {
    let filledTemplate = rule.template;

    // Replace each variable placeholder with its value
    rule.variables.forEach((varName) => {
      const placeholder = `[${varName}]`;
      const value = variables[varName] || '';
      filledTemplate = filledTemplate.split(placeholder).join(value);
    });

    return filledTemplate;
  } catch (error) {
    log('error', `Failed to fill rule ${rule.id}: ${error.message}`);
    throw error;
  }
}

/**
 * Build complete prompt from rule set based on edit intent and constraints
 * @param {Object} editIntent - Edit intention object
 *   - targetObject: {string} Object being edited (e.g., "iPhone device")
 *   - editType: {string} Type of edit (e.g., "device swap")
 *   - sourceType: {string} Source design language (e.g., "iOS")
 *   - targetType: {string} Target design language (e.g., "Android")
 *   - removeMarkers: {string} Design markers to remove (e.g., "iOS design elements")
 *   - applyMarkers: {string} Design markers to apply (e.g., "Material Design 3")
 * @param {Object} constraints - Additional constraints object
 *   - preserveElements: {string} Elements to preserve exactly
 *   - position: {string} Position/spatial constraints
 *   - scale: {string} Scale constraints
 *   - lighting: {string} Lighting requirements
 *   - interactions: {string} Interaction preservation requirements
 *   - doNotAlter: {string} Elements that must not change
 *   - doNotIntroduce: {string} Elements to avoid introducing
 * @returns {Object} { prompt: string, rulesApplied: array of rule IDs }
 */
function buildPrompt(editIntent, constraints) {
  try {
    // Load rule template
    const template = loadRuleTemplate();
    const rules = template.rules;

    // Build comprehensive variables map from editIntent and constraints
    const allVariables = {
      // From editIntent
      TARGET_OBJECT: editIntent.targetObject || '',
      EDIT_TYPE: editIntent.editType || '',
      SOURCE_TYPE: editIntent.sourceType || '',
      TARGET_TYPE: editIntent.targetType || '',
      REMOVE_MARKERS: editIntent.removeMarkers || '',
      APPLY_MARKERS: editIntent.applyMarkers || '',

      // From constraints
      ALL_NON_TARGET_ELEMENTS: constraints.preserveElements || 'all other UI elements and background',
      POSITION: constraints.position || 'original position',
      SCALE: constraints.scale || 'original scale',
      ROTATION: 'original rotation',
      PERSPECTIVE: 'original perspective',
      CAMERA_ANGLE: 'original camera angle',
      DEPTH_OF_FIELD: 'original depth of field',
      MOTION_BLUR: 'original motion blur if present',
      DIRECTION: constraints.lighting ? `${constraints.lighting} direction` : 'original direction',
      INTENSITY: constraints.lighting ? `${constraints.lighting} intensity` : 'original intensity',
      REFLECTIONS: 'original reflections',
      HIGHLIGHTS: 'original specular highlights',
      SHADOW_SOFTNESS: 'original shadow softness',
      COLOR_BLEED: 'original environmental color bleed',
      OCCLUSIONS: constraints.interactions ? `${constraints.interactions} occlusions` : 'original occlusions',
      OVERLAPPING_EFFECTS: constraints.interactions ? `${constraints.interactions} effects` : 'original overlapping effects',
      TRANSPARENCY: 'original transparency',
      STYLE_CHANGES: `stylistic changes for ${editIntent.targetType}`,
      DO_NOT_ALTER: constraints.doNotAlter || 'background, untouched UI elements, image metadata',
      DO_NOT_INTRODUCE: constraints.doNotIntroduce || 'hybrid visual styles, placeholder elements, degraded quality',
      TARGET_CHANGE: `${editIntent.targetObject} converted from ${editIntent.sourceType} to ${editIntent.targetType}`,
    };

    // Build prompt by filling all rules
    const ruleTexts = [];
    const appliedRuleIds = [];

    rules.forEach((rule) => {
      try {
        const filledRule = fillRule(rule, allVariables);
        ruleTexts.push(`${rule.id}. [${rule.name}] ${filledRule}`);
        appliedRuleIds.push(rule.id);
      } catch (error) {
        log('warn', `Failed to apply rule ${rule.id}: ${error.message}`);
      }
    });

    const promptHeader = `EDIT DIRECTIVE: Convert ${editIntent.targetObject} from ${editIntent.sourceType} to ${editIntent.targetType}\n\nRULE SET:\n`;
    const prompt = promptHeader + ruleTexts.join('\n\n');

    log('info', `Built prompt with ${appliedRuleIds.length} rules applied`);

    return {
      prompt,
      rulesApplied: appliedRuleIds,
    };
  } catch (error) {
    log('error', `Failed to build prompt: ${error.message}`);
    throw error;
  }
}

module.exports = {
  loadRuleTemplate,
  fillRule,
  buildPrompt,
};

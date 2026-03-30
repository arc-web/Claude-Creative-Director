# Creative Director Agent - Phase 1a

Advanced AI-powered image editing orchestration system for consistent, rule-based creative transformations. Converts high-level edit intents into detailed, constraint-aware prompts for generative image models.

## Quick Start

### Installation

```bash
# Clone repository
cd ~/agents/creative-director

# Install dependencies
npm install

# Set environment variable
export REPLICATE_API_TOKEN=your_token_here
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/e2e-mock.test.js

# Run with coverage
npm test -- --coverage

# Watch mode for development
npm run dev
```

### Basic Usage

```javascript
const { buildPrompt } = require('./src/prompt-builder');
const { assessQuality } = require('./src/quality-assessor');

// Define edit intent
const editIntent = {
  targetObject: 'iPhone device mockup',
  editType: 'device swap',
  sourceType: 'iOS',
  targetType: 'Android',
  removeMarkers: 'iOS design language',
  applyMarkers: 'Material Design 3'
};

// Define constraints
const constraints = {
  preserveElements: 'app layout, screen dimensions',
  position: 'center of frame',
  scale: 'device at 100% scale',
  lighting: 'studio lighting at 45 degrees',
  interactions: 'all touch targets',
  doNotAlter: 'background, photo quality',
  doNotIntroduce: 'iOS patterns, Apple branding'
};

// Build prompt
const prompt = buildPrompt(editIntent, constraints);
console.log(prompt.prompt);
```

## Architecture

```
Creative Director Agent Workflow:

┌─────────────────┐
│   Edit Intent   │
│  + Constraints  │
└────────┬────────┘
         │
         v
┌──────────────────────┐
│  Prompt Builder      │
│  - Load rules        │
│  - Fill variables    │
│  - Assemble prompt   │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Generated Prompt    │
│  (12 rules applied)  │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Quality Assessor    │
│  - Validate constraints
│  - Score metrics     │
│  - Generate report   │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Assessment Result   │
│  + Success Factors   │
│  + Confidence Score  │
│  + Concerns          │
└──────────────────────┘
```

## Files & Purposes

### Source Files (`src/`)

- **prompt-builder.js** - Core orchestration: loads rule templates, fills variable placeholders, assembles complete prompt with all 12 rules
- **quality-assessor.js** - Quality validation: evaluates constraints, computes confidence scores, identifies success factors and concerns
- **replicate-client.js** - API integration: sends prompts to Replicate, polls for results, handles retries
- **image-handler.js** - Image processing: downloads outputs, applies post-processing, validates quality
- **orchestrator.js** - Workflow engine: coordinates all components, manages state, logs results
- **rule-template.json** - Rule definitions: 12 editing rules with variable placeholders and descriptions
- **utils.js** - Helper functions: string manipulation, validation, formatting

### Test Files (`tests/`)

- **e2e-mock.test.js** - End-to-end workflow test: iPhone-to-Android example with full prompt and quality assessment (no API calls)
- **prompt-builder.test.js** - Unit tests for prompt building logic and rule application
- **quality-assessor.test.js** - Unit tests for quality assessment and constraint validation
- **replicate-client.test.js** - Unit tests for API integration
- **image-handler.test.js** - Unit tests for image processing
- **integration.test.js** - Multi-component integration tests

### Configuration

- **jest.config.js** - Jest test runner configuration
- **package.json** - Dependencies and scripts
- **.env** - Environment variables (see below)

## Environment Variables

### Required

- `REPLICATE_API_TOKEN` - Replicate API authentication token
  - Get from: https://replicate.com/account
  - Required for image generation workflows
  - Not required for testing (uses mocks)

### Optional

- `DEBUG` - Set to `true` for verbose logging
- `REPLICATE_TIMEOUT` - API timeout in seconds (default: 300)
- `LOG_LEVEL` - Logging verbosity (debug, info, warn, error)

## Invoking from Claude Code

### Direct Script Invocation

```bash
# From Claude Code conversation
/execute npm test -- tests/e2e-mock.test.js

# Run all tests with coverage
/execute npm test -- --coverage

# Run specific workflow
/execute node src/orchestrator.js
```

### Programmatic Usage

```bash
# In your Claude Code task
const creative = require('~/agents/creative-director/src/prompt-builder');
const assessment = require('~/agents/creative-director/src/quality-assessor');

// Use functions directly
const result = creative.buildPrompt(intent, constraints);
```

## The 12 Rules

All creative transformations apply these rules consistently:

1. **Edit Scope Isolation** - Confine edits to target object
2. **Spatial Anchoring** - Maintain position and alignment
3. **Geometry + Optics** - Preserve physical proportions
4. **Lighting + Material Fidelity** - Match light and surfaces
5. **Environmental Interaction** - Proper shadow and reflection
6. **Structural Parity** - Maintain hierarchy and layout
7. **Identity Replacement** - Swap design systems cleanly
8. **Negative Constraints** - Eliminate forbidden patterns
9. **Pixel Fidelity** - Maintain image resolution and clarity
10. **Photorealism** - Ensure realistic appearance
11. **Consistency Pass** - Unified style throughout
12. **Output Quality Threshold** - Meet minimum quality standards

## Testing Strategy

### Unit Tests
- Individual function behavior
- Edge cases and error handling
- Input validation

### Integration Tests
- Multi-component workflows
- Data flow between modules
- State management

### E2E Mock Tests
- Complete workflows without external APIs
- Realistic edit scenarios (iPhone-to-Android)
- Quality assessment validation

### External API Tests (Requires Token)
- Real Replicate integration
- Image generation results
- Error handling

Run mocks only: `npm test`
Run all tests: `npm test -- --testPathIgnorePatterns=integration`

## Phase 2 Preview

### Planned Features

- **Multi-image workflows** - Apply edits to image sequences with consistency
- **Version control** - Track prompt changes and compare results
- **Batch processing** - Queue multiple edits with priority management
- **Feedback loop** - Assess results and auto-refine prompts
- **Custom rules** - User-defined rules and constraint templates
- **Performance analytics** - Track metrics across many edits
- **Collaborative mode** - Share and review edits with team
- **Model selection** - Support multiple generative models beyond Replicate

### Extension Points

The agent is designed for extension:

- Add new rules to `src/rule-template.json`
- Extend assessor with custom metrics in `src/quality-assessor.js`
- Integrate additional image models in `src/replicate-client.js`
- Add preprocessing/postprocessing in `src/image-handler.js`

## Development

### Code Style

- ESLint configured for consistency
- Follows Airbnb JavaScript style guide
- Strict mode enabled

```bash
npm run lint
npm run lint -- --fix
```

### Debugging

Enable verbose logging:

```bash
DEBUG=* npm test -- tests/e2e-mock.test.js
```

### Contributing

Workflow for changes:

1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Run full test suite
5. Verify coverage maintained
6. Commit with clear message

## API Reference

### buildPrompt(editIntent, constraints)

Builds a complete prompt with all 12 rules applied.

**Parameters:**
- `editIntent` (object) - What to edit: targetObject, editType, sourceType, targetType, removeMarkers, applyMarkers
- `constraints` (object) - How to edit: preserveElements, position, scale, lighting, interactions, doNotAlter, doNotIntroduce

**Returns:**
```javascript
{
  prompt: "Complete prompt text with all rules",
  rulesApplied: [1, 2, 3, ..., 12],
  timestamp: "2026-03-27T10:30:00Z"
}
```

### assessQuality(constraints, editIntent, metrics)

Assesses quality of an edit against constraints.

**Parameters:**
- `constraints` (object) - Edit constraints and requirements
- `editIntent` (object) - Original and edited content with reason
- `metrics` (object) - Quality scores (0-100) for grammar, tone, brand_voice, audience, originality, cta_strength, engagement, performance

**Returns:**
```javascript
{
  meets_constraints: true,
  confidence_score: 92,
  success_factors: ["Grammar Quality", "Tone Consistency", ...],
  concerns: [],
  rule_assessments: [
    {ruleId: 1, passed: true, reason: "..."},
    ...
  ],
  timestamp: "2026-03-27T10:30:00Z"
}
```

## FAQ

**Q: Can I run tests without API token?**
A: Yes. Unit and E2E mock tests run without tokens. Integration tests require REPLICATE_API_TOKEN.

**Q: How long does a typical edit take?**
A: Mocked tests <100ms. Real API calls typically 30-60 seconds depending on model queue.

**Q: Can I customize the 12 rules?**
A: Phase 1a uses fixed rules. Phase 2 will support custom rule sets.

**Q: What models does this support?**
A: Phase 1a targets Replicate's image generation APIs. Phase 2 will support additional providers.

**Q: How is data stored?**
A: Results are logged to stdout. Phase 2 will add database persistence.

## License

Proprietary - ARC Internal Use Only

## Support

For issues or questions:
- Check existing issues in task tracker
- Review test cases for usage examples
- Consult Phase 1a design doc in project files

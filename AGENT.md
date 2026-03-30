# Creative Director Agent

A specialized image editing orchestrator that optimizes prompts for Replicate's image generation models.

## Capabilities

- **Parse image editing requests** from natural language
- **Optimize prompts** using a 12-point constraint rule set
- **Iteratively refine** prompts with user feedback before API calls
- **Submit to Replicate API** for generation
- **Assess quality** against original constraints
- **Save results** to ~/Desktop/image-creator/
- **Return full metadata** (prompt, assessment, reasoning)

## Input Format

User provides:
- Image path or URL (e.g., "~/Desktop/photo.jpg" or uploaded)
- Edit intent (e.g., "change iPhone to Android")
- Optional constraints (e.g., "keep background exactly the same")

## Output Format

```json
{
  "image_path": "/Users/home/Desktop/image-creator/2026-03-30-iphone-to-android.png",
  "prompt_used": "Replace only the smartphone device...",
  "model_used": "replicate/flux-dev",
  "quality_assessment": {
    "meets_constraints": true,
    "success_factors": ["device hardware correct", "lighting preserved"],
    "concerns": ["slight edge blur on bezel"]
  },
  "reasoning": "Device replacement successful with 95% constraint adherence. Light interactions preserved correctly."
}
```

## Invocation

- Triggered by natural language: "edit this image to X", "create an image showing X"
- Can request prompt approval before generation
- Supports iteration: user can ask to refine prompt without re-generating

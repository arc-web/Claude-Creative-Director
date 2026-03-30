# Image Editing Rule Set - Prompt Template System

This is a structured template system for optimizing image editing prompts. Fill in the sections based on the user's specific request.

## Template: Edit Scope Isolation

**Rule 1 - Scope Definition**
```
Edit ONLY [TARGET_OBJECT]. Preserve [ALL_NON_TARGET_ELEMENTS] with zero deviation.
```

**Example:**
```
Edit ONLY the smartphone. Preserve background, text, lighting, layout with zero deviation.
```

---

## Template: Spatial Anchoring

**Rule 2 - Spatial Constraints**
```
Maintain exact position, scale, rotation, perspective, and bounding box footprint. The replacement must align perfectly to the original silhouette.
```

**Specific values to inject:**
- Original position: [X, Y coordinates or description]
- Scale: [keep identical]
- Rotation: [degrees, if any]
- Perspective: [camera angle notes]

---

## Template: Geometry + Optics

**Rule 3 - Camera & Lens**
```
Preserve original camera angle, perspective, depth of field, motion blur (if present). No distortion or flattening.
```

---

## Template: Lighting + Material Fidelity

**Rule 4 - Lighting Consistency**
```
Match original lighting: direction [DIRECTION], intensity [HIGH/MID/LOW], reflections [TYPE], specular highlights [LOCATION], shadow softness [SOFT/HARD], environmental color bleed [COLOR].
```

---

## Template: Environmental Interaction

**Rule 5 - Interactions**
```
Preserve all object interactions: occlusions, overlapping effects (light streaks, glow, particles), transparency. Ensure effects pass through/around object identically.
```

---

## Template: Structural Parity

**Rule 6 - Layout Preservation**
```
Preserve internal structure/layout. Only modify stylistic layer: [STYLE_CHANGES]. Prevent layout drift.
```

---

## Template: Identity Replacement

**Rule 7 - Identity Transformation**
```
Remove: [SOURCE_IDENTITY_MARKERS]
Apply: [TARGET_IDENTITY_MARKERS]
Avoid hybrid artifacts or mixed design languages.
```

**Example (iPhone->Android):**
```
Remove: notch, dynamic island, iOS UI elements, Apple-specific design language
Apply: Android-style bezel, punch-hole camera, Android system UI, Material Design elements
```

---

## Template: Negative Constraints (Failure Prevention)

**Rule 8 - What NOT to Change**
```
Do NOT alter: [LIST]. Do NOT introduce: [LIST].
```

**Common negatives:**
- Do NOT change: background, text, layout, color grading
- Do NOT introduce: warping, artifacts, cropping shifts, additional elements

---

## Template: Pixel Fidelity

**Rule 9 - Fidelity Enforcement**
```
Ensure pixel-perfect preservation outside edited region. Zero deviation globally except target object.
```

---

## Template: Photorealism

**Rule 10 - Realism Requirement**
```
Seamless, photorealistic integration. No visible edit seams or AI artifacts.
```

---

## Template: Consistency Pass

**Rule 11 - Visual Uniformity**
```
Match grain/noise, sharpness, edge blending. Ensure uniformity across entire image.
```

---

## Template: Output Quality Threshold

**Rule 12 - Success Criterion**
```
Final image must be indistinguishable from original except for: [TARGET_CHANGE]. Production-grade realism.
```

---

## How to Use This Template

1. For each rule, read the template section
2. Fill in the bracketed placeholders with the user's specific values
3. Combine all filled rules into one comprehensive prompt
4. Show the compiled prompt to user for approval before submitting to Replicate
5. After generation, assess quality against each rule to generate the assessment report

# A11y Remediation Assistant (ARA)

> **"Don't just find the bug. Fix the bug. Verify the fix. Document the evidence."**

## Overview

**A11y Remediation Assistant (ARA)** is an AI-powered remediation engine designed to bridge the gap between *identifying* accessibility (Section 508 / WCAG) violations and *safely fixing them with audit-ready evidence*.

Traditional accessibility tools (Lighthouse, axe-core, etc.) excel at *detecting* violations but fall short on remediation guidance, context awareness, and traceability. ARA intentionally does **not** replace those tools. Instead, it operates one layer above them—acting as a senior accessibility engineer who explains issues in plain language, proposes context-aware fixes, validates outcomes with deterministic tools, and produces artifacts suitable for audits and compliance reviews.

**Project Goal:**
Explore how AI agents can assist with *accessibility remediation*—not compliance judgment—while maintaining strict boundaries between probabilistic AI reasoning and deterministic verification.

---

## Core Principles

1. **Deterministic tools detect and verify** (axe-core, Lighthouse)
2. **AI explains, proposes, and educates**—never certifies compliance
3. **Humans approve and test** before compliance claims are made
4. **Every fix must be traceable** to WCAG / Section 508 criteria

These principles form ARA’s legal, ethical, and architectural foundation.

---

## Core Capabilities

ARA functions as a **Translator**, **Surgeon**, **Validator**, and **Documentarian**.

### 1. Jargon-to-English Translation (The "Why")

Accessibility reports often cite opaque rules (e.g., *WCAG 2.1 SC 1.3.1*).

**ARA’s Approach:**

* Reads the rule, violation, and surrounding code context
* Explains the issue in plain, human terms
* Explicitly ties the explanation back to user impact

**Example:**

> *Instead of:* "Form element missing label"
>
> *ARA explains:* "This input asks for a name, but screen reader users only hear ‘edit text’. The visual label is not programmatically associated, so assistive technology cannot identify the field’s purpose."

---

### 2. Context-Aware Code Repair (The "How")

ARA proposes fixes with full awareness of component structure, interaction patterns, and framework conventions.

**Context Analysis Includes:**

* Parent element hierarchy and landmarks
* Keyboard focus flow
* Validation and error message relationships
* Detected framework and component library (React, Angular, MUI, etc.)

**Multiple Fix Strategies Are Ranked:**

```json
{
  "strategies": [
    {
      "approach": "semantic_html",
      "effort": "high",
      "impact": "best_practice",
      "description": "Refactor to native <button> element",
      "requires": "refactor"
    },
    {
      "approach": "aria_patch",
      "effort": "low",
      "impact": "minimum_compliant",
      "description": "Add role and keyboard handlers",
      "requires": "retrofit_only"
    }
  ]
}
```

> **Bias Rule:** Framework-native and semantic solutions are always preferred over custom ARIA patches.

---

### 3. Validation Loop (The "Proof")

AI-generated fixes are never assumed correct.

**Validation Steps:**

1. Re-run deterministic scanners
2. Detect regressions or newly introduced violations
3. Classify validation coverage (not just pass/fail)

```json
{
  "validation": {
    "status": "verified",
    "automated_coverage": "partial",
    "confidence": 0.78,
    "deterministic_scan": "passed",
    "new_errors_introduced": 0,
    "manual_testing_required": [
      "keyboard navigation",
      "screen reader announcement"
    ]
  }
}
```

> **Important:** A passed automated scan does *not* imply full compliance.

---

### 4. Human-in-the-Loop Flags

Some criteria cannot be objectively validated by machines:

* Meaningful alt text
* Logical reading order
* Visual-only cues
* Complex focus management

ARA explicitly flags these:

```json
"requires_human_validation": true
```

With step-by-step testing instructions.

---

### 5. Priority Classification System

Issues are classified by **user impact**, not raw WCAG severity.

* **Critical:** Blocks access entirely (keyboard traps)
* **High:** Major usability barriers (missing labels)
* **Medium:** Degrades experience (missing landmarks)
* **Low:** Best-practice improvements

---

### 6. Empathy & Mental Model Simulator (Heavily Guarded)

This feature exists solely for education.

**Constraints:**

* Labeled as *Approximate Mental Model*
* Always paired with real assistive technology testing steps
* Never presented as authoritative output

```text
Approximate Screen Reader Mental Model:
Before: "Clickable, group"
After: "Submit Order, button"

NOTE: This is not a real screen reader transcript.
```

---

### 7. Design Smell Detection (Non-Fixable by Code)

ARA can identify **accessibility risks caused by design**, not implementation.

```json
"design_flag": {
  "type": "usability_risk",
  "description": "Form complexity likely impairs accessibility even if technically compliant",
  "requires_ux_review": true
}
```

ARA does **not** propose fixes for these—only flags them.

---

### 8. Regression Test Generator

ARA generates automated tests to prevent regressions.

```js
test('submit button has accessible name', () => {
  const button = screen.getByRole('button', { name: /submit order/i });
  expect(button).toBeVisible();
});
```

---

## Audit Trace & Compliance Mapping

Every fix includes explicit traceability:

```json
"audit_trace": {
  "wcag": ["1.3.1", "3.3.2"],
  "section_508": ["302.1", "302.3"],
  "evidence": [
    "axe-core pass",
    "manual testing instructions provided"
  ]
}
```

This enables:

* Auditor review
* Compliance documentation
* Historical tracking

---

## Architecture High-Level

### Input Layer

* Deterministic scan output (axe-core)
* Relevant code snippet only
* Component context

> **ARA never scans independently.**

---

### Classification Layer

Issues are routed by complexity:

* **Simple:** Template-based fix (no LLM)
* **Moderate:** Focused-context LLM
* **Complex:** Full component analysis
* **Requires Redesign:** Flag only

---

### Processing Layer (Multi-Agent)

* **Analyzer:** Understands violations and context
* **Strategist:** Ranks remediation approaches
* **Coder:** Generates framework-native fixes
* **Validator:** Runs scans and classifies coverage
* **Educator:** Explains and documents rationale
* **Test Generator:** Writes regression tests

---

### Output Layer

A single structured, audit-ready object combining:

* Explanation
* Fix options
* Validation evidence
* Compliance mapping
* Human testing steps

---

## Security & Safety Constraints

ARA enforces hard rules:

* No network calls added by fixes
* No runtime-generated ARIA
* No DOM manipulation outside framework patterns
* No changes that obscure underlying UX problems

---

## Roadmap

### Phase 0: Baby Step

- [ ] Explicit `<label for>` associations
- [ ] `aria-describedby` for error messages
- [ ] React + HTML only
- [ ] Single fix strategy
- [ ] One validation pass

### Phase 1: Proof of Concept

- [ ] Build form-only validator (labels, fieldsets, error messages)
- [ ] Implement single-agent fix generator
- [ ] Test with real form components

### Phase 2: Core Infrastructure

- [ ] Define JSON Input/Output schemas
- [ ] Build deterministic scanner integration (axe-core)
- [ ] Implement validation loop
- [ ] Create System Prompts with WCAG constraints

### Phase 3: Translation Module

- [ ] Build "Translator" agent (Error → Plain English)
- [ ] Add priority classification system
- [ ] Create empathy simulator with disclaimers
- [ ] Generate testing instructions

### Phase 4: Remediation Module

- [ ] Build "Surgeon" agent (Broken Code → Fixed Code)
- [ ] Implement context analysis (component tree, landmarks)
- [ ] Add fix strategy ranking system
- [ ] Integrate component library detection

### Phase 5: Multi-Agent Architecture

- [ ] Split into specialized agents (Analyzer, Strategist, Coder, Validator, Educator)
- [ ] Implement agent communication protocol
- [ ] Add feedback loop for continuous improvement
- [ ] Optimize token usage (caching, tiered models)

### Phase 6: Validation & Quality

- [ ] Build automated re-scanning after fixes
- [ ] Implement confidence scoring
- [ ] Create regression test generator
- [ ] Add human-validation flagging for edge cases

### Phase 7: User Interface

- [ ] Create simple web UI to demonstrate workflow
- [ ] Build VS Code extension (MVP)
- [ ] Add CLI tool for local development
- [ ] Implement CI/CD integration (GitHub Actions)

### Phase 8: Scale & Expand

- [ ] Add support for Vue, Angular, Svelte
- [ ] Expand beyond forms (buttons, navigation, images)
- [ ] Create specialized dynamic component handlers
- [ ] Build design system component generator

---

## Open Questions

1. **Validation Strategy for Subjective Criteria:**
   - How to validate alt text is "meaningful" without human review?
   - Possible solution: Generate multiple options, flag for human selection

2. **Handling Framework-Specific Patterns:**
   - Should we have separate agents per framework (React, Vue, Angular)?
   - Or a unified agent with framework-aware prompts?

3. **Version Control Integration:**
   - How to track fix history across branches?
   - How to handle merge conflicts in fixed files?

4. **Performance at Scale:**
   - What's the threshold for batch processing vs. real-time?
   - How to handle 1000+ violations in a large codebase?

5. **Training Data Sources:**
   - Can we build few-shot examples from public accessible component libraries?
   - How to stay current as WCAG evolves (2.2 → 3.0)?

## Philosophy & Disclaimer

ARA does **not** certify accessibility compliance.

* Automated tools detect and verify
* AI assists remediation
* Humans validate and approve

Final responsibility always remains with the development team.

---

## License & Attribution

Educational and exploratory project.

Acknowledgments:

* WCAG (W3C)
* Section 508
* axe-core
* Lighthouse

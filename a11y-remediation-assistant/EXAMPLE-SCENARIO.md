# A11y Remediation Assistant (ARA)

## End-to-End Remediation Walkthrough

This document provides a **concrete, end-to-end example** of how A11y Remediation Assistant (ARA) operates in practice—from deterministic detection to audit-ready remediation artifacts.

The purpose of this walkthrough is to:

* Make ARA’s boundaries explicit
* Demonstrate how AI assists (but does not certify) accessibility work
* Show the exact evidence produced for compliance and audit scenarios

---

## Scenario

A React form contains a text input with visible label text, but the label is **not programmatically associated** with the input.

**User Impact:**
Screen reader users hear "edit text" with no context. The field’s purpose is unclear, increasing error rates and frustration.

---

## Step 1: Deterministic Detection

`axe-core` runs during a pull request or CI build.

**axe-core JSON Output (Excerpt):**

```json
{
  "id": "label",
  "impact": "serious",
  "tags": ["wcag2a", "wcag131", "section508"],
  "description": "Form elements must have labels",
  "nodes": [
    {
      "html": "<input type=\"text\" id=\"firstName\">",
      "target": ["#firstName"]
    }
  ]
}
```

ARA **does not scan, reinterpret, or override** this result. It consumes the output as authoritative input.

---

## Step 2: Input to ARA

ARA receives:

* Raw axe-core JSON
* The relevant component snippet
* Minimal surrounding DOM context

```tsx
export function UserForm() {
  return (
    <form>
      <div>
        <span>First name</span>
        <input id="firstName" type="text" />
      </div>
    </form>
  );
}
```

Only the smallest amount of code required to understand the issue is provided.

---

## Step 3: Issue Classification

ARA classifies the issue before invoking AI remediation:

* **Complexity:** Moderate
* **Pattern:** Missing explicit label association
* **Routing Decision:** Focused-context LLM remediation

No design review or full component analysis is required.

---

## Step 4: Explanation (Translator Agent)

ARA generates a plain-English explanation tied to user impact:

> "This input visually appears to have a label, but the text is not programmatically connected to the input. Screen readers rely on that connection to announce what the field is for. Without it, users hear ‘edit text’ with no context."

This explanation is intended for developers, reviewers, and audit documentation.

---

## Step 5: Remediation Strategy (Strategist Agent)

ARA proposes remediation strategies ranked by effort and impact.

```json
{
  "strategies": [
    {
      "approach": "semantic_html",
      "effort": "low",
      "impact": "best_practice",
      "description": "Use a <label> element with htmlFor"
    }
  ]
}
```

In Phase 0, ARA deliberately offers **a single, best-practice fix** to reduce risk.

---

## Step 6: Code Fix Generation (Coder Agent)

**Proposed Fix:**

```tsx
export function UserForm() {
  return (
    <form>
      <div>
        <label htmlFor="firstName">First name</label>
        <input id="firstName" type="text" />
      </div>
    </form>
  );
}
```

Characteristics of this fix:

* Uses native HTML semantics
* Aligns with React conventions
* Introduces no ARIA attributes
* Minimizes behavioral risk

---

## Step 7: Deterministic Re-Validation

After the fix, axe-core is run again.

```json
{
  "validation": {
    "status": "verified",
    "automated_coverage": "high",
    "confidence": 0.92,
    "deterministic_scan": "passed",
    "new_errors_introduced": 0,
    "manual_testing_required": []
  }
}
```

A passing scan is treated as **necessary but not sufficient** for compliance claims.

---

## Step 8: Audit Trace Generation

ARA generates traceable compliance evidence:

```json
{
  "audit_trace": {
    "wcag": ["1.3.1"],
    "section_508": ["302.1"],
    "evidence": [
      "axe-core violation resolved",
      "semantic label association implemented"
    ]
  }
}
```

This artifact supports audits, documentation, and historical tracking.

---

## Step 9: Regression Test Generation

ARA produces a test to prevent regression:

```ts
test('first name input has accessible label', () => {
  render(<UserForm />);
  const input = screen.getByLabelText(/first name/i);
  expect(input).toBeInTheDocument();
});
```

This ensures future changes do not silently reintroduce the violation.

---

## Step 10: Human Verification (Recommended)

ARA generates manual testing guidance:

* **NVDA + Chrome:** Tab to the input. It should announce "First name, edit text"
* **Keyboard-only:** A visible focus indicator should be present

Human validation is always required for final compliance claims.

---

## Final Output Summary

ARA returns a single structured object containing:

* Plain-English explanation
* Code fix
* Deterministic validation results
* WCAG / Section 508 mapping
* Regression test
* Manual testing instructions

This output can be attached to:

* Pull request comments
* CI/CD quality gates
* Accessibility audit documentation

---

## Key Takeaway

ARA does not determine compliance.
ARA does not replace accessibility testing.

ARA **accelerates remediation while preserving human responsibility and audit integrity**.

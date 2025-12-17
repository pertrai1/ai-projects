# A11y Remediation Assistant (ARA)

## Governance, Risk, and Compliance Model

This document defines the **governance framework** for A11y Remediation Assistant (ARA). It establishes clear boundaries for how AI is used, how risk is controlled, and how outputs remain defensible in audits and regulated environments.

ARA is intentionally designed **not** as an accessibility certifier, but as a remediation assistant operating under strict constraints.

---

## 1. Governance Objectives

ARA’s governance model exists to ensure:

* AI **does not make compliance determinations**
* Deterministic tools remain the source of truth for detection and verification
* Human responsibility is preserved at all decision points
* Outputs are traceable, reviewable, and auditable
* Risk introduced by AI-generated code is minimized

---

## 2. Explicit Non-Goals

ARA will **not**:

* Certify WCAG or Section 508 compliance
* Replace manual assistive technology testing
* Make UX or design decisions
* Override deterministic accessibility tools
* Apply fixes automatically without human approval

These non-goals are enforced by architecture, not policy alone.

---

## 3. Responsibility Boundaries

| Actor                      | Responsibility                                    |
| -------------------------- | ------------------------------------------------- |
| Deterministic Tools        | Detect and verify accessibility violations        |
| ARA (AI)                   | Explain issues, propose fixes, generate artifacts |
| Developers                 | Review, approve, and apply fixes                  |
| Testers / A11y Specialists | Perform manual validation                         |
| Organization               | Claim compliance and accept risk                  |

ARA never occupies the final decision-making role.

---

## 4. AI Usage Constraints

ARA enforces hard technical limits on AI behavior:

* AI outputs are **advisory only**
* No compliance language is generated (e.g., “passes WCAG”)
* All outputs are structured, not free-form
* Prompts are constrained to relevant context only
* AI cannot bypass deterministic validation steps

These constraints reduce hallucination risk and overreach.

---

## 5. Deterministic Verification First and Last

ARA relies on deterministic tools at two points:

1. **Initial Detection** – axe-core, Lighthouse
2. **Post-Fix Verification** – re-scanning after remediation

AI is never allowed to:

* Disagree with scan results
* Downgrade severity
* Declare issues resolved without verification

---

## 6. Validation Coverage Model

ARA distinguishes between **validation success** and **validation completeness**.

Each fix includes a coverage classification:

* **High Coverage:** Deterministic rules fully validate the fix
* **Partial Coverage:** Some aspects require human testing
* **Low Coverage:** Automated validation is insufficient

This prevents false confidence from automated scans alone.

---

## 7. Human-in-the-Loop Enforcement

Certain criteria always require human validation:

* Meaningfulness of alt text
* Logical reading order
* Focus management across dynamic UI
* Visual-only indicators (color, layout)

ARA flags these explicitly and generates testing instructions.

Human review is mandatory before compliance claims.

---

## 8. Audit Traceability

Every remediation includes an **audit trace object** containing:

* WCAG success criteria addressed
* Section 508 mappings
* Deterministic evidence (scan results)
* Human testing requirements

This enables:

* External audits
* Internal compliance reviews
* Historical traceability

---

## 9. Security & Code Safety Controls

ARA-generated fixes must comply with strict safety rules:

* No new network calls
* No runtime-generated ARIA
* No DOM manipulation outside framework patterns
* No suppression of accessibility warnings
* No changes that mask underlying UX problems

Unsafe suggestions are rejected before output.

---

## 10. Data Handling & Privacy

ARA follows conservative data-handling principles:

* Only minimal code context is shared with AI models
* No full repositories are transmitted by default
* No user data or PII is required
* No scan results are retained without consent

These controls support use in regulated environments.

---

## 11. Model Selection & Cost Governance

Model usage is governed by risk and complexity:

* Template fixes: No AI invocation
* Moderate issues: Smaller, constrained models
* Complex issues: Higher-capability models with stricter prompts

This reduces cost, latency, and exposure.

---

## 12. Change Management

ARA outputs are designed to integrate with existing workflows:

* Changes are reviewed via pull requests
* Fix history is tracked via version control
* Rollbacks follow standard development practices

ARA does not bypass organizational change controls.

---

## 13. Failure Modes & Risk Mitigation

Known risks include:

* Over-reliance on automated validation
* Misinterpretation of empathy simulations
* Incorrect application of AI-suggested fixes

Mitigations:

* Coverage classification
* Mandatory human review
* Clear disclaimers
* Conservative MVP scope

---

## 14. Accountability Statement

ARA assists remediation.

It does not determine compliance.
It does not accept legal risk.
It does not replace human expertise.

Final accountability always remains with the organization deploying the software.

---

## 15. Governance Summary

ARA is governed by the principle that **accessibility is a human responsibility augmented—not replaced—by AI**.

The system is intentionally conservative, transparent, and auditable to support real-world compliance needs without introducing unacceptable risk.

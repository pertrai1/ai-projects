# ROADMAP — Interviewer-as-a-Person

This roadmap reflects the **current state of the system**, informed by the existing
`start_interview.py` interview orchestrator, and evolves it into a lifelike,
multi‑mode interview loop with voice, video presence, and rigorous evaluation.

Each phase is **independently valuable**, intentionally scoped, and designed to
increase realism **without compromising control, determinism, or learning value**.

---

## Guiding Principles

- Interviews are **roles**, not conversations
- Interview modes are **first‑class concepts**
- Feedback is **delayed and explicit**
- Silence and pacing are intentional
- Evaluation quality > surface realism

---

## Phase 0 — Session‑Level Interview Orchestration (Established)

**Goal:** Deterministic, repeatable interview sessions across multiple modes

This phase already exists in foundational form and serves as the backbone for all
future realism improvements.

### Scope
- CLI‑driven interview entry point
- Support for multiple interview modes:
  - Coding
  - Systems design
  - Behavioral
  - Full loop (sequential execution)
- Session‑level aggregation of results
- Optional automatic evaluation
- Explicit success/failure semantics

### Deliverables
- Session orchestrator (current `start_interview.py` lineage)
- Per‑mode execution contracts
- Final session summary
- Provider‑agnostic interview logic

### Exit Criteria
- Full interview loops run unattended
- Modes can be reordered or extended
- Evaluation output is consistent and explainable

---

## Phase 1 — Voice‑Only Interview Loop

**Goal:** Replace keyboard interaction with spoken interviews while preserving
existing orchestration.

### Scope
- Text‑to‑Speech (TTS) for interviewer questions
- Speech‑to‑Text (STT) for candidate responses
- Silence detection and timing enforcement
- Voice‑driven execution of **existing interview modes**

### Explicit Non‑Goals
- No video
- No live critique
- No interruption during candidate thinking

### Deliverables
- STT adapter (e.g., Whisper)
- TTS adapter with neutral professional voice
- Turn‑taking and silence window logic
- Voice transcripts as artifacts

### Exit Criteria
- Entire multi‑mode session can run hands‑free
- Transcription accuracy is acceptable
- Interview pressure is preserved

---

## Phase 2 — Session Conductor + Static Video Presence

**Goal:** Introduce visual presence and session coherence without animation
complexity.

### New Concept: Session Conductor
A lightweight role responsible for:
- Opening the interview session
- Transitioning between interview modes
- Closing the session

This role mirrors real hiring loops and improves realism.

### Scope
- Static interviewer image or idle video loop
- Voice synchronized with visual presence
- Web‑based interview UI
- Distinct visual identity for:
  - Session conductor
  - Interviewers (optional, minimal)

### Explicit Non‑Goals
- No lip sync
- No facial expressions
- No reactive gestures

### Deliverables
- Browser client with audio + video playback
- Media pipeline abstraction
- Stable A/V timing across mode transitions

### Exit Criteria
- Visual presence feels neutral and professional
- Mode transitions feel intentional
- No increase in system nondeterminism

---

## Phase 3 — Talking‑Head Interviewers (Per‑Mode Personas)

**Goal:** Convincing interviewer presence tailored to each interview mode.

### Scope
- Lip‑synced talking‑head video for interviewers
- Buffered video generation per question
- Cached avatar clips
- Distinct interviewer personas per mode:
  - Coding interviewer
  - Systems interviewer
  - Behavioral interviewer

### Explicit Non‑Goals
- No live rendering during speech
- No emotional expression modeling
- No adaptive difficulty

### Deliverables
- Avatar generation pipeline
- Audio‑to‑video alignment logic
- Persona configuration per interview mode

### Exit Criteria
- Lip sync appears natural
- Persona differences are perceptible but restrained
- Users acclimate quickly and remain focused

---

## Phase 4 — Micro‑Reactivity Without Judgment

**Goal:** Add subtle human reactions while preserving interviewer neutrality.

### Scope
- Neutral listening expressions
- Head nods after candidate responses
- Short acknowledgment phrases (e.g., “Okay”, “Understood”)

### Explicit Non‑Goals
- No judgment cues
- No interruption of candidate thinking
- No real‑time feedback

### Deliverables
- Event‑driven reaction triggers
- Pre‑recorded reaction assets
- Strict reaction timing rules

### Exit Criteria
- Reactions feel human but non‑evaluative
- Interview pressure is unchanged
- No coaching signals leak through

---

## Phase 5 — Full Interview Loop Simulation

**Goal:** Near‑real interview experience across an entire session loop.

### Scope
- Real‑time lip sync
- Gaze stability and facial motion smoothing
- Improved avatar fidelity
- Polished transitions across interview modes

### Explicit Non‑Goals
- No emotional intelligence simulation
- No live critique
- No improvisational follow‑ups

### Deliverables
- Real‑time avatar rendering integration
- Latency monitoring and guardrails
- UX polish pass

### Exit Criteria
- Full loop feels comparable to real video interviews
- System remains predictable and testable
- Evaluation output remains unchanged

---

## Optional Future Extensions (Intentionally Deferred)

- Panel interviews with multiple interviewers
- Session‑over‑session progress tracking
- Comparative performance analytics
- Configurable interview loops

These are deferred to prevent scope creep.

---

## Definition of Done

The project is considered successful when:

- Interview sessions feel realistic and focused
- Evaluation output is high‑signal and actionable
- Architecture remains understandable
- Learning goals are clearly met

---

## Final Note

> *Interviews are social systems with structure, silence, and delayed judgment.*

This roadmap is designed to honor that reality.

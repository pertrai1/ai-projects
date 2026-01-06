# Interviewer-as-a-Person

> **A lifelike mock interview system that treats the interviewer as a person, not a chatbot.**

**Interviewer-as-a-Person** is an experimental AI system designed to simulate a realistic technical interview experience using voice, video presence, and structured evaluation. The goal is not to “help” the candidate, but to **faithfully reproduce interview pressure, pacing, and delayed judgment**, followed by clear, actionable feedback.

This project treats the interviewer as a *person with intent, constraints, and professionalism*—not a conversational assistant.

---

## Project Goals

- Simulate **real technical interview conditions**
- Separate **interview execution** from **evaluation**
- Preserve silence, thinking time, and ambiguity
- Provide **high-signal feedback after the interview**
- Explore LLMs as **controlled evaluators**, not collaborators

This is a **learning-first project**, built to deepen understanding of:
- Agent orchestration
- Human-in-the-loop evaluation
- Voice and video interfaces
- Interview signal extraction

---

## Core Philosophy

> *A realistic interview is calm, quiet, and slightly uncomfortable.*

Design principles guiding this project:

- The interviewer **does not help**
- Feedback is **delayed until the end**
- The interviewer speaks **less than the candidate**
- Silence is a feature, not a bug
- Evaluation is structured, explicit, and explainable

---

## High-Level Architecture

```
[ Interview Engine ]
        ↓
[ LLM Interviewer Logic ]
        ↓
[ Voice + Video Presentation Layer ]
```

### Responsibilities

**Interview Engine**
- Owns state, timing, and flow
- Determines when questions are asked
- Enforces constraints and silence windows

**LLM Interviewer**
- Asks questions verbatim
- Produces structured evaluation artifacts
- Never gives hints or feedback mid-interview

**Media Layer**
- Renders interviewer voice and presence
- Handles speech-to-text and text-to-speech
- Provides increasing realism across phases

---

## Features

- Deterministic interview flow driven by Python
- LLM-based interviewer persona with strict constraints
- Voice-based question and answer interaction
- Video interviewer presence (progressively more realistic)
- Automatic transcript capture
- End-of-interview evaluation report
- Scoring across multiple interview dimensions

---

## Repository Structure

```
interviewer-as-a-person/
│
├── interviewer_engine/
│   ├── flow/
│   ├── prompts/
│   ├── llm/
│   ├── evaluation/
│   └── artifacts/
│
├── media_pipeline/
│   ├── stt/
│   ├── tts/
│   ├── avatar/
│   └── sync/
│
├── web_client/
├── api/
│
├── ARCHITECTURE.md
├── ROADMAP.md
└── README.md
```

---

## How an Interview Works

1. The interviewer greets the candidate
2. A technical question is asked verbally
3. The candidate explains their approach aloud
4. Silence and thinking time are preserved
5. The interviewer transitions without feedback
6. At the end, the system generates a structured report

No coaching. No hints. No mid-stream corrections.

---

## Evaluation & Feedback

Feedback is generated **after** the interview and may include:

- Problem understanding
- Communication clarity
- Approach quality
- Handling uncertainty
- Time management
- Overall interview readiness

Reports are stored as artifacts for later review and iteration.

---

## Project Status

This project is under **active development** and structured in phases:

- Phase 1: Voice-only interviewer
- Phase 2: Static video presence
- Phase 3: Talking-head video interviewer
- Phase 4: Micro-reactivity (nods, acknowledgments)
- Phase 5: Near-real interview experience

Detailed milestones are tracked in `ROADMAP.md`.

---

## What This Project Is *Not*

- Not a tutoring system
- Not a conversational chatbot
- Not a live coding helper
- Not optimized for emotional validation

This project intentionally prioritizes **realism over comfort**.

---

## Learning Intent

This repository exists to support **deep learning through building**, including:

- LLM prompt constraint design
- Evaluation rubric engineering
- Agent boundary definition
- Human-computer interaction tradeoffs
- Interview signal vs noise analysis

---

## License

MIT License

---

## Disclaimer

This project simulates interview conditions for practice and learning only.  
It does not guarantee outcomes in real interviews.

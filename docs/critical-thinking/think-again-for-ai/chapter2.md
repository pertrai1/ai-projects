# The Confidence of Generative Text Produced

This comes from chapter 2 of Think Again by Adam Grant, which is a fantastic book about how to be more open-minded and less wrong. I read the book with the intent of how to be more of a critical thinker when working with generative AI and the output that is produced.

## Table of Contents

- [Summary](#sumary)
- [1. Never ask AI for "the answer", ask for a draft you can test](#1-never-ask-ai-for-the-answer-ask-for-a-draft-you-can-test)
- [2. Put confidence in your process, not the first output](#2-put-confidence-in-your-process-not-the-first-output)
- [3. Make the model show its work in useful ways](#3-make-the-model-show-its-work-in-useful-ways)
- [4. Use AI more aggressively when you are uncertain, not less](#4-use-ai-more-aggressively-when-you-are-uncertain-not-less)
- [5. Treat polished output as more dangerous, not less](#5-treat-polished-output-as-more-dangerous-not-less)
- [6. Always run a "what would make this wrong?" pass](#6-always-run-a-what-would-make-this-wrong-pass)
- [7. Split work into generation and verification](#7-split-work-into-generation-and-verification)
- [8. Ask for disagreement on purpose](#8-ask-for-disagreement-on-purpose)
- [9. Keep a calibration loop](#9-keep-a-calibration-loop)
- [10. Don't outsource judgment](#10-dont-outsource-judgment)

## Sumary

Hold these two beliefs at once:
- I can figure this out
- This answer may be wrong

That is the whole game.

Not:
- “The model knows”
- “I know better than the model”
- “AI is useless”
- “AI is magic”

Instead:
- I can use this thing well if I stay skeptical and adaptive

The operating rules

## 1. Never ask AI for “the answer”, ask for a draft you can test

Good prompt:
- “Give me 3 possible approaches and the tradeoffs”
- “What assumptions are you making?”
- “What are the likely failure modes?”
- “What would you verify before shipping this?”

This keeps you out of armchair-quarterback mode.

## 2. Put confidence in your process, not the first output

Your real edge is not “spotting truth instantly”.
It is:
- comparing options
- checking assumptions
- testing edge cases
- iterating quickly

## 3. Make the model show its work in useful ways

Ask for:
- assumptions
- constraints
- alternatives
- tests
- counterexamples
- risks

For code:
- “What could break here?”
- “What edge cases are missing?”
- “What would make this unsafe in production?”
- “Write tests first”

## 4. Use AI more aggressively when you are uncertain, not less

This is the healthy version of impostor syndrome.

If you feel unsure:
- brainstorm with AI
- ask it to critique your plan
- ask it to explain what you may be missing
- ask it to argue the opposite

Uncertainty should trigger exploration, not shutdown.

## 5. Treat polished output as more dangerous, not less

The smoother it sounds, the easier it is to overtrust.
Be extra careful when AI gives:
- elegant explanations
- confident architecture advice
- legal/medical/financial tone
- code that looks clean on first read

Pretty is not proof.

## 6. Always run a “what would make this wrong?” pass

Before accepting an answer, ask:
- What assumptions would invalidate this?
- What cases does this ignore?
- Where is this brittle?
- What evidence would change my mind?

This is the fastest anti-hallucination habit.

## 7. Split work into generation and verification

Use AI in two phases:

Phase 1, generate
- ideas
- outlines
- code drafts
- options

Phase 2, verify
- tests
- diff review
- edge cases
- fact check
- run it
- inspect outputs

Never collapse both phases into “looks good”.

## 8. Ask for disagreement on purpose

Great prompts:
- “Argue against your own recommendation”
- “What’s the strongest criticism of this?”
- “What would a senior engineer object to?”
- “Which part of this answer are you least confident about?”

You want an AI that can self-criticize, not just perform confidence.

## 9. Keep a calibration loop

After important uses, ask:
- What did AI help with well?
- Where did it mislead me?
- What prompt pattern worked?
- What kind of task needs more verification?

That’s how you become dangerous in a good way.

## 10. Don’t outsource judgment

Outsource:
- drafting
- searching
- reframing
- summarizing
- option generation

Do not outsource:
- final accountability
- taste
- risk decisions
- correctness checks in important contexts

A practical workflow

For almost any serious task:

1. Ask for options
2. Ask for assumptions
3. Pick a direction
4. Ask for a concrete draft
5. Stress test it
6. Verify independently
7. Revise
8. Only then trust it

The best one-line rule

Be confident in your ability to interrogate AI, not in AI’s first answer.

If you want to get the most value from AI, build these three habits hard:

- ask for alternatives
- ask what could be wrong
- verify before committing

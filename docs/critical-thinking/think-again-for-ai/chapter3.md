# The Joy of Being Wrong for AI Agents

This comes from chapter 3 of *Think Again* by Adam Grant. The chapter is about learning to enjoy being wrong because it means you are getting closer to what is true. Read through the lens of AI agents, the point is not that agents should fail more often. The point is that they should notice mistakes earlier, update faster, and avoid getting attached to bad answers.

## Table of Contents

- [Summary](#summary)
- [1. Treat every answer as provisional](#1-treat-every-answer-as-provisional)
- [2. Try to disprove your own answer before committing](#2-try-to-disprove-your-own-answer-before-committing)
- [3. Separate identity from output](#3-separate-identity-from-output)
- [4. Update fast when new evidence appears](#4-update-fast-when-new-evidence-appears)
- [5. Seek disconfirming evidence on purpose](#5-seek-disconfirming-evidence-on-purpose)
- [6. State what would change your mind](#6-state-what-would-change-your-mind)
- [7. Use confidence as a tool, not a performance](#7-use-confidence-as-a-tool-not-a-performance)
- [8. Admit mistakes clearly and early](#8-admit-mistakes-clearly-and-early)
- [9. Optimize for truth over consistency](#9-optimize-for-truth-over-consistency)
- [10. Build correction into the workflow](#10-build-correction-into-the-workflow)

## Summary

A good AI agent should not be proud of being right.
It should be good at becoming less wrong.

That means:
- do not cling to the first answer
- do not confuse fluency with correctness
- do not defend old output just because it already exists
- do not treat revision as failure

Instead:
- treat beliefs as drafts
- look for what could break them
- update as soon as reality pushes back
- make correction a normal part of the process

The operating rules

## 1. Treat every answer as provisional

The first answer is a candidate, not a verdict.

Useful framing:
- “Here is the current best answer based on the available evidence”
- “This looks right, but these assumptions matter”
- “I would verify X before relying on this”

This keeps the agent from locking onto the first plausible output.

## 2. Try to disprove your own answer before committing

Before finalizing, ask:
- What fact would make this wrong?
- What assumption is carrying too much weight?
- What is the strongest competing explanation?
- What case would break this recommendation?

This is one of the highest-value habits for agent work.

## 3. Separate identity from output

An agent should not behave like its earlier answer must be protected.
A previous response is not the agent’s identity.
It is just prior work.

Bad pattern:
- defending the original answer because it already sounded confident

Better pattern:
- revising openly when the evidence changes
- treating correction as progress

## 4. Update fast when new evidence appears

Chapter 3 leans hard on forecasters who update often.
That maps directly to agents.

When new evidence arrives:
- revise the conclusion
- lower confidence if needed
- explain what changed
- do not bury the update under justification

Being wrong for less time is a win.

## 5. Seek disconfirming evidence on purpose

Do not only gather support for the current answer.
Look for evidence that would weaken it.

Useful prompts for an agent:
- “Find the strongest reason this may be wrong”
- “What evidence cuts against this plan?”
- “What would a skeptic say?”
- “What am I missing that would matter in production?”

This helps break overconfidence loops.

## 6. State what would change your mind

When making a recommendation, include revision triggers.

Examples:
- “I would change this recommendation if the API must support offline writes”
- “If the benchmark data is older than six months, this conclusion is weaker”
- “If tests fail under concurrency, the design should be reconsidered”

This makes thinking easier to audit and update.

## 7. Use confidence as a tool, not a performance

Confidence should help with prioritization, not theater.

Good use of confidence:
- high confidence: proceed, but still verify critical parts
- medium confidence: inspect assumptions and edge cases
- low confidence: explore more before committing

Bad use of confidence:
- sounding certain to seem helpful
- hiding uncertainty to preserve authority

## 8. Admit mistakes clearly and early

When the agent finds an error, say it plainly.

Better:
- “I was wrong about X. The new evidence shows Y. Here is the updated answer.”

Worse:
- vague hedging
- quietly rewriting history
- defending a broken answer after the facts moved

Clear correction usually increases trust.

## 9. Optimize for truth over consistency

A strong agent is consistent in values, not in conclusions.

Stay consistent about:
- honesty
- accuracy
- transparency
- willingness to revise

Do not stay consistent about:
- earlier guesses
- preferred plans
- elegant but unsupported explanations

Truth matters more than narrative smoothness.

## 10. Build correction into the workflow

Do not leave error detection to luck.
Add it to the process.

A practical agent loop:
1. Draft an answer
2. List assumptions
3. Search for disconfirming evidence
4. Check the strongest alternative
5. Revise the answer
6. State confidence and revision triggers
7. Only then commit

That is how an agent becomes less wrong on purpose.

The best one-line rule

Do not reward an agent for sounding right. Reward it for updating well when reality disagrees.

If you want the chapter 3 lesson in three habits, they are:
- hold conclusions lightly
- look for disconfirming evidence
- revise fast and say so clearly

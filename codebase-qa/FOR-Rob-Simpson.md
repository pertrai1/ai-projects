# Your AI Codebase Companion: A Professor's Guide to Building a RAG System

Hey Rob,

Welcome to your digital workshop. Think of this file as our shared lab notebook. My goal isn't just to build this Codebase Q&A system *for* you, but to build it *with* you, explaining the *why* behind each step. My persona, as you've defined, is a mix of a staff engineer and a computer science professor. We'll tackle this project one phase at a time, focusing on the core concepts that make modern AI systems tick.

Our mission is to build a system that can intelligently answer questions about a codebase. But the real goal is the journey itself—to understand how engineers think, how AI systems are designed, and to learn from the inevitable bugs and breakthroughs along the way.

Let's begin.

---

## Phase 0: Teaching a Computer to Read

Before we can ask questions about code, our system needs to be able to *read* it. But reading code isn't like reading a novel. Code has structure, grammar, and rules. If we treat it as just plain text, we lose all that rich context.

**The Core Concept: Code is Data, Not Just Text**

A human programmer sees functions, classes, and variables. A simple text-reading program just sees a sequence of characters. Our first challenge was to bridge that gap.

**Our Technical Decision: The Abstract Syntax Tree (AST)**

We used a tool called an **Abstract Syntax Tree (AST) parser**.

*   **Analogy:** Think of an AST as a grammar diagram for code. When you were taught that a sentence has a subject, a verb, and an object, you were learning to parse language structurally. An AST does the same for code. It breaks a file down into its constituent parts: `functions`, `classes`, `imports`, `variables`, etc.

Our `ast-parser.ts` is the implementation of this idea. It walks through the code and creates a structured map, turning a flat text file into a hierarchical tree of "code nodes."

**The Lesson:** This is the foundational secret of almost every powerful developer tool, from linters to IDEs. To build intelligent tools for code, you must first understand its structure. We taught our system to stop seeing a wall of text and start seeing the building blocks of a program.

---

## Phase 1: The Art of Chunking (Or, How to Read a Book Without Losing the Plot)

Now that our system can read code structurally, we face a new problem: volume. Large language models (LLMs) have a limited "attention span," known as the **context window**. We can't just hand the LLM an entire codebase and say, "Read this." We have to break it down into smaller, digestible pieces, or **chunks**.

**The Core Concept: Semantic vs. Fixed-Size Chunking**

How we chunk is one of the most critical decisions in a RAG system.

*   **Analogy:** Imagine you're summarizing a book. **Fixed-size chunking** is like tearing the book into perfectly even 100-word scraps. You'll almost certainly tear key sentences and ideas in half. **Semantic chunking**, on the other hand, is like splitting the book by paragraphs or chapters. Each chunk retains a complete, coherent thought.

**Our Experiment & Technical Decision:**

We didn't just pick one method; we tested them. Our `phase-1-experiment` compared different strategies. The results, stored in `phase-1-results.json`, revealed a classic engineering trade-off:

1.  **Fixed-size chunks** were very token-efficient but often returned irrelevant noise because they split functions right down the middle.
2.  **Semantic chunks** (splitting by functions) were less token-efficient but gave us much more relevant results.

**The Lesson:** There is no "perfect" chunking strategy. It's a trade-off between precision (getting only the right stuff) and recall (getting all the right stuff). This experiment was crucial because it taught us that the *best* strategy might depend on the *type* of question being asked—a key insight that sets us up perfectly for the next phases.

---

## Phase 2: What Do You *Really* Mean? Building the Intent Router

This is where our system starts to get truly "intelligent." Not all questions are the same.
*   "Where is the `QueryRouter` class?" is a **location** question.
*   "How does the chunking system work?" is an **architecture** question.

A simple RAG system would treat both questions identically, likely failing at the second one. We can do better.

**The Core Concept: Intent Classification**

Before answering a question, we must first understand the *intent* behind it.

**Our Technical Decision: The `QueryRouter` Agent**

We built an agent, `src/agents/query-router.ts`, whose only job is to classify the user's query into one of several predefined categories (`ARCHITECTURE`, `IMPLEMENTATION`, `LOCATION`, etc.).

*   **Analogy:** Our `QueryRouter` is like a skilled reference librarian. When you approach a librarian, they don't just start pulling books off the shelf based on the keywords you used. They first ask clarifying questions to understand what you *need*. Are you looking for a specific fact? A broad overview? A tutorial? Our router does this in a single step, giving our system a "game plan" before it even starts searching.

**The Lesson:** By categorizing the user's intent, we unlock the ability to handle different types of questions in fundamentally different ways. This is the secret sauce that separates basic RAG from sophisticated, adaptive RAG.

---

## Phase 3: The Smart Librarian in Action - Adaptive Retrieval

Here, we connect the "what" (the intent from Phase 2) with the "how" (the retrieval from Phase 1).

**The Core Concept: Dynamically Tuning Retrieval Parameters**

Based on the classified intent, we will now change *how* we search for information.

**Our Technical Decisions:**

1.  **Externalizing the Brain (`retrieval-strategies.yaml`):** We defined our retrieval strategies in a configuration file, not in the code. This is a critical best practice. It allows us to tweak, experiment with, and tune our retrieval logic without ever touching the application code. A fellow engineer could now improve our AI's "thinking" by just editing this YAML file.

2.  **The `AdaptiveRetriever`:** This new module (`src/retrieval/adaptive-retriever.ts`) is the implementation of our "smart librarian." It reads the YAML file and, for a given intent, applies the correct strategy.

*   **Analogy:** The `AdaptiveRetriever` is the librarian who, after identifying your need, now executes the search. For an `ARCHITECTURE` question, it knows to grab a wide armful of documents (`k=15`). For a `LOCATION` question, it knows to be precise and fetch just a few, highly relevant results (`k=3`).

**A Lesson from a Bug (Our Build Failures):**

As we were building the experiment to test this (`phase-3-experiment.ts`), we ran into a series of frustrating TypeScript errors. It felt like the compiler was just being difficult. But this is a fantastic lesson in disguise.

*   **The Pitfall:** It's easy to get annoyed at a strict type system and look for a "quick fix" to make the errors go away.
*   **How Good Engineers Think:** A good engineer sees the compiler not as an adversary, but as a partner. Those errors were our safety net. They weren't just syntax issues; they were pointing out legitimate flaws in our logic. We were trying to pass the wrong type of object to a constructor, and we were trying to return the wrong shape of data from a function. The type system forced us to be precise and correct these subtle bugs *before* they could cause real, hard-to-debug problems at runtime.

**The Lesson:** We've now built a system where the retrieval logic is no longer one-size-fits-all. It adapts. This is the core of Phase 3 and the most important concept in this entire project.

## What's Next?

Our retriever is now using the `k` parameter adaptively. But `k` is just the beginning. The other parameters in our YAML file (`expand_query`, `filter_by_imports`, etc.) are still just placeholders. Our next steps will be to breathe life into them, making our retriever even smarter.

Stay tuned. This is where the real fun begins.

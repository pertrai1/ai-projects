# Two Pointers & Cycle Detection

## 📌 Core Concept

The **Two Pointers** pattern is an algorithmic technique that uses two reference pointers moving through a linear data structure (such as an array or linked list) in coordination. 

This approach optimizes nested-loop calculations by maintaining geometric relationship bounds between the pointers.

```
[ 1, 2, 3, 4, 5, 6, 7 ]
  ▲                 ▲
  │                 └── Right Pointer (Moves Backward)
  └──────────────────── Left Pointer (Moves Forward)
```

### Primary Configurations:
1. **Opposite Directions (Left & Right):** Pointers start at opposite ends of the array and move toward each other (used for sorting, reversing, and binary target searches).
2. **Fast and Slow Pointers (Tortoise and Hare):** One pointer moves at a faster rate (e.g., 2 steps per iteration) than the other (1 step per iteration). This is primarily used for **cycle detection** and finding midpoints in singly linked list structures.

---

## ⚡ Algorithmic Performance

### Complexity Metrics:
* **Time Complexity:** $\mathcal{O}(N)$ where $N$ is the number of nodes or elements. In opposite-direction pointers, we traverse the array once. In fast-slow cycle detection, if a cycle of length $C$ exists, the fast and slow pointers are guaranteed to meet inside the loop in less than $N$ iterations.
* **Space Complexity:** $\mathcal{O}(1)$ as we only maintain two integer index variables or node references on the stack.

### Mathematical Proof of Cycle Convergence:
If a linked list contains a cycle, the fast pointer enters the cycle first. When the slow pointer enters, they are separated by some distance $D$. In each step, the fast pointer closes the gap by exactly $1$ element (since $2 - 1 = 1$). Therefore, the fast pointer is guaranteed to catch the slow pointer from behind in exactly $D$ steps, preventing an infinite running loop.

---

## 🤖 Importance in AI & Agentic Systems

### 1. Agent Hallucination & Tool-Loop Guards
When an autonomous agent is trying to solve a coding or search problem, it runs inside an event loop (e.g. `LLM Output ➔ Parse Tool Call ➔ Run Tool ➔ Output to LLM ➔ Repeat`).
* Sometimes, an agent suffers from **hallucination loops**. For example, the agent tries to use a deprecated tool parameter, gets an error from the shell, and attempts the exact same tool call again, getting the same error in an infinite cycle.
* Agent runtimes implement a **Fast-Slow log tracker** (Two Pointers) behind the scenes. 
* By comparing the agent's current state log (Fast) against its historic states (Slow), the runtime can immediately detect if the agent has entered a circular path of repeating states. The runtime can then sound an alarm (`Loop Detected!`), break the loop, and force a temperature reset or ask the user for manual guidance.

### 2. Sentence Alignment & BLEU / ROUGE Token Comparison
When evaluating language models, researchers compare the model's generated sentence (Hypothesis) against a human-written target (Reference).
* Computing similarity metrics (like BLEU, ROUGE, or LCS) requires matching sub-sequences of tokens.
* Scientists use **two pointers** moving through the two token streams to align key phrases and measure matching window sizes, identifying insertion, deletion, and translation differences between the model's output and human text in linear time.

---

## 📖 Key Topics & Advanced Concepts

### Floyd's Cycle Detection Algorithm (Hare & Tortoise)
In a linear system, cycle detection is straightforward if we are allowed to use extra memory (such as a Hash Set of visited memory addresses). However, inside highly constrained, low-memory embedded models or streaming microcontrollers, allocating extra memory is unacceptable. Floyd's algorithm proves that you can guarantee cycle detection with absolute zero memory allocation—just two pointers on the stack.

---

## 📝 Practice Exercises (LeetCode)
To master this pattern, solve the following curated exercises:
1. **[LC 141: Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)** (Core fast-slow loop detection)
2. **[LC 15: 3Sum](https://leetcode.com/problems/3sum/)** (Opposite pointer search pattern)
3. **[LC 11: Container With Most Water](https://leetcode.com/problems/container-with-most-water/)** (Two-pointer boundary convergence maximization)

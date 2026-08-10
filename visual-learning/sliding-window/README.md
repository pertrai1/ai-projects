# The Sliding Window Pattern

## 📌 Core Concept
The **Sliding Window** pattern is an algorithmic technique used to perform operations on a specific nested subarray or substring within a larger array or string. 

Instead of recomputing the values of overlapping subproblems from scratch (which results in an inefficient $\mathcal{O}(N^2)$ or $\mathcal{O}(N^3)$ nested-loop calculation), the sliding window maintains a running state by adding new elements entering from the right (lead) and discarding old elements exiting from the left (tail).

```
[ A, B, C, D, E, F, G ]
  ▲        ▲
  │        └── Right Pointer (Window Expand)
  └────────── Left Pointer (Window Shrink)
```

### Types of Sliding Windows:
1. **Fixed-Size Window:** The window length $K$ remains constant. As the window shifts, we add one element and remove exactly one element (e.g., finding the average of all subarrays of size $K$).
2. **Dynamic-Size Window:** The window expands or contracts dynamically based on a constraint (e.g., finding the longest substring with no repeating characters).

---

## ⚡ Algorithmic Performance

### Complexity Metrics:
* **Time Complexity:** $\mathcal{O}(N)$ where $N$ is the number of elements in the array/string. Even though we have two pointers (Left and Right) moving across the array, each pointer visits each element at most once. This is a massive optimization over the naive $\mathcal{O}(N^2)$ brute force approach.
* **Space Complexity:** $\mathcal{O}(1)$ or $\mathcal{O}(U)$ where $U$ is the number of unique elements stored in our window state (typically stored in a Hash Map or Set to track frequencies).

---

## 🤖 Importance in AI & Agentic Systems

### 1. LLM Context Window Budgeting & Eviction
Large Language Models have a physical upper boundary on the number of tokens they can digest (known as the **Context Window**). 
* When managing a continuous chat session or an autonomous agent running a long execution loop, sending the entire raw history is financially costly and computationally impossible once the limit is exceeded.
* Engineers implement a **Sliding Context Window**. When the total token size exceeds the maximum limit, the oldest conversation nodes are evicted from the tail of the memory array, and new prompt tokens are appended to the front.

### 2. Streaming Token Parsers (On-The-Fly Regex)
When an LLM streams responses back to an agent (typically at a rate of 30-100 tokens per second), the system cannot wait for the entire 1,000-token output to finish before deciding what to do. It must inspect the stream in real-time.
* If the agent is looking for a specific structured command, such as `<tool_call>`, it maintains a small **fixed-size sliding window** over the incoming characters or tokens.
* By analyzing only the slice of characters equal to the length of `<tool_call>`, the system can immediately stop the generation mid-stream the moment a complete matching tag is formed, executing the tool instantly.

### 3. Text Chunking for Vector Databases (RAG)
Before documents are ingested into a Vector Database for Retrieval-Augmented Generation, they must be split into smaller blocks.
* Standard systems use a **sliding chunk window with overlap** (e.g., chunk size of 500 characters, slide/stride of 250 characters).
* This sliding-overlap approach ensures that semantic concepts sitting directly on the borders of a chunk are not chopped in half and lost, preserving local context in adjacent vector embeddings.

---

## 📖 Key Topics & Advanced Concepts

### State Monotonicity & Subarray Tracking
In dynamic sliding windows, the fundamental invariant is **monotonicity**—as we expand the right pointer, our constraint value (such as sum or unique count) increases. If we exceed our threshold, we must contract the left pointer to restore validity. If the data contains negative values, this monotonic relationship breaks down, requiring more complex solutions like Prefix Sums with Hash Maps.

---

## 📝 Practice Exercises (LeetCode)
To master this pattern, solve the following curated exercises:
1. **[LC 3: Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)** (Dynamic sliding window with hash map)
2. **[LC 239: Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)** (Advanced fixed-size window using a monotonic queue)
3. **[LC 76: Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)** (Hard constraint tracking with two pointers)

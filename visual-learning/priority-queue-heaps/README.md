# Priority Queues, Heaps, and Monotonic Stacks

## 📌 Core Concept

This pattern family involves advanced linear and tree-based data structures used to maintain order, retrieve extreme values (minimums/maximums) instantly, or track nearest historical elements.

### 1. Heaps & Priority Queues
A **Heap** is a specialized tree-based data structure that satisfies the heap property:
* In a **Min-Heap**, the parent node is always less than or equal to its children. The absolute minimum element sits at the root.
* In a **Max-Heap**, the parent node is always greater than or equal to its children. The absolute maximum element sits at the root.

A **Priority Queue** is an abstract data type that uses a heap behind the scenes to allow insertions and extractions in sorted order based on priority values.

```
       [Min-Heap Root: 10]
          /          \
      [ 20 ]        [ 30 ]
      /    \        /    \
   [40]   [50]    [60]   [70]
```

### 2. Monotonic Stacks
A **Monotonic Stack** is a standard stack that enforces a strict ordering rule: its elements are always completely sorted, either in strictly increasing or strictly decreasing order. If a new element violates this monotonicity, we pop elements from the stack until the invariant is restored. This is used to find the "next greater" or "previous smaller" element in $\mathcal{O}(N)$ time.

---

## ⚡ Algorithmic Performance

### Complexity Metrics:

#### Heap/Priority Queue:
* **Get Root (Min/Max):** $\mathcal{O}(1)$ — Root is always instantly accessible.
* **Insert Element:** $\mathcal{O}(\log K)$ — The element is appended and bubble-up math restores heap order.
* **Remove Root:** $\mathcal{O}(\log K)$ — The root is replaced by the leaf, and bubble-down math restores order.
* **Heapify (Build from array):** $\mathcal{O}(K)$ — Optimized bottom-up construction.

#### Monotonic Stack:
* **Push / Process:** $\mathcal{O}(N)$ amortized. Although a single push might trigger multiple pops, each element is pushed and popped at most once.

---

## 🤖 Importance in AI & Agentic Systems

### 1. Top-K Retrieval in Vector Databases (RAG)
When an agent or LLM searches a **Vector Database** (Retrieval-Augmented Generation / RAG), it converts your query into a vector and calculates a similarity score (such as Cosine Similarity) against millions of document vectors.
* Returning all millions of documents is impossible. The system must find the absolute **Top-K** most similar passages.
* Instead of sorting the entire database of $N$ records in $\mathcal{O}(N \log N)$ time, the search engine pushes similarity scores into a **Min-Heap of size K**. 
* If a new document's similarity score is higher than the heap's root (the lowest similarity currently on our board), we extract the root, push the new document in, and restore the heap. This reduces the search complexity to a highly efficient $\mathcal{O}(N \log K)$.

### 2. Beam Search & Sampling in Token Generation
When an LLM generates a response, it doesn't just greedily pick the single most likely next word. Greedy generation can lead to repetitive, low-quality text.
* High-performance token decoders use **Beam Search**. Instead of tracking 1 path, the algorithm maintains a beam of the top $B$ most probable candidate sentences.
* At each token step, the probabilities of all branching possibilities are computed. The decoder uses a **Max-Heap** to quickly keep only the $B$ paths with the highest cumulative log-probabilities and discards the rest.

### 3. Priority-Weighted Task Queues
In multi-agent task systems, agents submit sub-tasks to a central queue (e.g. `Run Security Audit`, `Check Linter`, `Draft Release Notes`). 
* These tasks carry different priority values based on user urgency or dependency levels.
* The orchestrator uses a **Priority Queue** to ensure high-priority security validations are executed by worker threads immediately, even if they were submitted after low-priority formatting tasks.

---

## 📖 Key Topics & Advanced Concepts

### The Min-Heap of Size K Pattern
A common interview and practical pattern for "Find the K largest elements" is to use a **Min-Heap** rather than a Max-Heap. By keeping a Min-Heap capped at size $K$, the top of our heap represents the "barrier of entry" to the top-K list. Any new item smaller than the root is discarded; any item larger is swapped in. This ensures optimal memory bounds.

---

## 📝 Practice Exercises (LeetCode)
To master this pattern, solve the following curated exercises:
1. **[LC 215: Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)** (Classic Min-Heap tracking)
2. **[LC 739: Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)** (Core monotonic stack problem)
3. **[LC 23: Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)** (Hard Priority Queue merge optimization)

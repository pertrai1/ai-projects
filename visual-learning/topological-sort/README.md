# Topological Sort (Directed Acyclic Graphs)

## 📌 Core Concept
A **Topological Sort** of a Directed Acyclic Graph (DAG) is a linear ordering of its vertices such that for every directed edge $U \rightarrow V$ (from vertex $U$ to vertex $V$), $U$ comes before $V$ in the ordering. 

This pattern is fundamentally used for **dependency resolution**. Unlike standard linear data structures, a graph can represent complex, multi-branching networks of prerequisites. A topological sort linearizes this network, providing a safe, step-by-step execution path.

```
       [Search Files] 
             │
             ▼
        [Read File] 
             │
             ▼
       [Write Code] 
        /          \
       ▼            ▼
[Run Tests]      [Lint Code]
       \            /
        ▼          ▼
        [Git Push]
```
In the graph above, `Search Files` has no incoming dependencies, whereas `Git Push` requires both `Run Tests` and `Lint Code` to be completed first. Topological sorting resolves this graph into a valid sequential queue:
`Search Files ➔ Read File ➔ Write Code ➔ Run Tests ➔ Lint Code ➔ Git Push`

---

## ⚡ Algorithmic Performance

We can compute a topological sort using two primary algorithms:
1. **[Kahn's Algorithm (Interactive Simulator Game)](../algorithms/kahns-algorithm/index.html)** (Breadth-First Search / Indegree-based queue)
2. **Depth-First Search (DFS)** (Post-order stack reversal)

### Complexity Metrics:
* **Time Complexity:** $\mathcal{O}(V + E)$ where $V$ is the number of vertices (nodes) and $E$ is the number of edges. We visit every vertex exactly once and traverse each edge exactly once.
* **Space Complexity:** $\mathcal{O}(V)$ to store the recursion stack (for DFS), indegree arrays, and queue (for Kahn's).

### Mathematical Precondition:
A topological sort is **only** possible if the graph is **Acyclic** (contains no cycles). If a cycle exists (e.g., $A \rightarrow B \rightarrow C \rightarrow A$), there is no valid starting vertex with an in-degree of $0$, and dependency resolution collapses. Both Kahn's and DFS algorithms can be instrumented to detect cycles and throw execution errors.

---

## 🤖 Importance in AI & Agentic Systems

In modern Agentic Engineering, agents are rarely constructed as single, linear loops. Instead, state-of-the-art frameworks (e.g., **LangGraph**, **CrewAI**, or custom agent runners) model actions as state machines and **DAGs**.

### 1. Multi-Agent Orchestration & Workflow DAGs
When building a complex pipeline (e.g., a research agent feeding a writing agent, which feeds a translation agent, which feeds a compiler), the execution sequence must obey topological rules. Orchestration engines compile these multi-agent dependencies into a DAG and run a topological sort to structure the parallel and serial processing lanes.

### 2. Tool-Use Dependency Resolution
When a high-functioning developer agent (such as **Hermes Developer**) receives a goal, it must call tools dynamically. If the agent emits a tool call list:
* `terminal(command="pytest")`
* `write_file(path="src/index.ts", content="...")`

The underlying runtime executes a topological analysis. Because writing code is a prerequisite for running tests on that code, the runtime schedules the execution queue sequentially: `write_file` first, then `terminal`.

---

## 📖 Key Topics & Advanced Concepts

### 1. [Kahn's Algorithm](../algorithms/kahns-algorithm/index.html) vs. DFS
* **[Kahn's Algorithm](../algorithms/kahns-algorithm/index.html) (BFS):** Uses an in-degree map (counting incoming edges for each node). Nodes with $0$ in-degree are placed in a queue. As they are processed, their outgoing edges are removed, reducing the in-degree of neighboring nodes. This approach is highly intuitive and naturally detects cycles (if processed nodes < total vertices, a cycle exists).
* **DFS Method:** Performs a depth-first search. Once a node has no more unvisited outgoing neighbors (it has hit a dead end), it is pushed onto a stack. Reversing this stack yields the topological order.

### 2. Parallel Processing Lanes
Topological sorting helps identify tasks that can be executed **concurrently**. During Kahn's algorithm, any nodes that enter the $0$ in-degree queue at the same time are completely independent of each other and can be dispatched to separate thread pools or sub-agents in parallel.

---

## 📝 Practice Exercises (LeetCode)
To master this pattern, solve the following curated exercises:
1. **[LC 207: Course Schedule](https://leetcode.com/problems/course-schedule/)** (Cycle detection in a directed graph)
2. **[LC 210: Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)** (Classic topological sort output)
3. **[LC 444: Sequence Reconstruction](https://leetcode.com/problems/sequence-reconstruction/)** (Uniqueness of topological sort)

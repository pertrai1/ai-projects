# 🎮 Visual Learning Arena

An interactive, visual theme-park-style arcade to teach core Computer Science algorithms and patterns behind **Large Language Models (LLMs)** and **Agentic Systems** like they are 10!

This project is inspired by retro tycoon-style games and structural learning simulations (such as [ChipTycoon](https://github.com/LaurentiuGabriel/ChipTycoon)), converting abstract technical concepts into physical drag-and-drop mechanics with instant visual, tactical, and auditory feedback.

---

## 🗺️ Current Games

### 1. 🏆 Locker Room Gear-Up: Agent Dependency Planner (`topological-sort`)
Learn about **Directed Acyclic Graphs (DAGs)**, node dependencies, and **Topological Sort** using a dual-mode puzzle:
* **🏈 Sports Mode:** Help a football rookie get dressed in the locker room. You can't put cleats on before your socks and pants are on, and you can't put a jersey on before your shoulder pads!
* **🤖 AI Agent Mode:** Act as the orchestrator for an AI coding agent. Ensure the agent schedules its tool calls in a valid topological order—never running a test suite before writing code, or pushing to Git before running tests!
* **📟 Interactive DFS Auto-Solver:** Watch the system execute a live Depth-First Search (DFS) in real-time, displaying how post-order stack assembly builds a guaranteed dependency-resolved queue.

### 2. 🎚️ Context Stream: Token Parser (`sliding-window`)
Learn about **Fixed-Size**, **Dynamic-Size**, and **Chunking / Stride Overlap** sliding window configurations:
* **📥 Level 1 (Fixed-Size Parser):** Slide a fixed viewport to capture structured tool call tags (e.g. `<tool_call> ... </tool_call>`) out of streaming token arrays.
* **📏 Level 2 (Dynamic Window Optimization):** Adjust Left (L) and Right (R) pointers dynamically to maximize the context window of completely unique instruction tokens, evicting duplicates on-the-fly.
* **📦 Level 3 (RAG Document Chunking):** Stamp out document segments with a specific window size and overlapping stride, mirroring chunk preparation for Vector Databases.

### 3. 🛡️ Top-K Vault: Vector Search (`priority-queue-heaps`)
Learn about **Heaps**, **Priority Queues**, and **Similarity Vector Search (RAG)**:
* **💾 RAG Retrieval Simulator:** Feed similarity score vector chunks into a Min-Heap of size K=3. Determine instantly in $\mathcal{O}(1)$ time if an incoming chunk qualifies for the Top-3 list, swapping the root and sifting down to compile your agent context.

---

## ⚙️ Standalone Algorithm Simulation Games

### 1. 🔗 Kahn's Algorithm: Indegree Dispatcher (`algorithms/kahns-algorithm`)
Perform in-degree calculation tracking, queue management, and edge deduction to solve topological sorts. Spot cyclic dependency traps and raise alerts before the agent system crashes!

### 2. 📊 Monotonic Queue: Sliding Window Maximum (`algorithms/monotonic-queue`)
Maintain a double-ended queue (Deque) in strict decreasing order by manually ejecting smaller items from the back and expiring out-of-bounds nodes from the front, retrieving maximum values in constant $\mathcal{O}(1)$ time.

### 3. 🌳 Heapify Tree Balanced: Sift-Up & Sift-Down (`algorithms/heapify`)
Construct and balance complete binary min-heaps. Master sifting up new leaf nodes recursively and sifting down unbalanced root elements by swapping nodes with their smaller child.

---

## 🚀 How to Run the Games

These games are **pure static assets**—built with zero external frameworks, node compilation steps, or heavy network packages. They are self-contained and run on vanilla HTML5 Canvas and the Web Audio API.

To run any game locally:

### Option A: Open directly in your browser
Simply navigate to the game directory and open the `index.html` file directly in your browser of choice.

### Option B: Serve locally via Python
If you prefer to run a local server:
```bash
cd visual-learning
python3 -m http.server 8000
# ➡️ Visit http://localhost:8000 in your browser!
```

---

## 🛠️ Tech Stack & Philosophy
* **Zero Dependencies:** Pure HTML, CSS, and Vanilla JavaScript. Runs offline and instantly on mobile or desktop.
* **SVG & HTML5 Canvas Routing:** Renders dynamic DAG nodes and computes edge intersection arrow coordinates on-the-fly, allowing smooth, interactive gameplay.
* **Web Audio API Sound Synth:** Audio is dynamically synthesized in code using oscillator oscillators, custom wave modulators, and envelope gains (producing referee whistles, chimes, and coin SFX) without downloading bulky audio assets.

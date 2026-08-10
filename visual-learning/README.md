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

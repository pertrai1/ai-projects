# Design: Add Initial Project Structure

The project structure will follow the layout defined in the `ROADMAP.md` and `README.md`. This initial phase focuses on creating the necessary directories and files to establish a runnable TypeScript project.

## Directory Structure

```
src/
  prompts/
  tasks/
  results/
index.ts
runner.ts
tasks.json
```

This structure separates concerns:

*   `prompts`: Will contain the different prompt strategies.
*   `tasks`: Will hold the task definitions.
*   `results`: Will store the outputs of the model executions.
*   `index.ts`: The main entry point of the application.
*   `runner.ts`: The core logic for running the tasks and prompts.
*   `tasks.json`: The data file for the tasks.

This design is intentionally minimal and will be built upon in subsequent phases.

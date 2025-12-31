# Design: Add Task Set

The task set will be designed to be small and interpretable, allowing for clear analysis of the performance of different prompting strategies.

## Task Categories

The tasks will be divided into the following categories:

*   **Multi-step arithmetic:** Word problems that require multiple arithmetic operations to solve.
*   **Symbolic reasoning:** Tasks that involve manipulating symbols, such as concatenating letters or tracking the state of a coin flip.
*   **Commonsense reasoning:** Questions that require general knowledge and reasoning about the world.
*   **One-step "control" tasks:** Simple, one-step problems that should not require chain-of-thought reasoning. These will serve as a baseline.

## Task Structure

Each task will be a JSON object with the following fields:

*   `id`: A unique identifier for the task (e.g., "arithmetic-01").
*   `category`: The category of the task (e.g., "multi-step-arithmetic").
*   `question`: The question to be posed to the language model.
*   `expectedAnswer`: The ground truth answer to the question.

This structure will be enforced by a JSON schema to ensure consistency.

# Tasks: Add Model Execution

- [x] 1.  Install the `@google/generative-ai` package.
- [x] 2.  Create a `.env` file from the `.env.example` file and add the `GEMINI_API_KEY`.
- [x] 3.  Update the `src/runner.ts` file to:
    *   Load the tasks from `src/tasks.json`.
    *   Initialize the Google Gemini API client.
    *   For each task, execute both the standard and chain-of-thought prompts.
    *   Store the raw model outputs in the `src/results` directory, with a separate file for each task and prompt type.
- [x] 4.  Update the `src/index.ts` file to call the runner.
- [x] 5.  Update the `.gitignore` file to include `.env` and `src/results`.

# Design: Add Model Execution

The model execution phase will focus on running the prompts and storing the raw model outputs.

## Google Gemini API

The project will use the `@google/generative-ai` package to interact with the Google Gemini API. The API key will be stored in a `.env` file and loaded at runtime.

## Runner

The `src/runner.ts` file will be the core of the model execution. It will be responsible for:

1.  **Loading Tasks:** The runner will read the `src/tasks.json` file to get the list of tasks to execute.
2.  **Initializing API:** The runner will initialize the Google Gemini API client with the API key from the `.env` file.
3.  **Executing Prompts:** For each task, the runner will:
    *   Generate the standard prompt using the `standardPrompt` function.
    *   Generate the chain-of-thought prompt using the `chainOfThoughtPrompt` function.
    *   Send both prompts to the Gemini API.
4.  **Storing Results:** The raw model outputs will be stored in the `src/results` directory. The file name will be in the format `<task-id>-<prompt-type>.txt`. For example, `arithmetic-01-standard.txt` and `arithmetic-01-cot.txt`.

## Entry Point

The `src/index.ts` file will be the main entry point of the application. It will call the runner to start the model execution process.

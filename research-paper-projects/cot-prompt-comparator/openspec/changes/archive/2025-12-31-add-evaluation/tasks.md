# Tasks: Add Answer Extraction and Evaluation

- [x] 1.  Create a `src/evaluator.ts` file.
- [x] 2.  Implement a function in `src/evaluator.ts` to extract the final answer from the model output.
- [x] 3.  Implement a function in `src/evaluator.ts` to compare the extracted answer with the expected answer.
- [x] 4.  Update the `src/runner.ts` file to:
    *   Import the evaluation functions from `src/evaluator.ts`.
    *   For each task, after getting the model outputs, call the evaluation functions.
    *   Store the evaluation results in a structured format in the `src/results` directory.
- [x] 5.  Define a clear structure for the evaluation results.

# Design: Add Answer Extraction and Evaluation

The evaluation phase will focus on extracting the final answers from the model outputs and comparing them against the ground truth.

## Answer Extraction

A function `extractAnswer` will be implemented in `src/evaluator.ts`. This function will take the raw model output as a string and attempt to extract the final answer. The extraction will be conservative, looking for the last number in the output. This is a simple heuristic that should work for the current task set.

## Evaluation

A function `evaluate` will be implemented in `src/evaluator.ts`. This function will take the extracted answer and the expected answer and return whether the answer is correct or not. The comparison will be case-insensitive and will trim any whitespace.

## Results Structure

The evaluation results will be stored in a single JSON file: `src/results/output.json`. This file will contain an array of objects, where each object represents the result for a single task and prompt type.

The structure of each result object will be as follows:

```json
{
  "taskId": "arithmetic-01",
  "promptType": "standard",
  "question": "Natalia sold 48 teddy bears in the morning and 25 in the afternoon. Each teddy bear cost $5. How much money did she make?",
  "modelOutput": "365",
  "extractedAnswer": "365",
  "expectedAnswer": "365",
  "isCorrect": true
}
```

## Runner Update

The `src/runner.ts` file will be updated to orchestrate the evaluation process. For each task, it will:

1.  Get the model outputs for both prompt types.
2.  Call the `extractAnswer` function to get the final answer.
3.  Call the `evaluate` function to compare the answers.
4.  Store the results in the `src/results/output.json` file.

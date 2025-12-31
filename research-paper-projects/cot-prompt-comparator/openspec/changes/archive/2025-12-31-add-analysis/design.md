# Design: Add Analysis and Reflection

The analysis phase will focus on converting the evaluation results into a better understanding of the performance of chain-of-thought prompting.

## Analyzer

A new file `src/analyzer.ts` will be created to house the analysis logic. It will contain the following functions:

*   `analyze()`: The main function that will orchestrate the analysis. It will read the `src/results/output.json` file, calculate the accuracies, and print the results to the console.
*   `calculateAccuracyByPromptType()`: This function will take the results array and calculate the accuracy for the "standard" and "cot" prompt types.
*   `calculateAccuracyByCategory()`: This function will take the results array and calculate the accuracy for each task category.

## Console Output

The analysis results will be printed to the console in a human-readable format. For example:

```
Analysis Results:

Overall Accuracy:
- Standard Prompt: 50%
- Chain-of-Thought Prompt: 83%

Accuracy by Category:
- multi-step-arithmetic:
  - Standard Prompt: 0%
  - Chain-of-Thought Prompt: 100%
- symbolic-reasoning:
  - Standard Prompt: 33%
  - Chain-of-Thought Prompt: 100%
- commonsense-reasoning:
  - Standard Prompt: 67%
  - Chain-of-Thought Prompt: 67%
- one-step-control:
  - Standard Prompt: 100%
  - Chain-of-Thought Prompt: 100%
```

## Written Summary

A file `src/results/analysis.md` will be created to store a written summary of the findings. This file will be manually populated after running the analysis and inspecting the results.

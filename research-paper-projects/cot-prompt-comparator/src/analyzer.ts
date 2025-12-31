import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";



const calculateAccuracyByPromptType = (results: any[]) => {
  const promptTypes = [...new Set(results.map((r: any) => r.promptType))] as string[];
  const accuracyByPromptType: any = {};

  for (const promptType of promptTypes) {
    const correct = results.filter((r: any) => r.promptType === promptType && r.isCorrect).length;
    const total = results.filter((r: any) => r.promptType === promptType).length;
    const accuracy = (correct / total) * 100;
    accuracyByPromptType[promptType] = accuracy;
  }

  return accuracyByPromptType;
};

const calculateAccuracyByCategory = (results: any[]) => {
  const categories = [...new Set(results.map((r: any) => r.category))] as string[];
  const promptTypes = [...new Set(results.map((r: any) => r.promptType))] as string[];
  const accuracyByCategory: any = {};

  for (const category of categories) {
    accuracyByCategory[category] = {};
    for (const promptType of promptTypes) {
      const correct = results.filter(
        (r: any) =>
          r.category === category && r.promptType === promptType && r.isCorrect,
      ).length;
      const total = results.filter(
        (r: any) => r.category === category && r.promptType === promptType,
      ).length;
      const accuracy = (correct / total) * 100;
      accuracyByCategory[category][promptType] = accuracy;
    }
  }

  return accuracyByCategory;
};

export const analyze = () => {
  const rawResults = JSON.parse(
    fs.readFileSync(path.resolve("./dist/results/output.json"), "utf-8"),
  );

  const flattenedResults: any[] = [];
  for (const taskResult of rawResults) {
    const category = taskResult.taskId.split('-')[0]; // Extract category from taskId
    for (const promptResult of taskResult.promptResults) {
      flattenedResults.push({
        category: category,
        promptType: promptResult.promptType,
        isCorrect: promptResult.isCorrect,
      });
    }
  }

  const accuracyByPromptType = calculateAccuracyByPromptType(flattenedResults);
  const accuracyByCategory = calculateAccuracyByCategory(flattenedResults);

  console.log(chalk.bold.yellow("Analysis Results:\n"));
  console.log(chalk.bold.cyan("Overall Accuracy:"));
  for (const promptType in accuracyByPromptType) {
    console.log(`- ${promptType}: ${chalk.green(accuracyByPromptType[promptType].toFixed(2) + "%" )}`);
  }

  console.log(chalk.bold.cyan("\nAccuracy by Category:"));
  for (const category in accuracyByCategory) {
    console.log(`- ${chalk.magenta(category)}:`);
    for (const promptType in accuracyByCategory[category]) {
      console.log(`  - ${promptType}: ${chalk.green(accuracyByCategory[category][promptType].toFixed(2) + "%" )}`);
    }
  }
};

analyze();

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

const results = JSON.parse(
  fs.readFileSync(path.resolve("./src/results/output.json"), "utf-8"),
);

const calculateAccuracyByPromptType = () => {
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

const calculateAccuracyByCategory = () => {
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
  const accuracyByPromptType = calculateAccuracyByPromptType();
  const accuracyByCategory = calculateAccuracyByCategory();

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

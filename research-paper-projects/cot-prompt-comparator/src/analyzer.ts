import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

const results = JSON.parse(
  fs.readFileSync(path.resolve("./src/results/output.json"), "utf-8"),
);

const calculateAccuracyByPromptType = () => {
  const standardCorrect = results.filter(
    (r: any) => r.promptType === "standard" && r.isCorrect,
  ).length;
  const standardTotal = results.filter(
    (r: any) => r.promptType === "standard",
  ).length;
  const standardAccuracy = (standardCorrect / standardTotal) * 100;

  const cotCorrect = results.filter(
    (r: any) => r.promptType === "cot" && r.isCorrect,
  ).length;
  const cotTotal = results.filter((r: any) => r.promptType === "cot").length;
  const cotAccuracy = (cotCorrect / cotTotal) * 100;

  return { standardAccuracy, cotAccuracy };
};

const calculateAccuracyByCategory = () => {
  const categories = [
    ...new Set(results.map((r: any) => r.category)),
  ] as string[];
  const accuracyByCategory: any = {};

  for (const category of categories) {
    const standardCorrect = results.filter(
      (r: any) =>
        r.category === category && r.promptType === "standard" && r.isCorrect,
    ).length;
    const standardTotal = results.filter(
      (r: any) => r.category === category && r.promptType === "standard",
    ).length;
    const standardAccuracy = (standardCorrect / standardTotal) * 100;

    const cotCorrect = results.filter(
      (r: any) =>
        r.category === category && r.promptType === "cot" && r.isCorrect,
    ).length;
    const cotTotal = results.filter(
      (r: any) => r.category === category && r.promptType === "cot",
    ).length;
    const cotAccuracy = (cotCorrect / cotTotal) * 100;

    accuracyByCategory[category] = { standardAccuracy, cotAccuracy };
  }

  return accuracyByCategory;
};

export const analyze = () => {
  const { standardAccuracy, cotAccuracy } = calculateAccuracyByPromptType();
  const accuracyByCategory = calculateAccuracyByCategory();

  console.log(chalk.bold.yellow("Analysis Results:\n"));
  console.log(chalk.bold.cyan("Overall Accuracy:"));
  console.log(
    `- Standard Prompt: ${chalk.green(standardAccuracy.toFixed(2) + "%")}`,
  );
  console.log(
    `- Chain-of-Thought Prompt: ${chalk.green(cotAccuracy.toFixed(2) + "%")}\n`,
  );

  console.log(chalk.bold.cyan("Accuracy by Category:"));
  for (const category in accuracyByCategory) {
    console.log(`- ${chalk.magenta(category)}:`);
    console.log(
      `  - Standard Prompt: ${chalk.green(accuracyByCategory[category].standardAccuracy.toFixed(2) + "%")}`,
    );
    console.log(
      `  - Chain-of-Thought Prompt: ${chalk.green(accuracyByCategory[category].cotAccuracy.toFixed(2) + "%")}`,
    );
  }
};

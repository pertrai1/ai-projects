import { CNNModel } from "../models/cnnModel";
import { Predictor } from "../prediction/predictor";

async function predict() {
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.error("Usage: npm run predict <image_path>");
    process.exit(1);
  }

  console.log("Loading model...");
  const model = await CNNModel.load();

  console.log(`Predicting ${imagePath}...`);
  const predictor = new Predictor(model);
  const result = await predictor.predict(imagePath);

  console.log(`\n✓ Predicted class: ${result.class}`);
  console.log(`✓ Confidence: ${(result.confidence * 100).toFixed(2)}%\n`);

  console.log("All probabilities:");
  result.probabilities
    .sort((a, b) => b.probability - a.probability)
    .forEach(({ class: cls, probability }) => {
      const bar = "█".repeat(Math.floor(probability * 50));
      console.log(
        `  ${cls.padEnd(12)} ${(probability * 100).toFixed(2)}% ${bar}`,
      );
    });
}

predict().catch(console.error);

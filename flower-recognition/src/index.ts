import { DatasetLoader } from "./data/datasetLoader";
import { CNNModel } from "./models/cnnModel";
import { Trainer } from "./training/trainer";
import { Predictor } from "./prediction/predictor";
import { CONFIG } from "./config/constants";

async function main() {
  try {
    console.log("Loading dataset");
    const datasetLoader = new DatasetLoader(CONFIG.DATA_DIR);
    const data = await datasetLoader.loadDataset();

    console.log("\nCreating model...");
    const model = new CNNModel();
    model.compile();
    model.printSummary();

    console.log("\nTraining model...");
    const trainer = new Trainer(model);
    await trainer.train(data.train, data.validation);

    console.log("\nEvaluating model...");
    await trainer.evaluate(data.validation);

    console.log("\nSaving model");
    await model.save();

    console.log("\nMaking predictions...");
    const predictor = new Predictor(model);
    const result = await predictor.predict("./test_image.jpg");

    console.log(`\nPredicted class: ${result.class}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    console.log("\nAll probabilities:");
    result.probabilities.forEach(({ class: cls, probability }) => {
      console.log(` ${cls}: ${(probability * 100).toFixed(2)}%`);
    });

    data.train.images.dispose();
    data.train.labels.dispose();
    data.validation.images.dispose();
    data.validation.labels.dispose();

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();

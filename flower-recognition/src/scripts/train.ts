import { DatasetLoader } from "../data/datasetLoader";
import { CNNModel } from "../models/cnnModel";
import { Trainer } from "../training/trainer";
import { CONFIG } from "../config/constants";

async function train() {
  console.log("Loading dataset...");
  const datasetLoader = new DatasetLoader(CONFIG.DATA_DIR);
  const data = await datasetLoader.loadDataset();

  console.log("Creating and compiling model...");
  const model = new CNNModel();
  model.compile();
  model.printSummary();

  console.log("Training model...");
  const trainer = new Trainer(model);
  await trainer.train(data.train, data.validation);

  console.log("Evaluating model...");
  await trainer.evaluate(data.validation);

  console.log("Saving model");
  await model.save();

  data.train.images.dispose();
  data.train.labels.dispose();
  data.validation.images.dispose();
  data.validation.labels.dispose();

  console.log("Training complete!");
}

train().catch(console.error);

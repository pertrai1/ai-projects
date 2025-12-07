import { CNNModel } from "../models/cnnModel";
import * as tf from "@tensorflow/tfjs-node";

async function dryRun() {
  console.log("Creating model architecture");
  const model = new CNNModel();
  model.compile();
  model.printSummary();

  console.log("\nTesting model with dummy data...");
  const dummyImage = tf.randomNormal([1, 224, 224, 3]);
  const prediction = model.getModel().predict(dummyImage) as tf.Tensor2D;
  const probs = await prediction.data();

  console.log("Output probabilities:", Array.from(probs));
  console.log("Model architecture is working correctly!");

  dummyImage.dispose();
  prediction.dispose();
}

dryRun().catch(console.error);

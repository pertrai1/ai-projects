import * as tf from "@tensorflow/tfjs-node";
import { CNNModel } from "../models/cnnModel";
import { loadImage } from "../utils/imageLoader";
import { CONFIG } from "../config/constants";

export interface PredictionResult {
  class: string;
  confidence: number;
  probabilities: { class: string; probability: number }[];
}

export class Predictor {
  private model: CNNModel;

  constructor(model: CNNModel) {
    this.model = model;
  }

  async predict(imagePath: string): Promise<PredictionResult> {
    const imageTensor = await loadImage(imagePath, CONFIG.IMG_SIZE);
    const batchedImage = imageTensor.expandDims(0) as tf.Tensor4D;

    const predictions = this.model
      .getModel()
      .predict(batchedImage) as tf.Tensor2D;
    const probabilities = await predictions.data();
    const predictedClassIdx = predictions.argMax(-1).dataSync()[0];

    imageTensor.dispose();
    batchedImage.dispose();
    predictions.dispose();

    const probabilitiesArray = Array.from(probabilities).map((prob, idx) => ({
      class: CONFIG.FLOWER_CLASSES[idx],
      probability: prob,
    }));

    return {
      class: CONFIG.FLOWER_CLASSES[predictedClassIdx],
      confidence: probabilities[predictedClassIdx],
      probabilities: probabilitiesArray,
    };
  }

  async predictBatch(imagePaths: string[]): Promise<PredictionResult[]> {
    const results: PredictionResult[] = [];

    for (const imagePath of imagePaths) {
      const result = await this.predict(imagePath);
      results.push(result);
    }

    return results;
  }
}

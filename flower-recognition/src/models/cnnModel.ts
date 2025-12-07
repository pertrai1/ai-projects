import * as tf from "@tensorflow/tfjs-node";
import { CONFIG } from "../config/constants";

export class CNNModel {
  private model: tf.Sequential;

  constructor() {
    this.model = this.buildModel();
  }

  private buildModel(): tf.Sequential {
    const model = tf.sequential();

    model.add(
      tf.layers.conv2d({
        inputShape: [CONFIG.IMG_SIZE, CONFIG.IMG_SIZE, 3],
        filters: 64,
        kernelSize: 5,
        padding: "same",
        activation: "relu",
        name: "conv1",
      }),
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2, name: "pool1" }));

    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        padding: "same",
        activation: "relu",
        name: "conv2",
      }),
    );
    model.add(
      tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool2" }),
    );

    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        padding: "same",
        activation: "relu",
        name: "conv3",
      }),
    );
    model.add(
      tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool3" }),
    );

    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        padding: "same",
        activation: "relu",
        name: "conv4",
      }),
    );
    model.add(
      tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool4" }),
    );

    model.add(tf.layers.flatten({ name: "flatten" }));
    model.add(
      tf.layers.dense({ units: 512, activation: "relu", name: "dense1" }),
    );
    model.add(
      tf.layers.dense({
        units: CONFIG.FLOWER_CLASSES.length,
        activation: "softmax",
        name: "output",
      }),
    );

    return model;
  }

  compile(): void {
    this.model.compile({
      optimizer: tf.train.adam(),
      loss: "sparseCategoricalCrossentropy",
      metrics: ["accuracy"],
    });
  }

  getModel(): tf.Sequential {
    return this.model;
  }

  printSummary(): void {
    this.model.summary();
  }

  async save(savePath: string = CONFIG.MODEL_SAVE_PATH): Promise<void> {
    await this.model.save(`file://${savePath}`);
    console.log(`Model saved to ${savePath}`);
  }

  static async load(
    loadPath: string = CONFIG.MODEL_SAVE_PATH,
  ): Promise<CNNModel> {
    const loadedModel = (await tf.loadLayersModel(
      `file://${loadPath}/model.json`,
    )) as tf.Sequential;

    const cnnModel = new CNNModel();
    cnnModel.model = loadedModel;
    console.log("Model loaded successfully");

    return cnnModel;
  }
}

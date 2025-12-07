import * as tf from "@tensorflow/tfjs-node";
import { CNNModel } from "../models/cnnModel";
import { ImageData, CONFIG } from "../config/constants";

export interface TrainingCallbacks {
  onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
  onBatchEnd?: (batch: number, logs: tf.Logs) => void;
}

export class Trainer {
  private model: CNNModel;

  constructor(model: CNNModel) {
    this.model = model;
  }

  async train(
    trainData: ImageData,
    valData: ImageData,
    epochs: number = CONFIG.EPOCHS,
    callbacks?: TrainingCallbacks,
  ): Promise<tf.History> {
    console.log("Starting training...");

    const history = await this.model
      .getModel()
      .fit(trainData.images, trainData.labels, {
        epochs,
        batchSize: CONFIG.BATCH_SIZE,
        validationData: [valData.images, valData.labels],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(
              `Epoch ${epoch + 1}/${epochs}: ` +
                `loss=${logs?.acc.toFixed(4)}, ` +
                `acc=${logs?.acc.toFixed(4)}, ` +
                `val_loss=${logs?.val_loss.toFixed(4)}, ` +
                `val_acc=${logs?.val_acc.toFixed(4)}`,
            );

            if (callbacks?.onEpochEnd) {
              callbacks.onEpochEnd(epoch, logs!);
            }
          },
          onBatchEnd: callbacks?.onBatchEnd
            ? (batch, logs) => {
                callbacks.onBatchEnd!(batch, logs!);
              }
            : undefined,
        },
      });

    console.log("Training complete!");
    return history;
  }

  async evaluate(testData: ImageData): Promise<number[]> {
    const results = this.model
      .getModel()
      .evaluate(testData.images, testData.labels) as tf.Scalar[];

    const loss = await results[0].data();
    const accuracy = await results[1].data();

    console.log(`Test Loss: ${loss[0].toFixed(4)}`);
    console.log(`Test Accuracy: ${accuracy[0].toFixed(4)}`);

    return [loss[0], accuracy[0]];
  }
}

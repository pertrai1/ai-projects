import * as tf from "@tensorflow/tfjs-node";

export const CONFIG = {
  IMG_SIZE: 224,
  BATCH_SIZE: 64,
  EPOCHS: 30,
  VALIDATION_SPLIT: 0.2,
  FLOWER_CLASSES: ["Daisy", "Dandelion", "Rose", "Sunflower", "Tulip"],
  MODEL_SAVE_PATH: "./saved_model",
  DATA_DIR: "./flowers",
} as const;

export interface ImageData {
  images: tf.Tensor4D;
  labels: tf.Tensor1D;
}

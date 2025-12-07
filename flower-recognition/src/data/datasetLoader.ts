import * as tf from "@tensorflow/tfjs-node";
import * as fs from "fs";
import * as path from "path";
import { loadImage, disposeImageTensors } from "../utils/imageLoader";
import { CONFIG, ImageData } from "../config/constants";

interface DatasetSplit {
  train: ImageData;
  validation: ImageData;
}

export class DatasetLoader {
  private dataDir: string;
  private validationSplit: number;

  constructor(
    dataDir: string,
    validationSplit: number = CONFIG.VALIDATION_SPLIT,
  ) {
    this.dataDir = dataDir;
    this.validationSplit = validationSplit;
  }

  async loadDataset(): Promise<DatasetSplit> {
    const { images, labels } = await this.loadAllImages();

    if (images.length === 0) {
      throw new Error(
        "No images were successfully loaded. Please check your dataset.",
      );
    }

    console.log(`\nSuccessfully loaded ${images.length} images total\n`);

    const shuffled = this.shuffleData(images, labels);
    const split = this.splitData(shuffled.images, shuffled.labels);

    // Cleanup
    disposeImageTensors(images);
    disposeImageTensors(shuffled.images);

    return split;
  }

  private async loadAllImages(): Promise<{
    images: tf.Tensor3D[];
    labels: number[];
  }> {
    const allImages: tf.Tensor3D[] = [];
    const allLabels: number[] = [];

    const classes = fs.readdirSync(this.dataDir).filter((f) => {
      const fullPath = path.join(this.dataDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    if (classes.length === 0) {
      throw new Error(`No class directories found in ${this.dataDir}`);
    }

    console.log(`Found ${classes.length} classes: ${classes.join(", ")}\n`);

    for (let classIdx = 0; classIdx < classes.length; classIdx++) {
      const className = classes[classIdx];
      const classDir = path.join(this.dataDir, className);
      const imageFiles = fs
        .readdirSync(classDir)
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

      console.log(`Loading ${imageFiles.length} images from ${className}...`);

      let successCount = 0;
      let failCount = 0;

      for (const imageFile of imageFiles) {
        const imagePath = path.join(classDir, imageFile);
        const imageTensor = await loadImage(imagePath, CONFIG.IMG_SIZE);

        if (imageTensor !== null) {
          allImages.push(imageTensor);
          allLabels.push(classIdx);
          successCount++;
        } else {
          failCount++;
        }
      }

      console.log(`  ✓ ${successCount} loaded, ${failCount} failed`);
    }

    return { images: allImages, labels: allLabels };
  }

  private shuffleData(
    images: tf.Tensor3D[],
    labels: number[],
  ): { images: tf.Tensor3D[]; labels: number[] } {
    const indices = tf.util.createShuffledIndices(images.length);
    const shuffledImages: tf.Tensor3D[] = [];
    const shuffledLabels: number[] = [];

    indices.forEach((idx) => {
      shuffledImages.push(images[idx]);
      shuffledLabels.push(labels[idx]);
    });

    return { images: shuffledImages, labels: shuffledLabels };
  }

  private splitData(images: tf.Tensor3D[], labels: number[]): DatasetSplit {
    if (images.length === 0) {
      throw new Error("Cannot split dataset: no images provided");
    }

    const splitIdx = Math.floor(images.length * (1 - this.validationSplit));

    if (splitIdx === 0 || splitIdx === images.length) {
      throw new Error(
        `Invalid split: need at least ${Math.ceil(1 / this.validationSplit)} images`,
      );
    }

    console.log("Creating batched tensors...");

    // Create 4D tensors for images
    const trainImages = this.stackTensorsManually(images.slice(0, splitIdx));
    const valImages = this.stackTensorsManually(images.slice(splitIdx));

    // Create 1D tensors for labels as float32 (required by sparseCategoricalCrossentropy)
    const trainLabels = tf.tensor1d(labels.slice(0, splitIdx), "float32");
    const valLabels = tf.tensor1d(labels.slice(splitIdx), "float32");

    console.log(`Training samples: ${trainImages.shape[0]}`);
    console.log(`Validation samples: ${valImages.shape[0]}`);

    return {
      train: { images: trainImages, labels: trainLabels },
      validation: { images: valImages, labels: valLabels },
    };
  }

  private stackTensorsManually(tensors: tf.Tensor3D[]): tf.Tensor4D {
    // Convert tensors to data arrays and stack manually
    return tf.tidy(() => {
      const numTensors = tensors.length;
      const shape = tensors[0].shape;
      const [height, width, channels] = shape;

      // Create a large buffer to hold all data
      const totalSize = numTensors * height * width * channels;
      const allData = new Float32Array(totalSize);

      // Copy each tensor's data into the buffer
      let offset = 0;
      for (let i = 0; i < numTensors; i++) {
        const data = tensors[i].dataSync();
        allData.set(data, offset);
        offset += data.length;
      }

      // Create the 4D tensor from the buffer
      return tf.tensor4d(allData, [numTensors, height, width, channels]);
    });
  }
}

import * as tf from "@tensorflow/tfjs-node";
import sharp from "sharp";
import * as fs from "fs";

export async function loadImage(
  imagePath: string,
  targetSize: number,
): Promise<tf.Tensor3D | null> {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      return null;
    }

    // Process image with sharp
    const buffer = await sharp(imagePath)
      .resize(targetSize, targetSize, {
        fit: "cover",
        position: "center",
      })
      .removeAlpha()
      .raw()
      .toBuffer();

    // Create Float32Array directly and normalize
    const pixels = new Uint8Array(buffer);
    const normalizedPixels = new Float32Array(pixels.length);

    for (let i = 0; i < pixels.length; i++) {
      normalizedPixels[i] = pixels[i] / 255.0;
    }

    // Verify we have the right amount of data
    const expectedSize = targetSize * targetSize * 3;
    if (normalizedPixels.length !== expectedSize) {
      console.warn(`Unexpected pixel data size for ${imagePath}`);
      return null;
    }

    // Create tensor directly as float32
    const tensor = tf.tensor3d(
      normalizedPixels,
      [targetSize, targetSize, 3],
      "float32",
    );

    return tensor as tf.Tensor3D;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`Failed to load ${imagePath}: ${errorMsg}`);
    return null;
  }
}

export function disposeImageTensors(tensors: (tf.Tensor3D | null)[]): void {
  tensors.forEach((tensor) => {
    if (tensor && !tensor.isDisposed) {
      tensor.dispose();
    }
  });
}

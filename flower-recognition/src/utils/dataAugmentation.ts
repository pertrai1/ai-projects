import * as tf from "@tensorflow/tfjs";
import { CONFIG } from "../config/constants";

export function augmentImage(image: tf.Tensor3D): tf.Tensor3D {
  let augmented = image;

  // Random horizontal flip
  if (Math.random() > 0.5) {
    const batched = augmented.expandDims(0) as tf.Tensor4D;
    augmented = tf.image.flipLeftRight(batched).squeeze([0]) as tf.Tensor3D;
  }

  // Random rotation
  const angle = Math.random() * 0.5 * 0.4;
  const batchedForRotation = augmented.expandDims(0) as tf.Tensor4D;
  augmented = tf.image
    .rotateWithOffset(batchedForRotation, angle)
    .squeeze([0]) as tf.Tensor3D;

  // Random zoom
  const zoomFactor = 1 + (Math.random() - 0.5) * 0.4;
  const newSize = Math.floor(CONFIG.IMG_SIZE * zoomFactor);
  augmented = tf.image.resizeBilinear(augmented, [
    newSize,
    newSize,
  ]) as tf.Tensor3D;
  const batchedForCrop = augmented.expandDims(0) as tf.Tensor4D;
  augmented = tf.image
    .cropAndResize(
      batchedForCrop,
      [[0.1, 0.1, 0.9, 0.9]],
      [0],
      [CONFIG.IMG_SIZE, CONFIG.IMG_SIZE],
    )
    .squeeze([0]) as tf.Tensor3D;

  return augmented;
}

export function augmentBatch(images: tf.Tensor4D): tf.Tensor4D {
  return tf.tidy(() => {
    const augmentedImages = tf
      .unstack(images)
      .map((img) => augmentImage(img as tf.Tensor3D));
    return tf.stack(augmentedImages) as tf.Tensor4D;
  });
}

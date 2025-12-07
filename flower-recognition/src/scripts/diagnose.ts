import * as fs from "fs";
import * as path from "path";
import { loadImage } from "../utils/imageLoader";
import { CONFIG } from "../config/constants";
import * as tf from "@tensorflow/tfjs-node";

async function diagnose() {
  console.log("=== TensorFlow.js Diagnostic ===\n");

  console.log("TensorFlow version:", tf.version.tfjs);
  console.log("Backend:", tf.getBackend());
  console.log();

  // Check dataset directory
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    console.error(`❌ Dataset directory not found: ${CONFIG.DATA_DIR}`);
    return;
  }

  console.log(`✓ Dataset directory exists: ${CONFIG.DATA_DIR}\n`);

  const classes = fs
    .readdirSync(CONFIG.DATA_DIR)
    .filter((f) => fs.statSync(path.join(CONFIG.DATA_DIR, f)).isDirectory());

  if (classes.length === 0) {
    console.error("❌ No class directories found");
    return;
  }

  console.log(`Found ${classes.length} classes\n`);

  let totalSuccess = 0;
  let totalFail = 0;

  // Test loading one image from each class
  for (const className of classes) {
    const classDir = path.join(CONFIG.DATA_DIR, className);
    const images = fs
      .readdirSync(classDir)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

    if (images.length === 0) {
      console.log(`⚠️  ${className}: No images found`);
      continue;
    }

    console.log(`Testing ${className} (${images.length} images)...`);

    // Try loading first image
    const testImagePath = path.join(classDir, images[0]);
    console.log(`  Loading: ${images[0]}`);

    const tensor = await loadImage(testImagePath, CONFIG.IMG_SIZE);

    if (tensor) {
      console.log(
        `  ✓ Success! Shape: ${tensor.shape}, dtype: ${tensor.dtype}`,
      );
      totalSuccess++;
      tensor.dispose();
    } else {
      console.log(`  ❌ Failed to load`);
      totalFail++;
    }

    console.log();
  }

  console.log(`Results: ${totalSuccess} classes passed, ${totalFail} failed`);

  if (totalSuccess === classes.length) {
    console.log("\n✅ All tests passed! Ready to train.");
  }

  console.log("=== Diagnosis Complete ===");
}

diagnose().catch((error) => {
  console.error("Diagnostic failed:", error);
  process.exit(1);
});

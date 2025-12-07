import * as fs from "fs";
import { loadImage } from "../utils/imageLoader";
import { CONFIG } from "../config/constants";

async function testImageLoading() {
  console.log("Testing image loading...");

  const testImagePath = "./test_images/sample.jpg";

  if (!fs.existsSync(testImagePath)) {
    console.error(`Test image not found: ${testImagePath}`);
    console.log("Please create a test_images folder with a sample.jpg file");
    return;
  }

  const tensor = await loadImage(testImagePath, CONFIG.IMG_SIZE);
  console.log("✓ Image loaded successfully");
  console.log(`  Shape: ${tensor.shape}`);
  console.log(`  Data type: ${tensor.dtype}`);

  tensor.dispose();
  console.log("✓ Tensor disposed");
}

testImageLoading().catch(console.error);

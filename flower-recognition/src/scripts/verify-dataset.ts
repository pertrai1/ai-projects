import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "../config/constants";

function verifyDataset() {
  console.log("Verifying dataset...\n");

  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    console.error(`❌ Dataset directory not found: ${CONFIG.DATA_DIR}`);
    console.log("\nPlease create the flowers/ directory and add your dataset.");
    process.exit(1);
  }

  const classes = fs
    .readdirSync(CONFIG.DATA_DIR)
    .filter((f) => fs.statSync(path.join(CONFIG.DATA_DIR, f)).isDirectory());

  if (classes.length === 0) {
    console.error("❌ No class directories found in flowers/");
    console.log("\nExpected structure:");
    console.log("  flowers/");
    console.log("  ├── daisy/");
    console.log("  ├── dandelion/");
    console.log("  ├── rose/");
    console.log("  ├── sunflower/");
    console.log("  └── tulip/");
    process.exit(1);
  }

  console.log(`✓ Found ${classes.length} classes:\n`);

  let totalImages = 0;
  let minImages = Infinity;
  let maxImages = 0;

  classes.forEach((className) => {
    const classDir = path.join(CONFIG.DATA_DIR, className);
    const images = fs
      .readdirSync(classDir)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

    totalImages += images.length;
    minImages = Math.min(minImages, images.length);
    maxImages = Math.max(maxImages, images.length);

    const status = images.length > 0 ? "✓" : "❌";
    console.log(`  ${status} ${className.padEnd(15)} ${images.length} images`);
  });

  console.log(`\nTotal images: ${totalImages}`);
  console.log(`Min images per class: ${minImages}`);
  console.log(`Max images per class: ${maxImages}`);

  if (totalImages === 0) {
    console.error(
      "\n❌ No images found! Please add images to the class directories.",
    );
    process.exit(1);
  }

  if (totalImages < 100) {
    console.warn(
      "\n⚠️  Warning: Very small dataset. Consider adding more images.",
    );
    console.log(
      "   Recommended: At least 100 images per class for good results.",
    );
  }

  console.log("\n✓ Dataset is ready for training!");

  // Estimate training time
  const estimatedMinutes = Math.ceil((totalImages * CONFIG.EPOCHS) / 1000);
  console.log(`\nEstimated training time: ~${estimatedMinutes} minutes`);
}

verifyDataset();

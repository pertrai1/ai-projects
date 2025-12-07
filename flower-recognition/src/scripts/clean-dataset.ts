import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { CONFIG } from "../config/constants";

async function cleanDataset() {
  console.log("🧹 Cleaning dataset...\n");
  console.log("This will remove corrupt or invalid images.\n");

  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    console.error(`❌ Dataset directory not found: ${CONFIG.DATA_DIR}`);
    process.exit(1);
  }

  const classes = fs
    .readdirSync(CONFIG.DATA_DIR)
    .filter((f) => fs.statSync(path.join(CONFIG.DATA_DIR, f)).isDirectory());

  if (classes.length === 0) {
    console.error("❌ No class directories found");
    process.exit(1);
  }

  let totalChecked = 0;
  let totalRemoved = 0;

  for (const className of classes) {
    const classDir = path.join(CONFIG.DATA_DIR, className);
    const images = fs
      .readdirSync(classDir)
      .filter((f) => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f));

    console.log(`Checking ${className} (${images.length} images)...`);

    let removed = 0;
    let checked = 0;

    for (const imageFile of images) {
      const imagePath = path.join(classDir, imageFile);
      checked++;
      totalChecked++;

      try {
        // Try to read image metadata
        const metadata = await sharp(imagePath).metadata();

        // Check if image is valid
        if (!metadata.width || !metadata.height) {
          console.log(`  ❌ Removing (no dimensions): ${imageFile}`);
          fs.unlinkSync(imagePath);
          removed++;
          totalRemoved++;
          continue;
        }

        if (metadata.width < 10 || metadata.height < 10) {
          console.log(
            `  ❌ Removing (too small ${metadata.width}×${metadata.height}): ${imageFile}`,
          );
          fs.unlinkSync(imagePath);
          removed++;
          totalRemoved++;
          continue;
        }

        // Check file size
        const stats = fs.statSync(imagePath);
        if (stats.size < 1000) {
          // Less than 1KB
          console.log(`  ❌ Removing (file too small): ${imageFile}`);
          fs.unlinkSync(imagePath);
          removed++;
          totalRemoved++;
          continue;
        }
      } catch (error) {
        console.log(`  ❌ Removing (corrupt): ${imageFile}`);
        fs.unlinkSync(imagePath);
        removed++;
        totalRemoved++;
      }
    }

    if (removed > 0) {
      console.log(`  ✓ Checked ${checked}, removed ${removed} bad images\n`);
    } else {
      console.log(`  ✓ All ${checked} images are valid\n`);
    }
  }

  console.log("═".repeat(50));
  console.log(`Cleaning complete!`);
  console.log(`  Total checked: ${totalChecked}`);
  console.log(`  Total removed: ${totalRemoved}`);
  console.log(`  Remaining: ${totalChecked - totalRemoved}`);
  console.log("═".repeat(50));

  if (totalRemoved > 0) {
    console.log(`\n✨ Removed ${totalRemoved} corrupt/invalid images`);
    console.log("\n💡 Run: npm run verify");
    console.log("   To see updated dataset statistics\n");
  } else {
    console.log("\n✅ No corrupt images found! Dataset is clean.\n");
  }
}

cleanDataset().catch((error) => {
  console.error("Error cleaning dataset:", error);
  process.exit(1);
});

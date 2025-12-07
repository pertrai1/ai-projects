import * as fs from "fs";
import * as path from "path";

function setupDirectories() {
  console.log("🌻 Setting up Flower Recognition project...\n");

  // Get project root (two levels up from this script)
  const rootDir = path.join(__dirname, "../..");

  const directories = [
    {
      path: "flowers",
      description: "Training dataset directory",
    },
    {
      path: "test_images",
      description: "Test images for predictions",
    },
    {
      path: "saved_model",
      description: "Trained model storage",
    },
  ];

  let createdCount = 0;
  let existedCount = 0;

  directories.forEach((dir) => {
    const fullPath = path.join(rootDir, dir.path);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created: ${dir.path}/`);
      console.log(`  → ${dir.description}\n`);
      createdCount++;
    } else {
      console.log(`✓ Already exists: ${dir.path}/`);
      console.log(`  → ${dir.description}\n`);
      existedCount++;
    }
  });

  console.log("═".repeat(50));
  console.log(`Setup complete!`);
  console.log(
    `  Created: ${createdCount} director${createdCount === 1 ? "y" : "ies"}`,
  );
  console.log(
    `  Already existed: ${existedCount} director${existedCount === 1 ? "y" : "ies"}`,
  );
  console.log("═".repeat(50));

  console.log("\n📋 Next steps:\n");
  console.log("1. Add your flower dataset to the flowers/ directory");
  console.log("   Structure should be:");
  console.log("   flowers/");
  console.log("   ├── daisy/");
  console.log("   ├── dandelion/");
  console.log("   ├── rose/");
  console.log("   ├── sunflower/");
  console.log("   └── tulip/\n");
  console.log("2. Add test images to test_images/ directory\n");
  console.log("3. Verify dataset: npm run verify");
  console.log("4. Train model: npm run train");
  console.log("5. Make predictions: npm run predict <image_path>\n");

  console.log("📖 For dataset download instructions, see README.md\n");
}

setupDirectories();

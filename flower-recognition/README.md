# Flower Recognition Using Convolutional Neural Network

A TypeScript implementation of a CNN-based flower classification system using TensorFlow.js. This project demonstrates supervised image classification by training a deep learning model to identify 5 different types of flowers.

## Overview

This model takes an image of a flower and predicts which of 5 flower species it is:
- **Daisy**
- **Dandelion**
- **Rose**
- **Sunflower**
- **Tulip**

The model uses a Convolutional Neural Network (CNN) architecture with multiple convolutional and pooling layers to extract visual features (colors, shapes, patterns, textures) and classify flower images with high accuracy.

## Features

- **Image Classification**: Identifies flowers from 5 different species
- **Data Augmentation**: Applies random transformations (flip, rotation, zoom) to improve model generalization
- **Modular Architecture**: Clean separation of concerns with dedicated modules for data loading, training, and prediction
- **TypeScript**: Type-safe implementation with full TypeScript support
- **TensorFlow.js**: Leverages TensorFlow.js for machine learning in Node.js
- **Memory Management**: Proper tensor disposal to prevent memory leaks
- **Progress Tracking**: Real-time training metrics and validation accuracy

## Use Cases

### 1. **Gardening & Plant Identification Apps**
- Help users identify unknown flowers in their garden
- Provide care instructions based on flower type
- Create digital plant catalogs

### 2. **Educational Tools**
- Interactive botany lessons for students
- Field guide applications
- Automated species identification for research

### 4. **Photography & Social Media**
- Auto-tag flower photos in galleries
- Add contextual information to posts
- Organize photo libraries by flower type

### 5. **Agriculture & Research**
- Monitor flower diversity in fields
- Track biodiversity changes
- Automated species surveys

## Prerequisites

- **Node.js**: Version 18.x (required for TensorFlow.js compatibility)
  ```bash
  node --version  # Should show v18.x.x
  ```
- **npm**: Version 8.x or higher
- **Operating System**: macOS, Linux, or Windows
- **RAM**: At least 8GB recommended for training
- **Storage**: ~2GB for dataset and model files

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flower-recognition
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `@tensorflow/tfjs-node@4.10.0` - TensorFlow.js for Node.js with native bindings
- `sharp@^0.34.5` - Image processing library
- `tsx@^4.21.0` - TypeScript execution environment
- `typescript@^5.9.3` - TypeScript compiler

### 3. Setup Project Directories

```bash
npm run setup
```

This creates the necessary directories:
- `flowers/` - Training dataset
- `test_images/` - Test images for predictions
- `saved_model/` - Where trained models are saved

### 4. Download Dataset

Download the flower dataset from [Kaggle Flowers Recognition](https://www.kaggle.com/datasets/alxmamaev/flowers-recognition) or use this quick download:

```bash
# Alternative: TensorFlow flowers dataset (smaller, good for testing)
wget https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz
tar -xzf flower_photos.tgz
mv flower_photos flowers
```

Your dataset should be organized as:
```bash
flowers/
├── daisy/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── dandelion/
│   └── ...
├── rose/
│   └── ...
├── sunflower/
│   └── ...
└── tulip/
    └── ...
```

## Project Structure

```bash
flower-recognition/
├── src/
│   ├── config/
│   │   └── constants.ts          # Configuration and constants
│   ├── utils/
│   │   ├── imageLoader.ts        # Image loading and preprocessing
│   │   └── dataAugmentation.ts   # Data augmentation utilities
│   ├── data/
│   │   └── datasetLoader.ts      # Dataset loading and splitting
│   ├── models/
│   │   └── cnnModel.ts           # CNN model architecture
│   ├── training/
│   │   └── trainer.ts            # Model training logic
│   ├── prediction/
│   │   └── predictor.ts          # Prediction utilities
│   ├── scripts/
│   │   ├── train.ts              # Training script
│   │   ├── predict.ts            # Prediction script
│   │   ├── diagnose.ts           # Diagnostic tool
│   │   ├── verify-dataset.ts     # Dataset verification
│   │   └── clean-dataset.ts      # Remove corrupt images
│   └── index.ts                  # Main entry point
├── flowers/                       # Training dataset (gitignored)
├── test_images/                   # Test images (gitignored)
├── saved_model/                   # Trained models (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Training the Model

### 1. Verify Your Dataset

Before training, verify your dataset is properly structured:

```bash
npm run verify
```

Expected output:
```
✓ Found 5 classes

  ✓ daisy           764 images
  ✓ dandelion       1052 images
  ✓ rose            784 images
  ✓ sunflower       733 images
  ✓ tulip           984 images

Total images: 4317
✓ Dataset is ready for training!
```

### 2. Run Diagnostics (Optional)

Test that image loading works correctly:

```bash
npm run diagnose
```

### 3. Start Training

```bash
npm run train
```

Training process:
- **Dataset Loading**: Loads and preprocesses all images (~4,300 images)
- **Data Splitting**: 80% training, 20% validation
- **Model Creation**: Builds CNN with ~6.5M parameters
- **Training**: 30 epochs with batch size of 64
- **Duration**: 10-30 minutes depending on your hardware

Expected output:
```bash
Loading dataset...
Found 5 classes: daisy, dandelion, rose, sunflower, tulip
Successfully loaded 4317 images total

Training samples: 3453
Validation samples: 864

Training model...
Epoch 1/30: loss=1.6094, acc=0.2500, val_loss=1.5892, val_acc=0.2800
Epoch 2/30: loss=1.4231, acc=0.3456, val_loss=1.3821, val_acc=0.3892
...
Epoch 30/30: loss=0.1234, acc=0.9567, val_loss=0.2341, val_acc=0.9234

Model saved to ./saved_model
Training complete!
```

### Model Architecture

```bash
__________________________________________________________________________________________
Layer (type)                Input Shape               Output shape              Param #
==========================================================================================
conv1 (Conv2D)              [null,224,224,3]          [null,224,224,64]         4,864
pool1 (MaxPooling2D)        [null,224,224,64]         [null,112,112,64]         0
conv2 (Conv2D)              [null,112,112,64]         [null,112,112,64]         36,928
pool2 (MaxPooling2D)        [null,112,112,64]         [null,56,56,64]           0
conv3 (Conv2D)              [null,56,56,64]           [null,56,56,64]           36,928
pool3 (MaxPooling2D)        [null,56,56,64]           [null,28,28,64]           0
conv4 (Conv2D)              [null,28,28,64]           [null,28,28,64]           36,928
pool4 (MaxPooling2D)        [null,28,28,64]           [null,14,14,64]           0
flatten (Flatten)           [null,14,14,64]           [null,12544]              0
dense1 (Dense)              [null,12544]              [null,512]                6,423,040
output (Dense)              [null,512]                [null,5]                  2,565
==========================================================================================
Total params: 6,541,253
Trainable params: 6,541,253
Non-trainable params: 0
__________________________________________________________________________________________
```

## Making Predictions

### Single Image Prediction

```bash
npm run predict path/to/flower.jpg
```

Example output:
```bash
Loading model...
Predicting path/to/flower.jpg...

✓ Predicted class: Rose
✓ Confidence: 89.23%

All probabilities:
  Rose          89.23% ████████████████████████████████████████████
  Tulip          7.45% ███
  Daisy          2.10% █
  Sunflower      0.92% 
  Dandelion      0.30% 
```

### Using in Code

```typescript
import { CNNModel } from './models/cnnModel';
import { Predictor } from './prediction/predictor';

async function classifyFlower(imagePath: string) {
  // Load the trained model
  const model = await CNNModel.load('./saved_model');
  
  // Create predictor
  const predictor = new Predictor(model);
  
  // Make prediction
  const result = await predictor.predict(imagePath);
  
  console.log(`Predicted: ${result.class}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
  
  return result;
}
```

## Configuration

Edit **src/config/constants.ts** to customize:

```typescript
export const CONFIG = {
  IMG_SIZE: 224,              // Image dimensions (224x224)
  BATCH_SIZE: 64,             // Training batch size
  EPOCHS: 30,                 // Number of training epochs
  VALIDATION_SPLIT: 0.2,      // 20% of data for validation
  FLOWER_CLASSES: [           // Flower types
    'Daisy', 
    'Dandelion', 
    'Rose', 
    'Sunflower', 
    'Tulip'
  ],
  MODEL_SAVE_PATH: './saved_model',
  DATA_DIR: './flowers',
  TEST_IMAGES_DIR: './test_images'
};
```

## Available Scripts

```bash
# Setup directories
npm run setup

# Verify dataset structure and count images
npm run verify

# Run diagnostics (test image loading)
npm run diagnose

# Clean corrupt/invalid images from dataset
npm run clean

# Train the model
npm run train

# Make a prediction
npm run predict <image_path>

# Run full pipeline (load data → train → predict)
npm start
```

## Troubleshooting

### Node.js Version Issues

**Problem**: `TypeError: (0, util_1.isNullOrUndefined) is not a function`

**Solution**: Use Node.js 18.x
```bash
nvm install 18
nvm use 18
rm -rf node_modules package-lock.json
npm install
```

### Memory Issues

**Problem**: Out of memory during training

**Solutions**:
- Reduce `BATCH_SIZE` in constants.ts (try 32 or 16)
- Reduce `IMG_SIZE` (try 128 or 160)
- Close other applications
- Ensure you have at least 8GB RAM

### Image Loading Failures

**Problem**: Many images fail to load

**Solution**: Clean the dataset
```bash
npm run clean
```

This removes corrupt or invalid images.

### Model Not Found

**Problem**: `Model not found` when running predictions

**Solution**: Train the model first
```bash
npm run train
```

## Model Performance

**Dataset**: 4,317 images across 5 classes
- Training: 3,453 images (80%)
- Validation: 864 images (20%)

**Expected Results** (after 30 epochs):
- Training Accuracy: ~92-95%
- Validation Accuracy: ~88-92%
- Training Loss: ~0.12-0.20
- Validation Loss: ~0.23-0.35

**Note**: Results may vary based on:
- Dataset quality
- Random initialization
- Data augmentation settings
- Hardware specifications

## Model Limitations

1. **Limited Species**: Only identifies 5 flower types
2. **Dataset Bias**: Trained on specific photo styles/angles
3. **No "Unknown" Class**: Always predicts one of the 5 classes, even for non-flowers
4. **Background Sensitivity**: May struggle with complex backgrounds
5. **Lighting Conditions**: Performance varies with different lighting

## Future Improvements

### Expand the Model
- [ ] Add more flower species (10, 50, 100+ types)
- [ ] Include "unknown" or "other" category
- [ ] Multi-label classification (flower + color, flower + health status)

### Improve Accuracy
- [ ] Use transfer learning (MobileNet, ResNet)
- [ ] Implement more data augmentation
- [ ] Add test-time augmentation
- [ ] Ensemble multiple models

### Deployment
- [ ] Create REST API (Express.js)
- [ ] Build web interface (React + TensorFlow.js in browser)
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] Cloud deployment (AWS, GCP, Azure)

### Features
- [ ] Batch prediction support
- [ ] Confidence threshold filtering
- [ ] Visual attention maps (Grad-CAM)
- [ ] Model versioning
- [ ] A/B testing framework

## Technical Details

### Data Preprocessing
- Images resized to 224×224×3 (RGB)
- Pixel values normalized to [0, 1]
- Data augmentation: horizontal flip, rotation, zoom

### Model Architecture
- **Type**: Sequential CNN
- **Layers**: 4 convolutional blocks + 2 dense layers
- **Activation**: ReLU (hidden), Softmax (output)
- **Parameters**: 6.5M trainable parameters

### Training Configuration
- **Optimizer**: Adam
- **Loss Function**: Sparse Categorical Cross-entropy
- **Metrics**: Accuracy
- **Batch Size**: 64
- **Epochs**: 30

### Technologies
- **TensorFlow.js**: Machine learning framework
- **Sharp**: Fast image processing
- **TypeScript**: Type-safe development
- **tsx**: TypeScript execution

## Development Notes

### Adding New Flower Types

1. Create new folder in `flowers/` directory
2. Add images to the folder
3. Update `FLOWER_CLASSES` in `constants.ts`
4. Retrain the model

```typescript
// constants.ts
export const CONFIG = {
  ...
  FLOWER_CLASSES: [
    'Daisy', 
    'Dandelion', 
    'Rose', 
    'Sunflower', 
    'Tulip',
    'Orchid',      // New class
    'Lily'         // New class
  ],
};
```

### Adjusting Training Parameters

```typescript
// For faster training (lower accuracy)
BATCH_SIZE: 128,
EPOCHS: 10,
IMG_SIZE: 128

// For better accuracy (slower training)
BATCH_SIZE: 32,
EPOCHS: 50,
IMG_SIZE: 256
```

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Original Python implementation from [GeeksforGeeks](https://www.geeksforgeeks.org/)
- Flower dataset from [Kaggle](https://www.kaggle.com/datasets/alxmamaev/flowers-recognition)
- TensorFlow.js team for the amazing framework
- Sharp library for fast image processing

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Submit a pull request
- Contact the maintainers

---

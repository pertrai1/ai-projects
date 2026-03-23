# AI and Machine Learning Topics

Each of the subtopics below will have a separate document that will have specific information. Sections are ordered as a learning path — earlier sections build foundations for later ones. Topics within each section progress from foundational to advanced.

## Machine Learning - is a strategy

> Start here. ML provides the statistical foundations — how models learn from data, measure error, and generalize. Topics progress from the simplest models (linear regression) through interpretable classifiers (decision trees) to powerful ensembles (gradient boosting), then into unsupervised and hybrid paradigms.

- [Supervised Learning](./machine-learning/supervised_learning.md)
- Linear Regression
- Logistic Regression
- Naive Bayes
- [Hypothesis Testing](./machine-learning/hypothesis_testing.md)
- Feature Engineering
- [K-Nearest Neighbors](./machine-learning/k_nearest_neighbors.md)
- [Decision Trees](./machine-learning/decision_trees.md)
- Random Forests
- Support Vector Machines
- Unsupervised Learning
- K-means Clustering
- Principal Component Analysis
- Bayesian Methods
- Gradient Boosting (XGBoost, LightGBM)
- Semi-supervised Learning
- Anomaly Detection

## Neural Networks - is a tool

> With ML fundamentals in place, neural networks introduce the core building blocks of modern AI. Topics start with the smallest unit (activation functions, perceptron), build up to full architectures (feed-forward networks), then cover how they learn (backpropagation, optimizers) before reaching modern innovations like attention and graph networks.

- Activation Functions
- Perceptron
- Feed Forward Networks
- [Backpropagation](./neural-networks/backpropagation.md)
- Optimization Algorithms (Adam, SGD)
- Radial Basis Function Networks
- Self-Organizing Maps
- Hopfield Networks
- Boltzmann Machines
- Attention Mechanisms
- Graph Neural Networks (GNN)
- Liquid State Machines

## Deep Learning - optimization of neural networks

> Deep learning scales neural networks into powerful specialized architectures. Topics begin with training mechanics (epochs, batches), move through foundational architectures (CNNs for images, RNNs/LSTMs for sequences), into generative models (GANs, autoencoders), then to the transformer revolution and frontier architectures (diffusion models, state space models, mixture of experts).

- Epochs and Batches
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)
- Long Short-Term Memory Networks (LSTM)
- [Autoencoders](./deep-learning/autoencoders.md)
- Generative Adversarial Networks (GAN)
- Deep Belief Networks
- [Transformers](./deep-learning/transformers.md)
- Vision Transformers (ViT)
- Deep Reinforcement Learning
- Diffusion Models
- State Space Models (Mamba)
- Mixture of Experts (MoE)
- Knowledge Distillation

## Artificial Intelligence - is a goal

> Now that you understand the tools (ML, NNs, deep learning), this section covers the broader AI disciplines and goals they serve. Topics start with the major applied fields (NLP, computer vision, speech), move through principles and ethics, then into advanced concepts like autonomous agents and emergent behavior that require deep understanding of the underlying systems.

- Natural Language Processing (NLP)
- Computer Vision
- [Speech Recognition](./artificial-intelligence/speech_recognition.md)
- [Algorithm Building](./artificial-intelligence/algorithm_building.md)
- [AI Ethics](./artificial-intelligence/ai_ethics.md)
- AI Safety & Alignment
- [Reinforcement Learning](./artificial-intelligence/reinforcement_learning.md)
- [Agents](./artificial-intelligence/agents.md)
- [Augmented Programming](./artificial-intelligence/augmented_programming.md)
- [Emergent Behavior](./artificial-intelligence/emergent_behavior.md)
- Multi-modal AI

## General AI - highly specialized outcome of scale and data

> This section covers what happens when deep learning meets massive scale and data. Topics start with foundational scaling concepts (transfer learning, foundation models), move through LLMs and learning paradigms (few-shot, zero-shot), then into the alignment and efficiency techniques (RLHF, DPO, LoRA, quantization) that make these systems practical and safe.

- Transfer Learning
- Foundation Models
- [Large Language Models (LLM)](./artificial-intelligence/large_language_models.md)
- Ensemble Models
- [N-Shot Learning](./artificial-intelligence/n_shot_learning.md)
- [Zero-Shot Learning (ZSL)](./artificial-intelligence/zero_shot_learning.md)
- [One-Shot Learning (OSL)](artificial-intelligence/one_shot_learning.md)
- BigGAN
- [Retrieval-Augmented Generation (RAG)](./artificial-intelligence/retrieval_augmented_generation.md)
- Chain-of-Thought & Reasoning
- [Reinforcement Learning with Human Feedback (RLHF)](./artificial-intelligence/rlhf.md)
- Direct Preference Optimization (DPO)
- Constitutional AI (CAI)
- [LoRA (Low-Rank Adaptation)](./artificial-intelligence/lora.md)
- Synthetic Data Generation
- Model Quantization & Compression

## AI/ML Engineering & Operations - building production AI systems

> The practical side — how to build, ship, and maintain AI systems in production. Topics start with data fundamentals (tokenization, datasets, embeddings), progress through model development (evaluation, fine-tuning), into production infrastructure (CI/CD, deployment, monitoring), and finish with governance and compliance. Best learned alongside or after the theory sections above.

- Tokenization
- Dataset Management
- Vector Databases & Embeddings
- Feature Stores
- Prompt Engineering
- Model Testing & Validation
- [Model Evaluations & Benchmarking](./ai-ml-engineering-operations/model_evaluations_and_benchmarking.md)
- [Fine-tuning Methodologies](./ai-ml-engineering-operations/fine_tuning_methodologies.md)
- Bias Detection & Mitigation
- Model Versioning & Management
- AI/ML CI/CD
- Deployment Strategies
- Inference Optimization
- Model Monitoring & Observability
- [A/B Testing for AI Systems](./ai-ml-engineering-operations/ab_testing_for_ai_systems.md)
- Edge AI / On-device ML
- Spec-Driven Development
- AI Governance & Compliance

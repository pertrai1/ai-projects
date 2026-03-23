# AI and Machine Learning Topics

Each of the subtopics below will have a separate document that will have specific information. Sections are ordered as a learning path — earlier sections build foundations for later ones. Topics within each section progress from foundational to advanced.

## Machine Learning - is a strategy

> Start here. ML provides the statistical foundations — how models learn from data, measure error, and generalize. Topics progress from the simplest models (linear regression) through interpretable classifiers (decision trees) to powerful ensembles (gradient boosting), then into unsupervised and hybrid paradigms.

- **[Supervised Learning](./machine-learning/supervised_learning.md)** — Learn mappings from labeled inputs to outputs.
- **Linear Regression** — Predict continuous values with linear relationships.
- **Logistic Regression** — Predict class probabilities for binary/multiclass tasks.
- **Naive Bayes** — Fast probabilistic classification with feature independence assumptions.
- **[Hypothesis Testing](./machine-learning/hypothesis_testing.md)** — Validate claims with statistical significance and confidence.
- **Feature Engineering** — Create and transform inputs to improve model quality.
- **[K-Nearest Neighbors](./machine-learning/k_nearest_neighbors.md)** — Classify/regress by similarity to nearby examples.
- **[Decision Trees](./machine-learning/decision_trees.md)** — Interpretable rule-based splits for predictions.
- **Random Forests** — Reduce overfitting via bagged ensembles of trees.
- **Support Vector Machines** — Max-margin classifiers for high-dimensional data.
- **Unsupervised Learning** — Discover structure without labeled outcomes.
- **K-means Clustering** — Group similar points into k centroid-based clusters.
- **Principal Component Analysis** — Reduce dimensionality while preserving variance.
- **Bayesian Methods** — Model uncertainty explicitly with prior and posterior beliefs.
- **Gradient Boosting (XGBoost, LightGBM)** — Strong tabular performance via sequential error correction.
- **Semi-supervised Learning** — Combine small labeled and large unlabeled datasets.
- **Anomaly Detection** — Identify rare, unusual, or risky patterns.

## Neural Networks - is a tool

> With ML fundamentals in place, neural networks introduce the core building blocks of modern AI. Topics start with the smallest unit (activation functions, perceptron), build up to full architectures (feed-forward networks), then cover how they learn (backpropagation, optimizers) before reaching modern innovations like attention and graph networks.

- **Activation Functions** — Introduce nonlinearity so networks can learn complex patterns.
- **Perceptron** — The simplest single-neuron binary classifier.
- **Feed Forward Networks** — Stack layers for general function approximation.
- **[Backpropagation](./neural-networks/backpropagation.md)** — Compute gradients efficiently for learning.
- **Optimization Algorithms (Adam, SGD)** — Update weights to minimize loss.
- **Radial Basis Function Networks** — Use distance-based hidden units for smooth interpolation.
- **Self-Organizing Maps** — Project high-dimensional data onto interpretable grids.
- **Hopfield Networks** — Recurrent associative memory for pattern completion.
- **Boltzmann Machines** — Energy-based probabilistic neural models.
- **Attention Mechanisms** — Let models focus on the most relevant tokens.
- **Graph Neural Networks (GNN)** — Learn from relational graph-structured data.
- **Liquid State Machines** — Reservoir-style computation for temporal dynamics.

## Deep Learning - optimization of neural networks

> Deep learning scales neural networks into powerful specialized architectures. Topics begin with training mechanics (epochs, batches), move through foundational architectures (CNNs for images, RNNs/LSTMs for sequences), into generative models (GANs, autoencoders), then to the transformer revolution and frontier architectures (diffusion models, state space models, mixture of experts).

- **Epochs and Batches** — Core training loop concepts controlling optimization cadence.
- **Convolutional Neural Networks (CNN)** — Local pattern learners for vision tasks.
- **Recurrent Neural Networks (RNN)** — Sequence models with stepwise hidden state.
- **Long Short-Term Memory Networks (LSTM)** — RNN variant for longer-range dependencies.
- **[Autoencoders](./deep-learning/autoencoders.md)** — Learn compressed latent representations and reconstruction.
- **Generative Adversarial Networks (GAN)** — Generator-discriminator game for realistic synthesis.
- **Deep Belief Networks** — Layer-wise probabilistic pretraining architecture.
- **[Transformers](./deep-learning/transformers.md)** — Attention-first architecture for sequence modeling at scale.
- **Vision Transformers (ViT)** — Transformer adaptation for image patch sequences.
- **Deep Reinforcement Learning** — Combine neural function approximation with RL objectives.
- **Diffusion Models** — Iterative denoising approach for high-quality generation.
- **State Space Models (Mamba)** — Efficient long-context sequence modeling alternative.
- **Mixture of Experts (MoE)** — Scale capacity via sparsely activated expert subnetworks.
- **Knowledge Distillation** — Transfer performance from large teacher to smaller student.

## Artificial Intelligence - is a goal

> Now that you understand the tools (ML, NNs, deep learning), this section covers the broader AI disciplines and goals they serve. Topics start with the major applied fields (NLP, computer vision, speech), move through principles and ethics, then into advanced concepts like autonomous agents and emergent behavior that require deep understanding of the underlying systems.

- **Natural Language Processing (NLP)** — Build systems that understand and generate language.
- **Computer Vision** — Interpret and reason over image/video content.
- **[Speech Recognition](./artificial-intelligence/speech_recognition.md)** — Convert spoken audio into text.
- **[Algorithm Building](./artificial-intelligence/algorithm_building.md)** — Design repeatable problem-solving procedures.
- **[AI Ethics](./artificial-intelligence/ai_ethics.md)** — Address fairness, harm, transparency, and accountability.
- **AI Safety & Alignment** — Keep model behavior reliable and aligned with intent.
- **[Reinforcement Learning](./artificial-intelligence/reinforcement_learning.md)** — Learn actions by reward-driven interaction.
- **[Agents](./artificial-intelligence/agents.md)** — Autonomous systems that plan and use tools.
- **[Augmented Programming](./artificial-intelligence/augmented_programming.md)** — AI-assisted software development workflows.
- **[Emergent Behavior](./artificial-intelligence/emergent_behavior.md)** — New capabilities arising from scale and complexity.
- **Multi-modal AI** — Integrate text, vision, audio, and other modalities.

## General AI - highly specialized outcome of scale and data

> This section covers what happens when deep learning meets massive scale and data. Topics start with foundational scaling concepts (transfer learning, foundation models), move through LLMs and learning paradigms (few-shot, zero-shot), then into the alignment and efficiency techniques (RLHF, DPO, LoRA, quantization) that make these systems practical and safe.

- **Transfer Learning** — Reuse pretrained knowledge on new tasks.
- **Foundation Models** — Large pretrained models adaptable across domains.
- **[Large Language Models (LLM)](./artificial-intelligence/large_language_models.md)** — Scaled generative models for language tasks.
- **Ensemble Models** — Improve robustness by combining multiple model outputs.
- **[N-Shot Learning](./artificial-intelligence/n_shot_learning.md)** — Learn behavior from a handful of examples.
- **[Zero-Shot Learning (ZSL)](./artificial-intelligence/zero_shot_learning.md)** — Generalize to unseen tasks without examples.
- **[One-Shot Learning (OSL)](artificial-intelligence/one_shot_learning.md)** — Adapt from a single labeled example.
- **BigGAN** — Large-scale GAN variant for high-fidelity generation.
- **[Retrieval-Augmented Generation (RAG)](./artificial-intelligence/retrieval_augmented_generation.md)** — Ground generation with external knowledge retrieval.
- **Chain-of-Thought & Reasoning** — Structured reasoning strategies for better outputs.
- **[Reinforcement Learning with Human Feedback (RLHF)](./artificial-intelligence/rlhf.md)** — Align behavior using human preference signals.
- **Direct Preference Optimization (DPO)** — Preference-based alignment without explicit reward modeling.
- **Constitutional AI (CAI)** — Alignment through rule-guided self-critique and revision.
- **[LoRA (Low-Rank Adaptation)](./artificial-intelligence/lora.md)** — Parameter-efficient fine-tuning of large models.
- **Synthetic Data Generation** — Create training data when real labels are scarce.
- **Model Quantization & Compression** — Reduce model size and inference cost.

## AI/ML Engineering & Operations - building production AI systems

> The practical side — how to build, ship, and maintain AI systems in production. Topics start with data fundamentals (tokenization, datasets, embeddings), progress through model development (evaluation, fine-tuning), into production infrastructure (CI/CD, deployment, monitoring), and finish with governance and compliance. Best learned alongside or after the theory sections above.

- **Tokenization** — Convert raw text into model-consumable token units.
- **Dataset Management** — Version, curate, and maintain reliable training/eval data.
- **Vector Databases & Embeddings** — Enable semantic search and retrieval pipelines.
- **Feature Stores** — Serve consistent features for training and inference.
- **Prompt Engineering** — Design prompts that reliably steer model behavior.
- **Model Testing & Validation** — Verify correctness, reliability, and regressions.
- **[Model Evaluations & Benchmarking](./ai-ml-engineering-operations/model_evaluations_and_benchmarking.md)** — Compare models with standardized metrics and tasks.
- **[Fine-tuning Methodologies](./ai-ml-engineering-operations/fine_tuning_methodologies.md)** — Adapt base models to domain-specific behavior.
- **Bias Detection & Mitigation** — Measure and reduce harmful model disparities.
- **Model Versioning & Management** — Track artifacts, lineage, and reproducible rollbacks.
- **AI/ML CI/CD** — Automate training, testing, and deployment pipelines.
- **Deployment Strategies** — Roll out safely using staged release patterns.
- **Inference Optimization** — Improve latency, throughput, and infrastructure cost.
- **Model Monitoring & Observability** — Detect drift, outages, and quality degradation.
- **[A/B Testing for AI Systems](./ai-ml-engineering-operations/ab_testing_for_ai_systems.md)** — Validate improvements with controlled experiments.
- **Edge AI / On-device ML** — Run models locally for speed/privacy constraints.
- **Spec-Driven Development** — Build against explicit, testable behavioral specifications.
- **AI Governance & Compliance** — Satisfy policy, audit, and regulatory requirements.

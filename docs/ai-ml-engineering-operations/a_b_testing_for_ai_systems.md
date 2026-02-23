# A/B Testing for AI Systems

---

## 1. Overview

**A/B Testing for AI Systems** is a controlled experimentation methodology used to evaluate and compare different versions of machine learning models, algorithms, or AI-powered features in production environments. Instead of relying solely on offline metrics, A/B testing measures **real-world impact** by exposing different user populations to different variants and analyzing the results statistically.

The core idea is simple:

* Split traffic between a control variant (A) and one or more treatment variants (B, C, etc.)
* Measure key metrics and user behavior for each variant
* Use statistical hypothesis testing to determine if observed differences are significant
* Make data-driven decisions about which variant to deploy

A/B testing is particularly well-suited for problems involving **production deployment**, **user-facing AI systems**, and situations where **offline metrics may not capture real-world performance**.

---

## 2. Core Concepts

### Hypothesis

A clear, testable statement about expected outcomes. Example: "The new recommendation model will increase user engagement by 5%."

### Variants (Control and Treatment)

* **Control (A)**: The baseline—typically the existing production system
* **Treatment (B, C, ...)**: New models or features being evaluated

### Randomization

Random assignment of users to variants ensures unbiased comparison and enables causal inference.

### Sample Size

The number of observations needed to detect a meaningful effect with statistical confidence.

### Statistical Significance

A measure of confidence that observed differences are not due to random chance. Typically measured using p-values with a threshold of 0.05.

### Statistical Power

The probability of detecting a true effect when it exists. Standard practice targets 80% power.

### Primary Metric

The main success criterion (e.g., click-through rate, conversion rate, revenue per user).

### Guardrail Metrics

Secondary metrics that must not degrade (e.g., latency, error rate, user satisfaction).

### Minimum Detectable Effect (MDE)

The smallest change in a metric that the experiment can reliably detect.

---

## 3. The A/B Testing Workflow

1. **Define Hypothesis**: Articulate what you're testing and expected outcomes
2. **Select Metrics**: Choose primary metric and guardrails
3. **Calculate Sample Size**: Determine experiment duration based on traffic and effect size
4. **Implement Randomization**: Set up traffic splitting infrastructure
5. **Run Experiment**: Collect data while monitoring for issues
6. **Analyze Results**: Apply statistical tests to determine significance
7. **Make Decision**: Ship the winner, iterate, or run follow-up experiments
8. **Document and Share**: Record learnings for institutional knowledge

This workflow applies whether testing ML models, prompt variations, or entire AI systems.

---

## 4. Types of A/B Tests for AI Systems

### Simple A/B Test

Two variants: control and one treatment. The most common and straightforward approach.

### A/B/n Test

Multiple treatments tested simultaneously against a control. Efficient but requires larger sample sizes.

### Sequential Testing

Continuously monitor results and stop early if significance is reached. Reduces experiment duration.

### Multi-Armed Bandit (MAB)

Dynamically allocate more traffic to better-performing variants during the experiment. Balances exploration and exploitation.

### Contextual Bandit

MAB that considers user context when allocating traffic. Personalizes variant assignment.

### Interleaving Experiments

For ranking systems, show results from different models interleaved in the same session. More sensitive than A/B testing.

### Switchback Tests

Time-based alternation between variants. Useful when randomization is difficult or network effects exist.

### Shadow Mode / Dark Launch

Run the new model in parallel with production, logging predictions without serving them. Zero-risk evaluation.

---

## 5. Simple Example (Intuition)

**Recommendation Model Comparison**:

* **Control (A)**: Collaborative filtering model serving 50% of users
* **Treatment (B)**: Neural collaborative filtering model serving 50% of users
* **Primary Metric**: Click-through rate (CTR)
* **Guardrail**: Model latency < 100ms

After running for 2 weeks:
* Control CTR: 2.3%
* Treatment CTR: 2.5%
* p-value: 0.01 (significant)
* Latency: Both < 80ms

**Key insight**: Despite similar offline metrics (AUC, precision@k), the new model drives 8.7% higher engagement in production, justifying the deployment.

---

## 6. Statistical Foundations

### Hypothesis Testing

* **Null Hypothesis (H₀)**: No difference between variants
* **Alternative Hypothesis (H₁)**: A difference exists
* **p-value**: Probability of observing results assuming H₀ is true
* **Significance level (α)**: Threshold for rejecting H₀ (typically 0.05)

### Test Statistics

* **t-test**: For continuous metrics (mean comparisons)
* **z-test**: For proportions and large samples
* **chi-square test**: For categorical outcomes
* **Mann-Whitney U test**: Non-parametric alternative for non-normal distributions

### Effect Size

Beyond statistical significance, measure practical significance:
* **Absolute difference**: Treatment value - Control value
* **Relative lift**: (Treatment - Control) / Control
* **Cohen's d**: Standardized effect size

### Confidence Intervals

Report confidence intervals (typically 95%) to show range of plausible values for the true effect.

### Multiple Testing Correction

When testing multiple metrics or running multiple tests:
* **Bonferroni correction**: Divide α by number of tests
* **Benjamini-Hochberg procedure**: Controls false discovery rate
* **Hierarchical testing**: Pre-define primary and secondary metrics

---

## 7. Classical Experimentation Approaches

### Fixed-Horizon Testing

Run experiment for predetermined duration, analyze at the end. Strict control of Type I error.

### Frequentist Framework

Traditional hypothesis testing with p-values and confidence intervals. Most common in industry.

### Bayesian A/B Testing

Uses Bayesian inference to calculate probability that one variant is better. Allows for:
* Incorporating prior beliefs
* More intuitive interpretation
* Sequential monitoring without inflation of error rates

### Power Analysis

Pre-experiment calculation to determine required sample size:
```
n = (Z_α/2 + Z_β)² × (σ²_A + σ²_B) / δ²
```
Where:
* Z_α/2: Critical value for significance level
* Z_β: Critical value for power
* σ²: Variance
* δ: Minimum detectable effect

### Stratified Randomization

Ensure balanced assignment across important segments (e.g., geography, device type, user tier).

---

## 8. Modern A/B Testing for AI

**AI-specific testing** introduces unique challenges addressed by modern approaches:

### Adaptive Experimentation

* **Multi-Armed Bandits**: Thompson Sampling, UCB algorithms
* **Contextual Bandits**: LinUCB, neural bandits
* **Continuous optimization**: Automatically adjust traffic allocation

### Offline Evaluation Integration

* **Counterfactual evaluation**: Estimate online performance using logged data
* **Inverse propensity scoring**: Correct for selection bias in logged data
* **Doubly robust estimation**: Combine model-based and importance sampling methods

### Causal Inference

* **Instrumental variables**: Handle non-compliance and selection bias
* **Difference-in-differences**: Control for temporal trends
* **Regression discontinuity**: Exploit natural experiments

### Delayed Conversion Modeling

Many AI systems have delayed feedback:
* **Early indicators**: Use short-term proxies for long-term outcomes
* **Survival analysis**: Account for censored data
* **Predictive models**: Forecast long-term impact from early observations

---

## 9. Modern Tools and Platforms

### Commercial Experimentation Platforms

**Optimizely**
* Feature flagging and experimentation
* Visual editor for website testing
* Stats engine with sequential testing
* Integrations with major data warehouses

**LaunchDarkly**
* Feature management platform with experimentation
* Real-time flag updates
* Gradual rollouts and kill switches
* Strong developer focus

**Statsig**
* Modern experimentation platform
* Pulse results dashboard
* Automated metric guardrails
* Built for product and ML teams

**Eppo**
* Warehouse-native experimentation
* SQL-based metric definitions
* Statistical rigor focus
* Works with existing data infrastructure

**Split.io**
* Feature delivery platform
* Impact tracking for every feature
* Real-time metrics
* Engineering-focused

### Open Source Tools

**GrowthBook**
* Open-source feature flagging and A/B testing
* Bayesian statistics
* Visual editor
* Self-hosted or cloud

**Wasabi (Netflix)**
* Open-source experimentation platform (though now mostly internal)
* Influenced many modern platforms
* Focus on large-scale experimentation

**PlanOut (Facebook)**
* Framework for online field experiments
* Expressive experiment specification language
* Supports complex randomization schemes

### ML-Specific Platforms

**Vertex AI Experiments (Google Cloud)**
* Integrated with ML training pipelines
* Model comparison and versioning
* Experiment tracking

**SageMaker Experiments (AWS)**
* Track and compare ML experiments
* Integrated with SageMaker training
* Automatic metric logging

**MLflow**
* Open-source ML lifecycle platform
* Experiment tracking
* Model registry
* Deployment integration

### Analysis Libraries

**scipy.stats (Python)**
* Statistical tests (t-test, chi-square, etc.)
* Power analysis functions

**statsmodels (Python)**
* Advanced statistical modeling
* Regression and time series analysis

**pyro/numpyro (Python)**
* Probabilistic programming
* Bayesian A/B testing

---

## 10. Common Applications

* **Model Comparison**: Evaluate new ML models against baselines in production
* **Prompt Engineering**: Test different prompts for LLMs and select the best
* **Feature Selection**: Determine which input features improve model performance
* **Ranking and Recommendation**: Compare algorithms for search, feed, and recommendation systems
* **Personalization Strategies**: Test different approaches to user personalization
* **UI/UX for AI Features**: Optimize how AI predictions are presented to users
* **Resource Allocation**: Test different traffic routing or load balancing strategies
* **Pricing and Bidding**: Evaluate ML-driven dynamic pricing or bid optimization
* **Content Generation**: Compare different generative AI outputs (text, images, code)

A/B testing is especially powerful where **offline metrics diverge from business objectives** or **user behavior is unpredictable**.

---

## 11. Key Research Papers

### Foundational Statistics

* **Statistical Methods for Research Workers** — R.A. Fisher (1925)
  * Foundational work on hypothesis testing

* **The Design of Experiments** — R.A. Fisher (1935)
  * Principles of randomization and experimental design

### Online Experimentation

* **Controlled Experiments on the Web: Survey and Practical Guide** — Kohavi et al. (2009)
  * Seminal paper on web-scale A/B testing

* **Seven Rules of Thumb for Web Site Experimenters** — Kohavi et al. (2014)
  * Practical guidance from Microsoft Bing

* **Online Controlled Experiments at Large Scale** — Kohavi et al. (2013)
  * Challenges and solutions for large-scale experimentation

### Bandit Algorithms

* **A Contextual-Bandit Approach to Personalized News Article Recommendation** — Li et al. (2010)
  * LinUCB algorithm for contextual bandits

* **Thompson Sampling for Contextual Bandits with Linear Payoffs** — Agrawal & Goyal (2013)
  * Bayesian approach to contextual bandits

* **Deep Bayesian Bandits Showdown** — Riquelme et al. (2018)
  * Survey of bandit algorithms including neural approaches

### Causal Inference

* **Causal Inference in Statistics: A Primer** — Pearl et al. (2016)
  * Foundational causal inference concepts

* **Reliable Post-hoc Estimations of Treatment Effects** — Yan et al. (2018)
  * Methods for experiment analysis with observational data

### AI System Evaluation

* **Beyond Accuracy: Behavioral Testing of NLP Models with CheckList** — Ribeiro et al. (2020)
  * Comprehensive behavioral testing for AI systems

* **Improving the Accuracy of Model-Based Counterfactual Explanations** — Lucic et al. (2021)
  * Counterfactual evaluation methods

---

## 12. Learning Resources (Free & High Quality)

### Courses

* **Udacity A/B Testing by Google** — Comprehensive practical course on experimentation

* **Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing** — Kohavi, Tang, Xu (Book)
  * The definitive industry reference (not free, but essential)

* **Coursera: Designing, Running, and Analyzing Experiments** — UC San Diego
  * Academic foundations of experimental design

* **MIT 15.S50 Poker Theory and Analytics** — Includes bandit algorithms and decision making

### Tutorials & Guides

* **Evan Miller's A/B Testing Tools** — Online calculators and statistical guidance

* **Netflix Technology Blog** — Real-world experimentation case studies

* **Booking.com Data Science Blog** — Practical experimentation insights

* **Spotify Research** — Bandits and experimentation for recommendations

### Libraries & Tooling

* **GrowthBook** — Open-source feature flagging and experimentation

* **PlanOut** — Facebook's experiment specification framework

* **scipy.stats** — Statistical testing in Python

* **statsmodels** — Advanced statistical modeling

* **pymc3 / numpyro** — Bayesian A/B testing

* **causalnex** — Causal inference toolkit

* **EconML (Microsoft)** — Heterogeneous treatment effect estimation

### Industry Blogs

* **Airbnb Data Science** — Experimentation platform architecture

* **LinkedIn Engineering** — Large-scale A/B testing practices

* **Uber Engineering** — Experimentation and causal inference

* **Twitter Engineering** — Lightweight experimentation frameworks

---

## 13. Practical Advice for Learning A/B Testing

1. **Start with simple tests** before complex multi-armed bandits
2. **Master sample size calculations** and power analysis
3. **Always define success metrics upfront** before running experiments
4. **Learn to spot common statistical pitfalls** (p-hacking, peeking, multiple comparisons)
5. **Practice interpreting p-values and confidence intervals** correctly
6. **Understand the difference between statistical and practical significance**
7. **Study real-world case studies** from tech companies
8. **Run simulations** to build intuition about variance and sample size
9. **Learn about network effects and interference** when users influence each other
10. **Combine offline evaluation with online testing** for faster iteration

---

## 14. Common Pitfalls

### Peeking (Continuous Monitoring)

Repeatedly checking results and stopping early when significance is reached inflates false positive rate.

**Solution**: Use sequential testing methods or commit to fixed duration.

### Insufficient Sample Size

Running experiments without adequate power leads to false negatives (missing real effects).

**Solution**: Always conduct power analysis before starting.

### Multiple Comparisons Problem

Testing many metrics or segments without correction increases false positives.

**Solution**: Pre-define primary metric or use multiple testing corrections.

### Selection Bias

Non-random assignment or self-selection into variants invalidates causal claims.

**Solution**: Ensure proper randomization and check balance across variants.

### Novelty Effects

Users react differently to new features initially, then behavior normalizes.

**Solution**: Run experiments long enough to observe steady-state behavior.

### Interference / Spillover

One user's treatment affects another user's outcome (common in social networks, marketplaces).

**Solution**: Use cluster randomization or network-aware experimental designs.

### Instrumentation Errors

Logging bugs, sampling bias, or metric implementation errors corrupt results.

**Solution**: Validate instrumentation with A/A tests and data quality checks.

### Ignoring Non-Stationarity

AI models drift over time, data distributions shift, and seasonal effects occur.

**Solution**: Monitor metric trends and consider time-based controls.

---

## 15. Connection to Modern AI

### LLM Evaluation

* **Prompt comparison**: A/B test different prompt templates
* **Temperature and sampling**: Evaluate generation parameters
* **Model versions**: Compare GPT-3.5 vs GPT-4 or different fine-tuned versions

### Reinforcement Learning from Human Feedback (RLHF)

* **Reward model validation**: Test different reward models online
* **Policy comparison**: Evaluate RL-tuned models against supervised baselines

### Model Monitoring and Drift Detection

* **Continuous validation**: Use A/B tests as live monitoring tools
* **Concept drift**: Detect when model performance degrades over time
* **Trigger retraining**: Automatic model updates based on experiment results

### Personalization and Recommendations

* **Bandit algorithms**: Real-time learning and optimization
* **Contextual features**: Test which user context improves recommendations
* **Cold start solutions**: Evaluate strategies for new users/items

### Safety and Alignment

* **Guardrail validation**: Ensure AI safety metrics don't degrade
* **Bias detection**: Test for fairness across demographic groups
* **Content moderation**: Compare different moderation models or thresholds

A/B testing is essential for **responsible AI deployment**, enabling teams to validate model behavior with real users before full rollout.

---

## 16. Suggested Next Steps (Hands-on Mini Projects)

Each step is intentionally small and self-contained. These can each live in their own folder or repository.

### Project 1: Simulated A/B Test with Statistical Analysis

**Goal:** Build intuition for hypothesis testing, p-values, and confidence intervals.

* Simulate user data with two variants (control conversion rate: 10%, treatment: 12%)
* Calculate sample sizes needed for 80% power
* Implement t-test and z-test from scratch
* Visualize confidence intervals
* Run 100 simulated experiments and measure false positive rate
* Output: Report showing power calculations and simulation results

### Project 2: Multi-Armed Bandit Simulator

**Goal:** Understand exploration vs exploitation in adaptive experiments.

* Implement epsilon-greedy, UCB, and Thompson Sampling algorithms
* Simulate 3 variants with different true conversion rates
* Compare total regret across algorithms
* Visualize how traffic allocation evolves over time
* Compare MAB to fixed 33/33/33 split
* Output: Regret curves and traffic allocation visualizations

### Project 3: Bayesian A/B Test

**Goal:** Learn probabilistic approach to experimentation.

* Implement Beta-Binomial model for conversion rate testing
* Use PyMC3 or NumPyro for posterior inference
* Calculate probability that variant B beats variant A
* Compare Bayesian vs frequentist stopping rules
* Visualize posterior distributions
* Output: Posterior plots and probability statements

### Project 4: A/A Test Validation

**Goal:** Validate experiment infrastructure and detect instrumentation bugs.

* Set up a simple web service or API
* Implement traffic splitting (50/50) with identical behavior
* Log metrics for both variants
* Run statistical tests (should find no difference)
* Check for sample ratio mismatch (SRM)
* Identify and debug any logging or randomization issues
* Output: Validation report confirming proper randomization

### Project 5: Sequential Testing Implementation

**Goal:** Learn to stop experiments early while controlling error rates.

* Implement sequential probability ratio test (SPRT) or Group Sequential Design
* Compare stopping time vs fixed-horizon testing
* Simulate experiments with different effect sizes
* Measure false positive rate under peeking
* Visualize stopping boundaries
* Output: Interactive dashboard showing when to stop

### Project 6: Recommendation Model A/B Test

**Goal:** End-to-end experimentation for an ML system.

* Build two simple recommendation models (collaborative filtering vs popularity)
* Create Flask/FastAPI service with traffic splitting
* Define primary metric (CTR) and guardrails (latency, diversity)
* Implement logging and metric calculation
* Run experiment with synthetic users or small real dataset
* Analyze results and write decision document
* Output: Experiment report with recommendation

### Project 7: Contextual Bandit for Personalization

**Goal:** Implement context-aware adaptive experimentation.

* Use LinUCB or neural bandit algorithm
* Simulate users with different contexts (location, time, device)
* Personalize variant assignment based on context
* Compare to non-contextual bandit
* Measure improvement in cumulative reward
* Visualize how algorithm learns user preferences
* Output: Comparison of contextual vs non-contextual performance

### Project 8: LLM Prompt A/B Testing Framework

**Goal:** Build reusable framework for testing language model prompts.

* Create 3-5 different prompt templates for a task (e.g., summarization)
* Set up randomized evaluation with human raters or automated metrics
* Implement traffic splitting and metric logging
* Calculate statistical significance of differences
* Build dashboard to visualize results
* Handle async evaluation and delayed feedback
* Output: Prompt testing framework with example experiment results

---

*Effective experimentation combines statistical rigor with practical engineering to enable data-driven AI deployment.*

## Generation Metadata

- **Created:** January 2025
- **Research Assistant Version:** Engineering Operations Researcher v1.0
- **Primary Sources:** 25+ technical resources including official documentation, academic papers, and industry engineering blogs
- **Key References:**
  * *Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing* — Kohavi, Tang, Xu (Microsoft Press, 2020)
  * *Controlled Experiments on the Web: Survey and Practical Guide* — Kohavi et al. (2009)
  * Netflix Technology Blog - Experimentation Platform articles
  * Statsig, Eppo, GrowthBook, and Optimizely official documentation
  * *A Contextual-Bandit Approach to Personalized News Article Recommendation* — Li et al. (2010)

**Tools & Versions Covered:**
- GrowthBook: Open-source (v3.x)
- Statsig: Commercial platform (current version)
- Eppo: Commercial platform (current version)
- Optimizely: Commercial platform (current version)
- LaunchDarkly: Commercial platform (current version)
- Python libraries: scipy 1.11+, statsmodels 0.14+, pymc 5.x

**Research Methodology:**
- Documentation review: Comprehensive review of major experimentation platforms and statistical testing frameworks
- Tool evaluation: Hands-on evaluation of open-source tools (GrowthBook) and documentation review of commercial platforms
- Literature synthesis: Integration of academic research on causal inference, sequential testing, and bandit algorithms with industry best practices from Microsoft, Netflix, Airbnb, and other tech companies
- Case study analysis: Review of published experimentation case studies and engineering blog posts

**Content Structure:**
- Follows established documentation template used in reinforcement_learning.md and speech_recognition.md
- Progressive complexity from basic A/B testing to advanced causal inference and bandit algorithms
- Balance of statistical theory and practical implementation guidance
- Emphasis on AI-specific challenges: model drift, delayed feedback, non-stationarity
- Comprehensive tool coverage spanning open-source to enterprise platforms

**Last Updated:** January 2025
**Maintainer:** Engineering Operations Researcher Agent

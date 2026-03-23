# Natural Language Processing (NLP)

---

## 1. What It Is

**Natural Language Processing (NLP)** is the branch of artificial intelligence concerned with enabling computers to understand, interpret, and generate human language. It sits at the intersection of linguistics, computer science, and machine learning, bridging the gap between structured computation and the richly ambiguous communication humans use every day.

NLP matters because language is the dominant medium of human knowledge — it powers documents, conversations, code, medical records, legal contracts, and the web. Systems that can reliably read, classify, extract, translate, or generate text unlock automation at scale across nearly every domain.

**Why it matters in practice:**
- Automates high-volume reading tasks (document triage, support ticket routing, content moderation)
- Extracts structured data from unstructured text (medical NER, financial event extraction)
- Enables human-computer interaction through search, chatbots, and voice interfaces
- Powers modern AI products including search engines, code assistants, and content generators

**Scope of this page:** Core NLP concepts, the classic processing pipeline, major task families, evaluation, and a practice path. This page intentionally stays at the field level.

- For the dominant modern architecture, see [Transformers](../deep-learning/transformers.md)
- For large pre-trained models, see [Large Language Models](./large_language_models.md)
- For audio-to-text systems, see [Speech Recognition](./speech_recognition.md)

---

## 2. Core Mental Model

### Key Ideas

1. **Language is ambiguous by design.** The same word can mean different things ("bank"), the same meaning can be expressed many ways ("big" / "large"), and context determines interpretation. NLP systems must resolve this ambiguity at every level.

2. **Text has layered structure.** Understanding language requires processing at multiple levels: characters → tokens → words → phrases → sentences → documents. Each layer adds meaning that the previous layer cannot express alone. *(Jurafsky & Martin, 2024, Ch. 2)*

3. **Representation is everything.** Before any model can reason about words, they must be converted into numbers — either sparse (one-hot, TF-IDF) or dense (word embeddings, contextual embeddings). The quality of this representation determines the ceiling of downstream performance.

4. **Tasks fall into four families.** Almost all NLP work maps to: **classification** (what category?), **extraction** (what spans are relevant?), **generation** (what text should be produced?), or **retrieval** (what documents are relevant?). Choosing the right task framing is as important as choosing the right model.

5. **Pre-training changed the game.** Before 2018, most NLP models were trained task-by-task from scratch. Transfer learning — pre-training a large model on massive text, then fine-tuning on small labeled data — made high-quality NLP practical across many domains. *(Devlin et al., 2019)*

### One Intuition to Remember

> **Think of an NLP system as a reader who first learned to read fluently on billions of books (pre-training), and now applies that literacy to answer specific questions about your documents (fine-tuning or prompting).**

---

## 3. How It Works

### The Modern NLP Workflow

```
Raw Text
   │
   ▼
[Tokenization]        Split text into tokens (subwords via BPE / WordPiece)
   │
   ▼
[Embedding Layer]     Map tokens → dense vectors (learned or pre-trained)
   │
   ▼
[Contextual Encoder]  Transform embeddings using attention (Transformer layers)
   │
   ▼
[Task Head]           Predict label / span / next token / similarity score
   │
   ▼
Output (label, extracted span, generated text, ranking score)
```

### Classic Pipeline Tasks (Bottom-Up)

| Layer | Task | Example |
|---|---|---|
| Lexical | **Tokenization**, stemming, lemmatization | `"running"` → `"run"` |
| Syntactic | **POS tagging**, dependency parsing | `"Apple"` → NOUN |
| Semantic | **NER**, coreference resolution | `"Apple"` → ORG |
| Discourse | Sentiment, summarization, translation | Document → label or new text |

Each downstream task sits on top of this stack; errors propagate upward.

### Minimal Code Example — Sentence Classification with Hugging Face

```python
from transformers import pipeline

# Load a pre-trained sentiment classifier (fine-tuned BERT)
classifier = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")

text = "The product exceeded all my expectations."
result = classifier(text)
# → [{'label': 'POSITIVE', 'score': 0.9998}]
```

This two-line pattern (load pre-trained model → call on text) represents how most NLP practitioners start: leverage existing representations, then customise only where needed.

> **Tokenization details** — the subword tokenization step (BPE, WordPiece) that feeds these models is a topic of its own and is covered in context within [Large Language Models](./large_language_models.md).

---

## 4. When to Use It (and When Not To)

### Best-Fit Scenarios

- **Structured extraction from unstructured text** — NER, relation extraction, form parsing from contracts or clinical notes
- **Text classification at scale** — sentiment analysis, topic labeling, spam detection, intent detection in chatbots
- **Semantic search and retrieval** — dense retrieval with bi-encoders, question answering over documents
- **Summarization and generation** — report generation, abstractive summarization, translation
- **Code analysis and generation** — bug detection, documentation, code completion

### When NLP Is a Poor Fit

| Situation | Better Alternative |
|---|---|
| Data is tabular with no free text | Classical ML (gradient boosting, logistic regression) |
| Real-time audio transcription needed | Dedicated ASR pipeline (see [Speech Recognition](./speech_recognition.md)) |
| Task requires strict formal reasoning | Symbolic/rule-based systems, constraint solvers |
| Language is highly domain-specific and no annotated data exists | Active learning or rule-based extraction first; NLP later |
| Regulatory context forbids probabilistic outputs | Deterministic parsers, formal grammars |

### Key Trade-offs

- **Accuracy vs. latency:** Large transformer models are accurate but slow. Distilled models (DistilBERT, TinyBERT) sacrifice some accuracy for 2–6× speedup.
- **Generality vs. domain fit:** General pre-trained models underperform on specialized vocabulary (medical, legal, code) without domain-adaptive fine-tuning.
- **Black-box vs. interpretable:** Neural NLP models are difficult to audit. Rule-based systems are slower to build but auditable — important in regulated industries.

---

## 5. Failure Modes and Evaluation

### Typical Mistakes

- **Treating text preprocessing as trivial.** Lowercasing, punctuation removal, and stop-word stripping can silently destroy signal (e.g., "U.S." vs. "us", capitalization marking proper nouns). Always examine what the tokenizer produces.

- **Evaluating on non-representative data.** A model trained on news articles and evaluated on tweets will appear artificially poor — or a model trained on one domain will appear artificially strong when tested only on that domain. Distribution shift is the most common cause of production degradation. *(Jurafsky & Martin, 2024, Ch. 4)*

- **Gaming surface metrics.** BLEU for translation and ROUGE for summarization measure lexical overlap with reference outputs. High scores do not guarantee fluency, factual correctness, or usefulness. *(Papineni et al., 2002; Lin, 2004)* Always pair automated metrics with human evaluation for high-stakes tasks.

- **Ignoring class imbalance.** In tasks like NER or spam detection, accuracy is misleading when negatives dominate. Use macro-F1 or per-class F1.

- **Hallucination in generation.** Generative models can produce fluent, confident text that is factually wrong. See [LLMs](./large_language_models.md) for grounding strategies.

### Key Metrics by Task Family

| Task | Primary Metric | Notes |
|---|---|---|
| Classification | **F1 (macro/micro)**, Accuracy | Use macro-F1 for imbalanced classes |
| NER / Span Extraction | **Entity-level F1** | Partial matches penalized |
| Machine Translation | **BLEU**, chrF | Supplement with human eval |
| Summarization | **ROUGE-L**, BERTScore | ROUGE alone insufficient |
| QA (extractive) | **Exact Match + F1** | SQuAD-style evaluation |
| Language Modeling | **Perplexity** | Lower is better |

### Good vs. Bad Outcomes

- **Good:** Model performs consistently across demographic groups, generalizes to slightly different data distributions, and errors are predictable and bounded.
- **Bad:** Model is brittle to minor rephrasing, performs well on benchmark but poorly in production, or exhibits systematic bias against certain dialects or demographic groups. *(Blodgett et al., 2020)*

---

## 6. Practice Path

### Worked Example: Sentiment Classification with Fine-Tuned BERT

**Goal:** Fine-tune a pre-trained BERT model on the SST-2 binary sentiment dataset (positive / negative movie reviews).

**Dataset:** Stanford Sentiment Treebank v2 (SST-2), available via Hugging Face `datasets`.

```python
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from evaluate import load as load_metric

# 1. Load data and tokenizer
dataset = load_dataset("glue", "sst2")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize(batch):
    return tokenizer(batch["sentence"], truncation=True, padding="max_length", max_length=128)

tokenized = dataset.map(tokenize, batched=True)

# 2. Load pre-trained model with classification head
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# 3. Define evaluation metric
accuracy = load_metric("accuracy")
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return accuracy.compute(predictions=preds, references=labels)

# 4. Train
args = TrainingArguments(output_dir="./sst2-bert", num_train_epochs=3,
                         per_device_train_batch_size=16, evaluation_strategy="epoch")
trainer = Trainer(model=model, args=args, train_dataset=tokenized["train"],
                  eval_dataset=tokenized["validation"], compute_metrics=compute_metrics)
trainer.train()
# Expected validation accuracy: ~92-93% (matches published BERT results on SST-2)
```

**What to observe:** Watch validation accuracy across epochs. If it plateaus early, the model is fitting the pre-trained representations quickly — this is normal and expected for fine-tuning.

---

### Progressive Exercises

**Beginner — Rule-Based Tokenization & Frequency Analysis**
Write a Python script (no libraries) that tokenizes a paragraph by splitting on whitespace and punctuation, counts word frequencies, and identifies the top-10 most common tokens. Compare your output to `nltk.word_tokenize`. Note where they differ and why.

**Intermediate — Named Entity Recognition with spaCy**
Load `en_core_web_sm` and run NER on 50 news article sentences. Compute entity-level precision, recall, and F1 against a manually annotated gold set of 20 sentences. Identify which entity types (PERSON, ORG, GPE) the small model struggles with, then repeat with `en_core_web_trf` (transformer-based). Quantify the accuracy vs. latency trade-off. *(spaCy, 2024)*

**Intermediate → Advanced — Fine-Tune for a Custom Domain**
Take a pre-trained NER model (e.g., `dslim/bert-base-NER` on Hugging Face) and fine-tune it on 500 annotated sentences from a domain of your choice (biomedical, legal, or financial). Report entity-level F1 before and after fine-tuning. Investigate the impact of learning rate and training epochs on overfitting.

**Advanced — Evaluate Translation Quality Beyond BLEU**
Using `Helsinki-NLP/opus-mt-en-de`, translate 200 English sentences to German. Compute BLEU (sacrebleu), chrF, and BERTScore. Recruit two native German speakers to rate 30 outputs on a 1–5 fluency and adequacy scale. Analyze where BLEU and BERTScore diverge from human judgments and write a one-page reflection on metric limitations. *(Papineni et al., 2002; Zhang et al., 2019)*

---

## 7. Selected References

### Start Here

1. **Jurafsky, D. & Martin, J.H. (2024). *Speech and Language Processing*, 3rd ed. (draft).** [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)
   *The field's definitive textbook — covers every core NLP topic from tokenization to transformers with rigorous but accessible treatment. Free online.*

2. **Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. *NAACL*.** [arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805)
   *Foundational paper for modern NLP. Introduced the fine-tuning paradigm that achieved state-of-the-art on 11 NLP benchmarks; a required read to understand current practice.*

3. **Hugging Face Transformers Documentation.** [huggingface.co/docs/transformers](https://huggingface.co/docs/transformers)
   *The most practical entry point for hands-on NLP. Covers pipelines, fine-tuning, tokenizers, and model hubs with runnable examples.*

### Go Deeper

4. **Vaswani, A., et al. (2017). Attention Is All You Need. *NeurIPS*.** [arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
   *Introduces the Transformer architecture that underlies all modern NLP models. Essential for understanding why and how attention replaced recurrence. See also [Transformers](../deep-learning/transformers.md).*

5. **Papineni, K., Roukos, S., Ward, T., & Zhu, W.-J. (2002). BLEU: A Method for Automatic Evaluation of Machine Translation. *ACL*.**
   *The original paper for BLEU. Critical for understanding both how the metric works and its well-documented limitations — important before using it in evaluation.*

6. **Blodgett, S.L., Barocas, S., Daumé III, H., & Wallach, H. (2020). Language (Technology) is Power: A Critical Survey of "Bias" in NLP. *ACL*.**
   *Systematic review of how NLP systems encode, amplify, and cause harm through biased training data and evaluation. Essential for responsible deployment.*

---

## Metadata

**Last Reviewed:** 2025-07-14
**Maintainer:** Research Assistant Agent
**Scope Notes:** This page covers NLP as a field — pipeline, tasks, metrics, and practice. It intentionally excludes deep architectural details of transformers (see `../deep-learning/transformers.md`), LLM-specific topics such as RLHF and prompt engineering (see `./large_language_models.md`), and audio processing (see `./speech_recognition.md`).

**Key References:**
- Jurafsky & Martin (2024) — Primary textbook for all foundational NLP theory and terminology
- Devlin et al. (2019) — Defines the modern pre-train/fine-tune paradigm
- Vaswani et al. (2017) — Architectural foundation; cross-linked to transformers doc

**Assumptions / Limitations:**
- Examples assume Python 3.10+ and familiarity with basic ML concepts (train/val split, loss functions)
- Code examples use Hugging Face Transformers v4.x; API details may shift across versions
- Metric guidance reflects community consensus as of mid-2025; BERTScore and LLM-based evaluation are evolving rapidly

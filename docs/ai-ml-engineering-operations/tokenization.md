# Tokenization

---

## 1. What It Is

**Tokenization** is the process of converting raw text into a sequence of discrete units — called **tokens** — that a model's vocabulary maps to integer IDs. A model never sees characters or words directly; it sees only lists of integers that index into a learned embedding table.

Why it matters:

- **Models operate on integers, not text.** Every character, subword, or word must be assigned a numeric ID before any computation can happen.
- **Tokenizer choice affects vocabulary coverage.** A tokenizer trained on general English will fragment medical or code vocabulary badly, inflating sequence length and degrading model performance (Gururangan et al., 2020).
- **Context-window efficiency is tokenizer-dependent.** A 512-token BERT context and a 128k-token GPT-4 context are both measured in *tokens*, not words — so the same text can fit or overflow depending solely on which tokenizer is used.
- **Downstream task performance depends on tokenizer–model alignment.** Using the wrong tokenizer silently corrupts inputs and destroys model accuracy.

**Scope:** This page covers subword tokenization algorithms used in modern NLP and LLM systems — vocabulary construction, special tokens, encoding/decoding, token fertility, and context-window implications.

**Out of scope:** Embedding layers (see [Natural Language Processing](../artificial-intelligence/natural_language_processing.md)), full model architectures (see [Transformers](../deep-learning/transformers.md)), and LLM-specific topics such as prompt engineering or inference strategies (see [Large Language Models](../artificial-intelligence/large_language_models.md)). For applying a tokenizer in fine-tuning workflows, see [Fine-Tuning Methodologies](./fine_tuning_methodologies.md).

---

## 2. Core Mental Model

Five ideas that govern how tokenizers work in practice:

1. **Vocabulary is fixed at training time.** Once a tokenizer is trained, its vocabulary is frozen. Text containing out-of-vocabulary (OOV) words is split into whatever subword fragments the vocabulary *does* contain, down to individual bytes if necessary.

2. **Subword tokenization balances meaning and coverage.** Pure word tokenization fails on rare words. Pure character tokenization loses semantic grouping and makes sequences extremely long. Subword methods sit in between: common words stay whole, rare words fragment into recognizable pieces.

3. **Every tokenizer has a special-token protocol.** Tokens like `[CLS]`, `[SEP]`, `[PAD]`, `<s>`, `</s>`, `[MASK]`, and `<unk>` carry structural meaning — they signal sentence boundaries, sequence start/end, padding positions, and unknown words. Using the wrong protocol, or omitting it, silently corrupts model inputs.

4. **Token count ≠ word count.** The word "tokenization" becomes `['token', '##ization']` under BERT. URLs, code identifiers, and non-Latin scripts (Arabic, Chinese, Thai) can produce 3–6 tokens per word, significantly reducing effective context capacity (Rust et al., 2021).

5. **The tokenizer is part of the model contract.** You must use the *exact same tokenizer* at inference that was used during model training. Swapping tokenizers breaks the integer-to-embedding mapping even if the vocabulary size happens to match.

### One Intuition to Remember

> Think of a tokenizer as a **compression codec**: the vocabulary is the codebook, and encoding is "lossy" in the sense that rare words get broken into smaller, more frequent pieces — just as a codec trades fidelity for compressibility.

---

## 3. How It Works

Tokenization is a **two-phase process**: vocabulary construction (done once at training time) and encoding (done at every inference or fine-tuning step).

### Phase 1 — Vocabulary Construction

Starting from a large text corpus, the algorithm builds a fixed vocabulary of size *V* (typically 30k–256k entries).

| Algorithm | Core Idea | Used By |
|---|---|---|
| **BPE** (Byte-Pair Encoding) | Iteratively merge the most frequent adjacent byte/character pair until *V* is reached (Sennrich et al., 2016) | GPT-2, GPT-3, RoBERTa, Llama |
| **WordPiece** | Like BPE but selects merges that maximise corpus likelihood rather than raw frequency (Schuster & Nakamura, 2012; Wu et al., 2016) | BERT, DistilBERT, Electra |
| **SentencePiece + Unigram LM** | Language-agnostic; operates on raw Unicode without pre-tokenization; prunes a large initial vocabulary using a unigram language model (Kudo & Richardson, 2018) | T5, mT5, XLM-R, Gemma, Llama 3 |

### Phase 2 — Encoding

Given a new input string and a trained vocabulary, the encoder applies a greedy or probabilistic segmentation to produce the token sequence, then looks up each token's integer ID.

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
text = "Tokenization splits text into subword units."
encoding = tokenizer(text, return_tensors="pt")

tokens = tokenizer.convert_ids_to_tokens(encoding["input_ids"][0])
print(tokens)
# ['[CLS]', 'token', '##ization', 'splits', 'text', 'into', 'sub', '##word', 'units', '.', '[SEP]']

print(encoding["input_ids"])
# tensor([[ 101, 19204,  3989, 10786,  3793,  2046,  4942, 18351,  7195,  1012, 102]])
```

Key observations:
- `[CLS]` and `[SEP]` are inserted automatically by BERT's special-token protocol.
- `##` prefixes indicate subword continuations (i.e., not the start of a new word).
- Decoding reverses the process: IDs → tokens → text (stripping `##` markers and special tokens).

---

## 4. When to Use It (and When Not To)

### Best-fit scenarios

- Any transformer-based NLP model with a fixed vocabulary (BERT, GPT-family, T5, Llama, etc.) — you *must* use the model's bundled tokenizer.
- Preprocessing pipelines for fine-tuning or inference where sequence-length budgets need to be measured precisely before data enters the model.
- Cost estimation for OpenAI API calls — use `tiktoken` directly for accurate token counting.

### When not to use standard subword tokenization

- **Byte-level or character-level models** (e.g., ByT5, Charformer) — these consume raw bytes or characters; a subword tokenizer would be a mismatch.
- **Highly structured domain strings** — molecular SMILES notation, genome sequences, or mathematical expressions often need custom tokenizers aligned to their grammar.
- **When you need exact word alignment** — token boundaries do not match word boundaries; downstream tasks such as NER or span extraction require offset mappings (`return_offsets_mapping=True`).

### Alternatives and trade-offs

| Method | Vocabulary | OOV Handling | Sequence Length | Best For |
|---|---|---|---|---|
| Word tokenization | Large (100k+) | `<UNK>` for rare words | Short | Simple baselines |
| Character tokenization | ~100–300 chars | Never OOV | Very long | Character-aware models |
| Byte-level BPE | 256 bytes + merges | Never OOV | Moderate | Multilingual, any Unicode |
| Subword BPE / WordPiece | 30k–50k | Fragments to subwords | Moderate | Most transformer models |
| SentencePiece Unigram | 32k–256k | Fragments to subwords | Moderate | Multilingual, no pre-tokenizer |

**Key trade-off:** Smaller vocabularies fragment rare words more aggressively (higher token fertility), producing longer sequences that consume more of the model's context window and increase compute cost. Larger vocabularies reduce fragmentation but increase embedding-table memory and may underfit rare tokens.

---

## 5. Failure Modes and Evaluation

### Typical mistakes

- **Mixing tokenizers** — Loading a GPT-2 tokenizer and passing its output to a BERT model maps integer IDs to completely wrong embeddings. Always load the tokenizer paired with its model checkpoint.
- **Ignoring truncation** — `tokenizer(text, truncation=True)` silently drops tokens beyond `max_length` (512 for BERT, 2048–128k for GPT variants). Long documents lose entire passages without any error or warning.
- **Double-adding special tokens** — Calling `tokenizer.encode()` with `add_special_tokens=True` and then manually prepending `[CLS]` inserts the token twice, corrupting the input structure.
- **High token fertility on domain vocabulary** — Medical, legal, and code terms fragment badly under general-purpose tokenizers, inflating sequence length and degrading performance. Domain-adaptive pretraining partly addresses this by re-exposing the model to domain text, but the tokenizer mismatch remains (Gururangan et al., 2020).

### Key metrics

| Metric | Definition | Target |
|---|---|---|
| **Token fertility** | Tokens per word (on domain text) | 1.0–1.5 is good; >3.0 signals mismatch |
| **Vocabulary coverage** | % of input tokens that are whole words (not subword fragments) | Higher is better for semantic tasks |
| **OOV rate** | % of tokens mapped to `<unk>` | Should be ~0% for BPE/WordPiece/SP |
| **Effective context utilization** | % of context window used for meaningful tokens vs. padding | Maximize; reduce padding via dynamic batching |

### Good vs. bad outcomes

- **Good:** A BERT model processing PubMed abstracts yields ~1.3 tokens/word; sentences fit comfortably within 512 tokens; `[UNK]` never appears.
- **Bad:** The same model on clinical notes with abbreviations and drug names yields ~2.8 tokens/word; 40% of 512-token inputs are truncated; downstream F1 drops by 8 points compared to a domain-adapted tokenizer.

---

## 6. Practice Path

### Worked Example

**Goal:** Compare BERT (`bert-base-uncased`) and GPT-2 tokenizers on five sentences spanning general English, Python code, and a medical term. Measure token fertility and explain the design difference.

```
Sentences:
1. "The patient was administered methotrexate for rheumatoid arthritis."
2. "def calculate_fibonacci(n): return n if n <= 1 else calculate_fibonacci(n-1) + calculate_fibonacci(n-2)"
3. "She sells seashells by the seashore."
4. "https://huggingface.co/bert-base-uncased"
5. "The model achieved 94.3% accuracy on the benchmark."
```

Steps:
1. Load both tokenizers via `AutoTokenizer.from_pretrained(...)`.
2. Encode each sentence, count tokens, count whitespace-delimited words.
3. Compute fertility = tokens / words per sentence.
4. Observe: GPT-2 (byte-level BPE, no `##` prefix) handles the URL and code differently than BERT (WordPiece, lowercased). GPT-2 has no `[CLS]`/`[SEP]` tokens and starts subwords with `Ġ` (space marker) instead of `##`.
5. Conclude: GPT-2's byte-level encoding never produces `<unk>` and handles code/URLs gracefully; BERT's WordPiece is optimized for lower-cased natural language.

### Progressive Exercises

**Beginner:** Use `AutoTokenizer` to encode 10 sentences of your choice. Print the token IDs and the decoded subword pieces. Find at least one word that tokenizes into 4 or more pieces. Explain *why* it fragments — is it rare, multi-morphemic, or does it contain characters the tokenizer maps to bytes?

**Intermediate:** Using a 1,000-sentence corpus from two domains (e.g., Wikipedia and PubMed abstracts), measure token fertility (tokens per word) with `bert-base-uncased` and `gpt2` tokenizers. Plot the fertility distributions side by side. Identify which tokenizer is better matched to each domain and articulate the evidence.

**Advanced:** Train a BPE tokenizer from scratch on a domain corpus (e.g., Python source code or clinical notes) using the Hugging Face `tokenizers` library. Evaluate fertility and OOV rate on a held-out test set from the same domain, comparing your custom tokenizer against `bert-base-uncased`. Report whether the fertility improvement is large enough to justify the cost of training a new model from scratch on the custom vocabulary.

---

## 7. Selected References

### Start Here

1. **Sennrich, R., Haddow, B., & Birch, A. (2016).** Neural Machine Translation of Rare Words with Subword Units. *ACL*. [https://arxiv.org/abs/1508.07909](https://arxiv.org/abs/1508.07909) — *Introduces BPE for NLP; the foundational subword tokenization paper that all modern systems trace back to.*

2. **Hugging Face Tokenizers Documentation.** [https://huggingface.co/docs/tokenizers](https://huggingface.co/docs/tokenizers) — *Most practical reference; covers fast tokenizers, BPE/WordPiece/Unigram implementations, and training custom vocabularies with runnable examples.*

3. **Kudo, T. & Richardson, J. (2018).** SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing. *EMNLP*. [https://arxiv.org/abs/1808.06226](https://arxiv.org/abs/1808.06226) — *Introduces SentencePiece's language-agnostic design and the Unigram LM algorithm; essential for multilingual and non-Latin-script work.*

### Go Deeper

4. **Jurafsky, D. & Martin, J.H. (2024).** Speech and Language Processing, 3rd ed. Ch. 2. [https://web.stanford.edu/~jurafsky/slp3/](https://web.stanford.edu/~jurafsky/slp3/) — *Thorough treatment of tokenization in the broader NLP context, including normalization, regular expressions, and a step-by-step BPE walkthrough.*

5. **Rust, P., et al. (2021).** How Good is Your Tokenizer? On the Monolingual Performance of Multilingual Language Models. *ACL*. [https://arxiv.org/abs/2012.15613](https://arxiv.org/abs/2012.15613) — *Empirical study on how tokenizer fertility affects downstream task performance across languages; the key evidence linking high fertility to degraded model accuracy.*

---

## Metadata

**Last Reviewed:** 2026-03-28
**Maintainer:** Research Assistant Agent
**Scope Notes:** Covers subword tokenization algorithms and practical engineering considerations. Intentionally excludes embedding layers (see [Natural Language Processing](../artificial-intelligence/natural_language_processing.md)), full model architectures (see [Transformers](../deep-learning/transformers.md)), and LLM-specific topics like prompt engineering or context-window strategies (see [Large Language Models](../artificial-intelligence/large_language_models.md)).

**Key References:**
- Sennrich et al. (2016) — Foundational BPE paper; origin of modern subword tokenization
- Kudo & Richardson (2018) — SentencePiece / Unigram LM; language-agnostic tokenization
- Rust et al. (2021) — Empirical link between token fertility and downstream performance

**Assumptions / Limitations:**
- Examples use Hugging Face Transformers v4.x / tokenizers v0.15+; Python 3.10+
- Token fertility targets (1.0–1.5) are approximate norms for English prose; non-Latin scripts and code will differ
- Vocabulary sizes cited reflect common open model checkpoints and may vary across model families

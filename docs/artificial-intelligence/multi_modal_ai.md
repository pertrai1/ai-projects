# Multi-modal AI

---

## 1. What It Is

**Multi-modal AI** refers to systems that process and reason over more than one type of data modality — typically combining two or more of: text, images, audio, video, and structured data. Rather than operating on a single input type, a multi-modal model learns joint representations that let it relate information across modalities.

**Why it matters:** Real-world information is inherently multi-modal. A doctor reads lab reports (text) and X-rays (images) together. A customer describes a problem in words and attaches a screenshot. Multi-modal AI closes the gap between how humans communicate and what AI systems can ingest and reason about.

**Scope of this page:** Architectures and patterns for combining modalities (text + vision being the dominant pairing), inference workflows, and evaluation. This page focuses on the concepts a practitioner needs to apply multi-modal models effectively.

- For language-only models, see [Large Language Models](./large_language_models.md)
- For image-specific architectures, see the Computer Vision topic in the [docs index](../README.md)
- For audio-to-text conversion, see [Speech Recognition](./speech_recognition.md)
- For retrieval over multi-modal content, see [Retrieval-Augmented Generation](./retrieval_augmented_generation.md)

---

## 2. Core Mental Model

### Key Ideas

1. **Each modality has its own encoder.** A vision encoder (e.g., Vision Transformer) converts image patches into vectors; a text encoder converts tokens into vectors. Multi-modal learning begins by projecting these different vectors into a shared embedding space. _(Radford et al., 2021 — CLIP)_

2. **Alignment is the core problem.** The challenge is not processing each modality in isolation — it is learning a representation where "a photo of a dog" and an image of a dog end up close together in the same vector space. Alignment requires large-scale paired data and contrastive or generative training objectives.

3. **A connector bridges encoders to the language model.** In architectures like LLaVA, a lightweight MLP projection layer maps vision encoder outputs into the token embedding space of a language model, allowing the LLM to treat image tokens like text tokens. _(Liu et al., 2023 — LLaVA)_

4. **Fusion can happen early or late.** *Early fusion* combines raw modality signals before encoding (uncommon today). *Late fusion* independently encodes each modality and merges at the representation or decision layer. Modern transformer-based systems use a form of late/cross-attention fusion.

5. **Training data determines capability.** The breadth and quality of paired multi-modal data (image-caption pairs, video-subtitle pairs, audio-text pairs) is the primary bottleneck on what a model can do. _(Zhu et al., 2023 — MiniGPT-4)_

### One Intuition to Remember

> **Think of a multi-modal model as a universal translator: each modality is a different language, and the model learns a shared "thought space" that all languages map into before reasoning begins.**

---

## 3. How It Works

### Typical Architecture (Vision + Language)

```
Image Input                    Text Input
    │                              │
[Vision Encoder]            [Text Tokenizer]
 (e.g., ViT-L/14)           (e.g., BPE vocab)
    │                              │
[Projection / Adapter]      [Token Embeddings]
    │                              │
    └──────────[Joint Transformer / LLM]──────────┘
                          │
                    [Task Head]
                (generation, classification,
                  retrieval score, VQA answer)
```

**Step-by-step:**

1. Image → patchified → vision encoder → sequence of visual feature vectors
2. Visual features → linear projection → visual tokens (same dimension as text token embeddings)
3. Visual tokens concatenated with text token embeddings → fed into transformer LLM
4. LLM generates or classifies based on the combined sequence

This is the LLaVA / GPT-4V pattern. CLIP uses a simpler variant with no language generation: both encoders produce a single pooled vector, and the training objective maximizes cosine similarity between matched pairs. _(Radford et al., 2021)_

---

## 4. When to Use It (and When Not To)

### Best-Fit Scenarios

- **Visual question answering (VQA):** Users ask questions about uploaded images or diagrams.
- **Document understanding:** Parse scanned PDFs, invoices, or forms where layout, images, and text all carry meaning.
- **Medical imaging + clinical notes:** Combine radiology images with structured patient history.
- **Content moderation:** Detect policy violations across image and caption together.
- **Product search and recommendation:** Match text queries to image catalogs.
- **Accessibility tools:** Describe images for screen readers; caption audio for hearing-impaired users.

### When to Avoid or Simplify

| Situation | Better Alternative |
|---|---|
| Only text data is available | Standard LLM or NLP pipeline |
| Images are incidental (icons, decorative) | Strip images; use text-only model |
| Latency is critical and hardware is limited | Single-modality model; multi-modal inference is costly |
| Modalities are independent (no joint reasoning needed) | Separate specialized models per modality |
| Labeled paired data is very scarce | Pre-trained zero-shot multi-modal model (CLIP, GPT-4V) |

### Key Trade-offs

- **Capability vs. cost:** Multi-modal models are larger and slower than text-only equivalents. GPT-4V inference costs more than GPT-4 text.
- **Zero-shot power vs. fine-tuning need:** CLIP-style models generalize well zero-shot but may underperform task-specific fine-tuned models on narrow domains.
- **Alignment quality:** Poor-quality image-text pairs in training produce weakly aligned models that hallucinate image content.

---

## 5. Failure Modes and Evaluation

### Typical Mistakes

- **Hallucinating visual content.** Multi-modal LLMs confidently describe objects not present in an image — especially when the text prompt implies their presence. Always ground answers against image evidence, not just language prior. _(Li et al., 2023 — POPE benchmark)_

- **Modality imbalance.** If text signals are much stronger than visual signals in training data, the model defaults to text-only reasoning and effectively ignores the image. Test by querying visual-only information that cannot be inferred from text.

- **Poor OCR integration.** Scene text (signs, labels, documents) is a frequent failure point. Models without explicit OCR training steps misread or ignore in-image text. Use models specifically trained on document understanding (e.g., Donut, PaddleOCR-backed pipelines) for OCR-heavy tasks.

- **Over-reliance on pre-training distribution.** A model trained on natural photos underperforms on medical imaging, satellite imagery, or technical diagrams — domains with very different pixel statistics. Domain-specific fine-tuning is required.

### Key Metrics

| Task | Metric | Notes |
|---|---|---|
| Visual QA | **VQA Accuracy** | Exact match on VQAv2 benchmark |
| Image captioning | **CIDEr, SPICE** | Prefer SPICE for semantic accuracy |
| Image-text retrieval | **Recall@K** | R@1, R@5, R@10 |
| Hallucination | **POPE F1** | Binary hallucination probe |
| Document VQA | **ANLS** (normalized edit similarity) | Accounts for partial OCR errors |

### Good vs. Bad Outcomes

- **Good:** Model correctly identifies visual elements, correctly declines when visual evidence is absent, and performance degrades gracefully on out-of-distribution images.
- **Bad:** Model answers confidently from language priors when the image contradicts them; inserts hallucinated bounding boxes or objects; performs well on benchmark splits but fails on real-world image quality variations.

---

## 6. Practice Path

### Worked Example: Image Captioning with the OpenAI Vision API

**Goal:** Send an image URL to a multi-modal model and receive a descriptive caption using the OpenAI `gpt-4o` vision endpoint.

```javascript
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function captionImage(imageUrl) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
          {
            type: "text",
            text: "Describe this image in one concise sentence, focusing on the main subject.",
          },
        ],
      },
    ],
    max_tokens: 100,
  });

  return response.choices[0].message.content;
}

// Example usage
const caption = await captionImage(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
);
console.log("Caption:", caption);
```

**What to observe:** The model returns a natural language description grounded in the image. Experiment by providing a misleading text prompt (e.g., "Describe this painting of mountains") and observe whether the model corrects or follows the incorrect framing — this reveals how the model balances visual vs. textual signal.

---

### Progressive Exercises

**Beginner — Zero-Shot Image Classification**
Use the OpenAI vision API (or a local CLIP wrapper) to classify 10 images into categories of your choice (e.g., cat/dog, indoor/outdoor). Compare the model's confidence scores to your own labels. Identify at least two cases where the model is confidently wrong and hypothesize why.

**Intermediate — Visual Question Answering on a Document**
Download a sample invoice or form PDF, render it as an image, and submit it to a vision-capable LLM with structured questions (e.g., "What is the invoice total?", "Who is the vendor?"). Measure accuracy against the ground truth values. Note where the model reads layout correctly vs. makes OCR errors.

**Intermediate → Advanced — Hallucination Probe**
Create a test set of 20 image-question pairs where the expected answer requires noticing the *absence* of something (e.g., "Is there a stop sign in this image?" when there is none). Compute the model's false positive rate. Compare two models (e.g., `gpt-4o` vs. a smaller open-source multi-modal model) and analyze trade-offs in hallucination vs. accuracy.

**Advanced — Fine-tune a Projection Adapter**
Using the LLaVA architecture (open-source weights available at Hugging Face), freeze the vision encoder and language model, and fine-tune only the projection MLP on 500 domain-specific image-text pairs (e.g., product photos + descriptions). Compare VQA accuracy on a held-out domain set before and after fine-tuning. Document compute requirements and convergence behavior.

---

## 7. Selected References

### Start Here

1. **Radford, A., et al. (2021). Learning Transferable Visual Models From Natural Language Supervision (CLIP). _ICML_.** [arxiv.org/abs/2103.00020](https://arxiv.org/abs/2103.00020)
   *Foundational paper for image-text alignment via contrastive learning. CLIP's architecture and training objective underlie most modern multi-modal systems.*

2. **Liu, H., et al. (2023). Visual Instruction Tuning (LLaVA). _NeurIPS_.** [arxiv.org/abs/2304.08485](https://arxiv.org/abs/2304.08485)
   *Introduces the efficient connector-based paradigm (projection MLP between vision encoder and LLM) and the visual instruction tuning dataset — the dominant open-source multi-modal recipe.*

3. **OpenAI. (2024). GPT-4 Technical Report.** [openai.com/research/gpt-4](https://openai.com/research/gpt-4)
   *Describes the first widely deployed production-quality multi-modal LLM with vision input. Useful for understanding capabilities, limitations, and evaluation methodology in commercial systems.*

### Go Deeper

4. **Li, Y., et al. (2023). Evaluating Object Hallucination in Large Vision-Language Models (POPE). _EMNLP_.** [arxiv.org/abs/2305.10355](https://arxiv.org/abs/2305.10355)
   *Defines the hallucination problem quantitatively and introduces the POPE benchmark — essential reading before deploying any multi-modal model in production.*

5. **Zhu, D., et al. (2023). MiniGPT-4: Enhancing Vision-Language Understanding with Advanced Large Language Models.** [arxiv.org/abs/2304.10592](https://arxiv.org/abs/2304.10592)
   *Shows that minimal alignment training (a single projection layer + curated data) can produce strong multi-modal performance, clarifying the role of data quality vs. model size.*

---

## Metadata

**Last Reviewed:** 2026-03-31
**Maintainer:** Research Assistant Agent
**Scope Notes:** This page covers multi-modal AI concepts centered on vision + language systems. It intentionally excludes: pure computer vision architectures (CNNs, ViT details), audio-only models (see [Speech Recognition](./speech_recognition.md)), and text-only LLM topics (see [Large Language Models](./large_language_models.md)). Video understanding and sensor fusion are mentioned but not detailed.

**Key References:**
- Radford et al. (2021) CLIP — Foundational alignment architecture and training objective
- Liu et al. (2023) LLaVA — Dominant open-source multi-modal instruction tuning paradigm
- Li et al. (2023) POPE — Quantitative hallucination evaluation standard

**Assumptions / Limitations:**
- Code example requires an OpenAI API key and uses the `openai` npm package (v4+)
- Architecture descriptions focus on the vision + language pairing; audio-visual and multi-sensor fusion are active research areas not fully covered here
- Benchmark results cited reflect state of research through early 2024; the field moves rapidly

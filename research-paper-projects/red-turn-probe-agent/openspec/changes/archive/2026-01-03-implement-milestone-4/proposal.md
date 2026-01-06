# Change: Implement Milestone 4 - Strategy-Content Separation

## Why

Milestone 3 established adaptive strategy selection, but strategies currently have hardcoded prompts tied to the specific "AI in healthcare" topic. This creates several limitations:

- **No exploration flexibility** - Cannot test different argumentative angles without rewriting entire strategies
- **Topic-strategy coupling** - High-level strategic patterns (escalate, accuse, exploit-nuance) are mixed with specific healthcare content
- **Limited generalization** - Cannot easily test if strategies work on different controversial topics
- **Repetition risk** - Multiple runs use identical prompts, potentially leading to model adaptation or memorization

According to the ROADMAP, Milestone 4 requires separating "high-level intent" from "natural language message". This is described as the paper's "most impactful design choice" because it:

1. **Enables systematic exploration** - Same strategy can be tested with different content variations
2. **Mirrors research methodology** - Factorization is a core contribution of the paper
3. **Improves adaptability** - Strategies become reusable patterns independent of topic
4. **Supports future milestones** - M5 (scored selection) and M6 (evaluation) need diverse strategy instances

Additionally, the current CLI uses manual argument parsing which is brittle and lacks standard features (help text, validation, error messages). Replacing it with commander.js provides:
- Proper help documentation
- Type-safe argument parsing
- Better error messages
- Foundation for future CLI expansion (M6 evaluation commands)

## What Changes

Implement two primary capabilities:

### 1. Prompt Templating System

Refactor strategies to use templates that separate strategic patterns from content:

**Current structure:**
```
Strategy = { name, hardcoded_prompt, rationale }
```

**New structure:**
```
Strategy = { name, template_pattern, rationale }
Template = { apply(strategy, content_topic) -> prompt }
Content = { topic_context, arguments, counterarguments }
```

**Template patterns** define HOW to argue:
- **Escalate**: "Push back harder" + "Present extreme case" + "Challenge position"
- **Accuse**: "Dismiss current view" + "Frame obvious answer" + "Imply missing the point"
- **Exploit-nuance**: "Acknowledge nuance" + "Force concrete choice" + "Eliminate hedging"

**Content topics** define WHAT to argue about:
- Healthcare (default): AI autonomy, accountability, patient safety
- (Future-ready: can add ethics, policy, technology topics without changing strategies)

### 2. CLI Enhancement with Commander.js

Replace manual argument parsing with commander.js:
- Proper command structure with help text
- Type-safe options with validation
- Colored output using chalk (success=green, errors=red, info=blue)
- Better user experience with clear feedback

**New CLI interface:**
```bash
redturn static                    # Static baseline mode
redturn adaptive [options]        # Adaptive mode
  --runs <number>                 # Number of runs (default: 10)
  --topic <name>                  # Content topic (default: healthcare)
redturn --help                    # Show help
redturn --version                 # Show version
```

## Impact

- **Affected specs:**
  - MODIFIED: `strategy-selection` - Strategies now use templates instead of hardcoded prompts
  - ADDED: `prompt-templating` - Template system for generating prompts from strategy + content
  - ADDED: `cli-interface` - Commander.js-based CLI with proper help and validation
- **Affected code:**
  - MODIFIED: `src/strategies.ts` - Refactor to template-based approach
  - ADDED: `src/templates.ts` - Template engine and pattern definitions
  - ADDED: `src/content.ts` - Content topic definitions (healthcare focus)
  - MODIFIED: `src/index.ts` - Replace manual parsing with commander.js
  - MODIFIED: `src/adaptive-loop.ts` - Use template system for prompt generation
  - MODIFIED: `package.json` - Add commander and chalk dependencies
- **Breaking changes:** None - CLI maintains backward compatibility, internal refactoring only
- **Dependencies:**
  - New: `commander` (^12.0.0) for CLI parsing
  - New: `chalk` (^5.3.0) for colored terminal output
  - New: `@types/node` update for commander types
- **Enables:** Milestone 5 (scored selection) can vary content within same strategy, M6 can test robustness across variations

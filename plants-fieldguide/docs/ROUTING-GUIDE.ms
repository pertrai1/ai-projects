# Query Routing

## Intelligent Query Routing

A multi-agent system that analyzes questions and routes them to specialized agents.

## The Architecture

### Fixed Pipeline
```
Question → Analyze → Retrieve → Answer
          (same path for all questions)
```

### Intelligent Routing
```
Question → Router → [Decision] → Specialized Agent → Answer
                        ↓
                   ┌────┴────┬──────────┬────────────┬──────────┐
                   ↓         ↓          ↓            ↓          ↓
              Definition  How-To   Comparison  Data Query  General QA
```

## Components

### 1. Query Router Agent
- **Purpose**: Analyzes questions and classifies them into types
- **Output**: Agent type, confidence, reasoning, keywords, search strategy
- **Temperature**: 0.1 (low for consistent classification)

### 2. Specialized Agents

#### Definition Lookup
- **Best for**: "What is...", "Define...", "Explain..."
- **Strategy**: Focused search (k=3-5), looks for glossary sections
- **Output**: Structured definition with usage examples

#### How-To Guide
- **Best for**: "How do I...", "Steps to...", "Guide me..."
- **Strategy**: Broader search (k=7-10), looks for procedures
- **Output**: Numbered steps with prerequisites and tips

#### Comparison
- **Best for**: "Compare...", "X vs Y", "Difference between..."
- **Strategy**: Multi-step search (search each concept separately)
- **Output**: Side-by-side comparison with key differences

### 3. Agent Router
- **Purpose**: TypeScript implementation that connects routing to execution
- **Pattern**: Strategy Pattern + Singleton Pattern + Caching
- **Key Features**:
  - Dynamically loads specialized agents
  - Caches agent specs for performance
  - Provides debugging helpers

### 4. Ask Command
- **Purpose**: CLI interface for intelligent routing
- **Options**:
  - `--verbose`: Show detailed routing information
  - `--show-routing`: Educational mode (see decision without executing)

## Testing the System

### 1. Routing Decisions

```bash
# See how the router classifies questions WITHOUT executing them
npm run cli -- ask-smart "What is FACW?" --show-routing
npm run cli -- ask-smart "How do I search by state?" --show-routing
npm run cli -- ask-smart "Compare native and introduced plants" --show-routing
```

**What to observe:**
- Which agent type is selected
- Confidence level (high/medium/low)
- Reasoning behind the decision
- Extracted keywords
- Recommended search strategy

### 2. Full Execution (Route + Answer)

```bash
# Execute the routing and get answers
npm run cli -- ask "What is a wetland indicator?" -v
npm run cli -- ask "How do I filter plants by region?" -v
npm run cli -- ask "What's the difference between OBL and FACW?" -v
```

**What to observe:**
- The specialized agent that was used
- How the answer is formatted (varies by agent type)
- Routing metadata at the end
- Performance (specialized agents are faster!)

### 3. Example Queries by Type

#### DEFINITION_LOOKUP Queries
```bash
npm run cli -- ask "What does FACW mean?"
npm run cli -- ask "Define wetland indicator status"
npm run cli -- ask "Explain ethnobotany"
```

#### HOW_TO_GUIDE Queries
```bash
npm run cli -- ask "How do I search for plants by state?"
npm run cli -- ask "Steps to filter by wetland status"
npm run cli -- ask "How do I use the Advanced Search?"
```

#### COMPARISON Queries
```bash
npm run cli -- ask "Compare native vs introduced plants"
npm run cli -- ask "Difference between OBL and UPL"
npm run cli -- ask "FACW vs FAC wetland indicators"
```

#### GENERAL_QA Queries
```bash
npm run cli -- ask "Tell me about the PLANTS database"
npm run cli -- ask "What plant characteristics are available?"
npm run cli -- ask "Overview of wetland indicator status"
```

## Troubleshooting

### "Vector store not found"
```bash
npm run cli -- index
```
You need to index the PDF first before asking questions.

### "Agent spec not found"
Check that all `.spec.yaml` files are in `specs/agents/` directory.

### Router always picks GENERAL_QA
This means the router isn't confident in classification. Try:
- More specific questions
- Adjust the router's prompt in `query-router.spec.yaml`
- Lower the temperature for more deterministic routing

### TypeScript errors
```bash
npm run build
```
Ensure all imports are correct (note the `.js` extensions in import paths).

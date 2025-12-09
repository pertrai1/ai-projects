# Phase 1: Basic RAG Implementation

**Goal**: Build a working prototype with Claude API integration and basic vector search

## Objectives

1. Set up Claude API integration
2. Build simple vector search with Pinecone
3. Create basic prompt templates
4. Test with static PLANTS data

## Architecture Overview

```
User Query → Claude (Query Understanding) → Vector Search → Claude (Response) → Answer
```

## What Will Developed

### Step 1: Project Setup
- Initialize repository
- Configure TypeScript
- Install dependencies
- Set up environment variables

### Step 2: Core Models & Types
- Define `PlantRecord` interface
- Define `QueryResult` interface
- Create basic types

### Step 3: Sample Data
- Create sample PLANTS data (5-10 plants)
- Focus on variety (trees, wildflowers, shrubs)
- Include realistic metadata

### Step 4: Claude Service
- Initialize Anthropic SDK
- Create basic prompt templates
- Build query → response flow

### Step 5: Vector Search Setup
- Initialize Pinecone client
- Create embeddings for sample data
- Implement basic similarity search

### Step 6: Core NLQI Class
- Combine all components
- Build end-to-end query flow
- Add basic error handling

### Step 7: Simple CLI/API
- Create command-line interface OR
- Simple Express API endpoint
- Test with example queries

## Directory Structure for Phase 1

```
src/
├── models/
│   ├── plant.model.ts          # Plant data structure
│   └── index.ts
├── services/
│   ├── claude.service.ts       # Claude API integration
│   ├── embedding.service.ts    # Text embeddings
│   ├── vector-search.service.ts # Pinecone integration
│   └── index.ts
├── prompts/
│   ├── response-generation.ts  # LLM prompt templates
│   └── index.ts
├── core/
│   ├── plants-nlqi.ts         # Main orchestrator
│   └── index.ts
├── utils/
│   ├── logger.ts              # Basic logging
│   └── index.ts
└── index.ts                    # Entry point
data/
└── samples/
    └── sample-plants.json      # Test data
```

## Key Technologies

- **@anthropic-ai/sdk**: Claude API client
- **@pinecone-database/pinecone**: Vector database
- **@langchain/community**: Embeddings (Voyage AI)
- **dotenv**: Environment configuration
- **winston**: Logging

## Expected Outcomes

By end of Phase 1, we will be able to:
- Ask: "What native wildflowers are found in North Carolina?"
- Get: A natural language answer with 2-3 relevant plants

## Success Criteria

- [ ] Claude API successfully integrated
- [ ] Vector search returns relevant plants
- [ ] Natural language responses generated
- [ ] 3+ example queries working correctly
- [ ] Code is clean and well-documented

## Example Queries to Test

1. "What native wildflowers are found in North Carolina?"
2. "Show me drought-tolerant plants"
3. "What trees bloom in spring?"
4. "Which plants attract pollinators?"
5. "Find perennial shrubs for full sun"

## Next Steps

After Phase 1 completion, we'll move to Phase 2:
- Add intent understanding agent
- Implement hybrid search
- Build conversation memory
- Add structured filters

## Notes

- Start simple, add complexity gradually
- Focus on learning RAG fundamentals
- Don't worry about production features yet
- Test frequently with sample queries

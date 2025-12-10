# PLANTS Natural Language Query Interface

A TypeScript-based Natural Language Query Interface for the USDA PLANTS Database, powered by Claude AI and RAG (Retrieval Augmented Generation) architecture.

## Overview

This project enables users to query the USDA PLANTS Database using natural language instead of complex search forms. Ask questions like "What native wildflowers bloom in spring in North Carolina?" and get intelligent, contextual answers.

## Features

- Natural language queries for plant information
- Semantic search using vector embeddings
- AI-powered responses using Claude
- Hybrid search combining semantic and structured filters
- Multi-agent architecture for complex queries

## Technology Stack

- **Runtime**: Node.js 20+ with TypeScript
- **LLM**: Anthropic Claude (Sonnet 4)
- **Vector Database**: Pinecone
- **Embeddings**: Voyage AI
- **Database**: PostgreSQL
- **Framework**: Express.js

## Project Phases

### Phase 1: [Basic RAG](/docs/PHASE-1.md)

- Claude API integration
- Basic vector search with Pinecone
- Simple prompt templates
- Static PLANTS data testing

Example terminal output when running `npx tsx test-nlqi.ts`:

```bash
Query: "Which plants attract pollinators?"

2025-12-09 17:15:35 [plants-nlqi] info: Processing query {"query":"Which plants attract pollinators?","topK":3}
2025-12-09 17:15:35 [plants-nlqi] info: Searching for similar plants {"topK":3}
2025-12-09 17:15:36 [plants-nlqi] info: Search completed {"resultsCount":3}
2025-12-09 17:15:36 [plants-nlqi] info: Generating response {"query":"Which plants attract pollinators?","plantCount":3}
2025-12-09 17:15:45 [plants-nlqi] info: Response generated {"duration":8827,"inputTokens":771,"outputTokens":330}
2025-12-09 17:15:45 [plants-nlqi] info: Query processed successfully {"duration":9320,"resultsCount":3}
Search time: 9320ms
Results found: 3

Top Plants:
  1. Asclepias tuberosa (Butterfly Weed) - Score: 0.438
  2. Rudbeckia maxima (Great Coneflower) - Score: 0.407
  3. Rhododendron maximum (Great Rhododendron) - Score: 0.358

Answer:
Native plants are absolutely fantastic for attracting pollinators! You'll be amazed at how many bees, butterflies, and other beneficial insects visit when you plant the right species.

**Asclepias tuberosa** (Butterfly Weed) is one of my top recommendations - it's like a magnet for pollinators! This stunning perennial produces brilliant orange flower clusters from late spring through summer and is especially beloved by monarch butterflies, serving as both a nectar source and essential host plant for their caterpillars. It thrives in full sun with minimal water once established, making it perfect for low-maintenance gardens.

**Rudbeckia maxima** (Great Coneflower) is another pollinator powerhouse that's hard to beat. These striking yellow flowers with their prominent dark centers bloom from late spring to early summer and attract an incredible variety of bees, butterflies, and other pollinators. They're extremely drought-tolerant and can handle both full sun and partial shade, plus birds love the seeds later in the season.

For shadier spots, **Rhododendron maximum** (Great Rhododendron) offers spectacular clusters of white to pale pink blooms that pollinators adore. While it needs more moisture than the others, it's perfect for woodland gardens and creates incredible spring displays.

These natives not only support pollinators but also provide four-season interest and require less maintenance than non-native alternatives once established. You'll love watching your garden come alive with buzzing activity!
```

Example of the CLI version when running `npm run cli`:

```bash

╔════════════════════════════════════════════════════════════╗
║         PLANTS Natural Language Query Interface            ║
║              USDA PLANTS Database Explorer                 ║
╚════════════════════════════════════════════════════════════╝

Initializing system...
2025-12-09 17:23:41 [plants-nlqi] info: Initializing PlantsNLQI
2025-12-09 17:23:41 [plants-nlqi] info: Claude service initialized {"model":"claude-sonnet-4-20250514"}
2025-12-09 17:23:41 [plants-nlqi] info: Embedding service initialized {"model":"voyage-3"}
2025-12-09 17:23:41 [plants-nlqi] info: Vector search service initialized {"indexName":"plants-nlqi","namespace":"default"}
2025-12-09 17:23:41 [plants-nlqi] info: PlantsNLQI initialized successfully
2025-12-09 17:23:41 [plants-nlqi] info: Running health check
2025-12-09 17:23:41 [plants-nlqi] info: Testing Claude API connection
2025-12-09 17:23:45 [plants-nlqi] info: Connection test result {"success":true}
2025-12-09 17:23:46 [plants-nlqi] info: Index status checked {"indexName":"plants-nlqi","ready":true}
2025-12-09 17:23:46 [plants-nlqi] info: Health check complete {"claude":true,"pinecone":true,"overall":true}
System ready!


Example queries:
  • "What native wildflowers are found in North Carolina?"
  • "Show me drought-tolerant plants"
  • "Which plants attract pollinators?"
  • "Find shrubs that grow in shade"
  • "What trees bloom in spring?"

Type "exit" or "quit" to exit

Query> What trees bloom in spring?

Searching...
2025-12-09 17:23:59 [plants-nlqi] info: Processing query {"query":"What trees bloom in spring?","topK":5}
2025-12-09 17:23:59 [plants-nlqi] info: Searching for similar plants {"topK":5}
2025-12-09 17:24:00 [plants-nlqi] info: Search completed {"resultsCount":5}
2025-12-09 17:24:00 [plants-nlqi] info: Plants loaded from file {"count":8}
2025-12-09 17:24:00 [plants-nlqi] info: Generating response {"query":"What trees bloom in spring?","plantCount":5}
Query> 2025-12-09 17:24:09 [plants-nlqi] info: Response generated {"duration":9242,"inputTokens":1028,"outputTokens":294}
2025-12-09 17:24:09 [plants-nlqi] info: Query processed successfully {"duration":10286,"resultsCount":5}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Matching Plants:

  1. Liriodendron tulipifera (Tulip Tree)
     ████ 40.9% match
     Tree • Perennial

  2. Rhododendron maximum (Great Rhododendron)
     ████ 38.4% match
     Shrub • Perennial

  3. Quercus alba (White Oak)
     ███ 34.3% match
     Tree • Perennial

  4. Ilex opaca (American Holly)
     ███ 31.8% match
     Tree • Perennial

  5. Carya carolinae-septentrionalis (Southern Shagbark Hickory)
     ███ 30.9% match
     Tree • Perennial

Answer:
──────────────────────────────────────────────────────────────────────
Spring is such a wonderful time for tree blooms! You have some fantastic native options that will bring both beauty and wildlife value to your landscape.

The **Tulip Tree** (Liriodendron tulipifera) is absolutely stunning in late spring with its unique tulip-shaped flowers in yellow and orange. This fast-growing giant can become one of the tallest trees in eastern forests, and bees absolutely love the nectar-rich blooms. It thrives in full sun with moderate water needs.

For something more understated but equally important, **White Oak** (Quercus alba) produces its spring flowers (called catkins) that may not be showy but are ecologically invaluable. This majestic tree will eventually reward you with acorns that feed countless birds and mammals - it's like having a wildlife cafeteria in your yard!

If you're looking for something evergreen with spring interest, **American Holly** (Ilex opaca) blooms in late spring with small white flowers. While the blooms are modest, they're followed by those gorgeous red berries that birds rely on through winter. Just remember you'll need both male and female trees for berry production.

These native spring bloomers will give you years of seasonal beauty while supporting local ecosystems - there's nothing quite like watching the wildlife activity around a mature native tree!
──────────────────────────────────────────────────────────────────────

 Completed in 10286ms (5 results)

Query>
Goodbye!
```

### Phase 2: [Agent Layer](docs/PHASE-2.md)

- Query understanding agent
- Hybrid search implementation
- Response generation pipeline
- Conversation memory

### Phase 3: Advanced Features

- Multi-agent architecture
- Tools integration (maps, images)
- Caching & optimization
- Web interface

### Phase 4: Production

- Error handling & fallbacks
- Rate limiting & cost optimization
- Comprehensive testing
- Deployment

## Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0
- Anthropic API key
- Pinecone account
- Voyage AI API key
- PostgreSQL

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd plants-nlqi
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials.

### 3. Phase 1 Setup

```bash
# Run the development server
npm run dev

# Or test with sample data
npm run seed
```

## Environment Variables

See `.env.example` for all required configuration.

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
plants-nlqi/
├── src/
│   ├── core/           # Main NLQI orchestrator
│   ├── services/       # External service integrations
│   ├── agents/         # Agent implementations (Phase 2+)
│   ├── models/         # TypeScript interfaces
│   ├── prompts/        # LLM prompt templates
│   └── utils/          # Helper functions
├── scripts/            # Setup and data scripts
├── tests/              # Test suites
└── docs/               # Documentation
```

## Learning Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [LangChain.js Documentation](https://js.langchain.com/)
- [Pinecone Quickstart](https://docs.pinecone.io/)
- [USDA PLANTS Database](https://plants.usda.gov/)

## License

MIT

## Acknowledgments

- USDA Natural Resources Conservation Service for the PLANTS Database
- Anthropic for Claude AI

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

## Project Phases

### Phase 1: [Basic RAG](docs/PHASE-1.md)

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

Example of the CLI when running `npm run cli`:

```bash
════════════════════════════════════════════════════════════════════════════════
PLANTS NLQI - Natural Language Query Interface
  Enhanced with Conversation Memory & Hybrid Search
════════════════════════════════════════════════════════════════════════════════

Initializing system...
2025-12-10 15:26:37 [plants-nlqi] info: Intent agent initialized {"model":"claude-sonnet-4-20250514"}
2025-12-10 15:26:37 [plants-nlqi] info: Response agent initialized {"model":"claude-sonnet-4-20250514"}
2025-12-10 15:26:37 [plants-nlqi] info: Conversation service initialized {"maxTurnsInMemory":5}
2025-12-10 15:26:37 [plants-nlqi] info: Embedding service initialized {"model":"voyage-3"}
2025-12-10 15:26:37 [plants-nlqi] info: Vector search service initialized {"indexName":"plants-nlqi","namespace":"default"}
2025-12-10 15:26:37 [plants-nlqi] info: Hybrid search service initialized
2025-12-10 15:26:37 [plants-nlqi] info: PlantsNLQI Phase 2 initialized {"enableConversations":true}
Running health check...
2025-12-10 15:26:37 [plants-nlqi] info: Running health check
2025-12-10 15:26:37 [plants-nlqi] info: Testing intent agent connection
2025-12-10 15:26:39 [plants-nlqi] info: Connection test result {"success":true}
2025-12-10 15:26:39 [plants-nlqi] info: Testing response agent connection
2025-12-10 15:26:42 [plants-nlqi] info: Connection test result {"success":true}
2025-12-10 15:26:42 [plants-nlqi] info: Health check completed {"status":"healthy","services":{"intentAgent":true,"responseAgent":true,"hybridSearch":true}}
All systems operational

2025-12-10 15:26:42 [plants-nlqi] info: Conversation started {"conversationId":"18c41011-15e0-4704-97d5-2c559db1c7a3"}
Conversation started (ID: 18c41011...)

Available Commands:
  help     - Show this help message
  new      - Start a new conversation
  summary  - Show conversation summary
  exit     - Exit the program
  quit     - Exit the program

Example Queries:
  • What native wildflowers are found in North Carolina?
  • Show me drought-tolerant plants
  • Which of those attract butterflies? (follow-up)
  • Find trees that grow in shade and bloom in spring
  • What about shrubs instead? (follow-up)

> Find trees that grow in shade and bloom in spring

Searching...
2025-12-10 15:27:01 [plants-nlqi] info: Processing query {"query":"Find trees that grow in shade and bloom in spring","conversationId":"18c41011-15e0-4704-97d5-2c559db1c7a3"}
2025-12-10 15:27:01 [plants-nlqi] info: Parsing contextual intent {"query":"Find trees that grow in shade and bloom in spring"}
2025-12-10 15:27:04 [plants-nlqi] info: Contextual intent parsed {"queryType":"recommendation","confidence":0.9,"duration":3489}
2025-12-10 15:27:04 [plants-nlqi] info: Performing hybrid search {"queryType":"recommendation","hasFilters":true,"topK":10}
2025-12-10 15:27:05 [plants-nlqi] info: Searching for similar plants {"topK":20}
2025-12-10 15:27:06 [plants-nlqi] info: Search completed {"resultsCount":8}
2025-12-10 15:27:06 [plants-nlqi] info: Plants loaded from file {"count":8}
Metadata filters undefined
2025-12-10 15:27:06 [plants-nlqi] info: Hybrid search completed {"resultsCount":0,"strategy":"hybrid","duration":2023}
2025-12-10 15:27:06 [plants-nlqi] info: Generating context-aware response {"query":"Find trees that grow in shade and bloom in spring","plantCount":0,"hasMemory":true,"isFollowUp":true}
2025-12-10 15:27:13 [plants-nlqi] info: Query completed {"query":"Find trees that grow in shade and bloom in spring","resultCount":0,"totalTime":12248}

Response:
────────────────────────────────────────────────────────────────────────────────
I couldn't find any trees in our database that match both "shade-growing" and "spring-blooming" criteria.

Here are some suggestions to help you find what you're looking for:

**Try searching for:**
- Just "spring blooming trees" (then check which tolerate shade)
- "shade tolerant trees" (then look for bloom times)
- Specific tree names like "dogwood," "redbud," or "serviceberry"

**You might also search by:**
- Your specific region or hardiness zone
- Flower color preferences
- Tree size (small, medium, large)

Many beautiful trees do bloom in spring and tolerate partial shade - our search just might need different keywords to find them! Feel free to try a new search or browse by categories.
────────────────────────────────────────────────────────────────────────────────

Search Info:
   Strategy: hybrid
   Results: 0
   Time: 12248ms

> spring blooming trees

Searching...
2025-12-10 15:27:58 [plants-nlqi] info: Processing query {"query":"spring blooming trees","conversationId":"18c41011-15e0-4704-97d5-2c559db1c7a3"}
2025-12-10 15:27:58 [plants-nlqi] info: Parsing intent {"query":"spring blooming trees"}
2025-12-10 15:28:01 [plants-nlqi] info: Intent parsed successfully {"queryType":"recommendation","confidence":0.9,"duration":2868}
2025-12-10 15:28:01 [plants-nlqi] info: Performing hybrid search {"queryType":"recommendation","hasFilters":true,"topK":10}
2025-12-10 15:28:02 [plants-nlqi] info: Searching for similar plants {"topK":20}
2025-12-10 15:28:02 [plants-nlqi] info: Search completed {"resultsCount":8}
Metadata filters undefined
2025-12-10 15:28:02 [plants-nlqi] info: Hybrid search completed {"resultsCount":4,"strategy":"hybrid","duration":874}
2025-12-10 15:28:02 [plants-nlqi] info: Generating context-aware response {"query":"spring blooming trees","plantCount":4,"hasMemory":true,"isFollowUp":false}
2025-12-10 15:28:13 [plants-nlqi] info: Context-aware response generated {"duration":10996,"inputTokens":935,"outputTokens":331}
2025-12-10 15:28:13 [plants-nlqi] info: Query completed {"query":"spring blooming trees","resultCount":4,"totalTime":14742}

Response:
────────────────────────────────────────────────────────────────────────────────
What great timing to think about spring blooming trees! There are some absolutely stunning native options that will give you beautiful flowers and provide incredible value to local wildlife.

The **Tulip Tree** (*Liriodendron tulipifera*) is probably my top pick for spring drama. In late spring, it produces these gorgeous tulip-shaped flowers in yellow-green with orange centers - though you'll need to wait a few years for blooms if you plant a young tree, as they typically flower when they're taller. It's one of our tallest native hardwoods and grows quite fast, plus bees absolutely love the nectar-rich flowers.

For earlier spring interest, **White Oak** (*Quercus alba*) is magnificent, though its blooms are more subtle - long, drooping catkins that emerge as the leaves unfurl. While not showy like tulip flowers, oaks are absolutely unmatched for wildlife value, supporting hundreds of caterpillar species that feed birds. It's truly a cornerstone species for any native landscape.

**American Holly** (*Ilex opaca*) rounds out the group with small, fragrant white flowers in late spring. What makes holly special is that those spring blooms lead to bright red berries that provide critical winter food for birds - just remember you'll need both male and female trees for berry production.

All of these are substantial trees that will give you decades of spring beauty while supporting your local ecosystem. Do any of these sound like they'd work well in your landscape?
────────────────────────────────────────────────────────────────────────────────

4 Matching Plants:

1. Liriodendron tulipifera (Tulip Tree)
   ███ 30.7%
   Tree • Perennial
   Water: Medium • Sun: Full Sun • Wildlife: Birds, Pollinators

2. Carya carolinae-septentrionalis (Southern Shagbark Hickory)
   ██ 24.0%
   Tree • Perennial
   Water: Medium • Sun: Full Sun • Wildlife: Mammals, Birds

3. Ilex opaca (American Holly)
   ██ 23.7%
   Tree • Perennial
   Water: Medium • Sun: Full Sun, Partial Shade • Wildlife: Birds

4. Quercus alba (White Oak)
   ██ 22.7%
   Tree • Perennial
   Water: Medium • Sun: Full Sun, Partial Shade • Wildlife: Birds, Mammals

Search Info:
   Strategy: hybrid
   Results: 4
   Time: 14742ms

>
```

## Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0
- Anthropic API key
- Pinecone account
- Voyage AI API key

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

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

### Phase 1: Basic RAG
- Claude API integration
- Basic vector search with Pinecone
- Simple prompt templates
- Static PLANTS data testing

### Phase 2: Agent Layer
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
- PostgreSQL (optional for Phase 1)

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

## Current Status

🚀 **Phase 1** - In Progress

## Contributing

This is a learning project. Feel free to experiment and extend!

## License

MIT

## Acknowledgments

- USDA Natural Resources Conservation Service for the PLANTS Database
- Anthropic for Claude AI

# AI Projects

A collection of machine learning and artificial intelligence projects demonstrating various AI techniques and applications.

## Projects

### [Flower Recognition](./flower-recognition)
A TypeScript implementation of a CNN-based flower classification system using TensorFlow.js.

**Technology**: TensorFlow.js, TypeScript, Convolutional Neural Networks

**Description**: This supervised learning project trains a deep learning model to identify 5 different types of flowers (Daisy, Dandelion, Rose, Sunflower, and Tulip) from images. The model uses a Convolutional Neural Network architecture with multiple convolutional and pooling layers to extract visual features and classify flower images with high accuracy.

**Key Features**:
- Image classification for 5 flower species
- Data augmentation for improved model generalization
- Type-safe implementation with full TypeScript support
- Real-time training metrics and validation accuracy
- Modular architecture with clean separation of concerns

**Use Cases**: Gardening apps, educational tools, photography/social media auto-tagging, agriculture research

---

### [PLANTS Natural Language Query Interface](./plants-nlqi)
A TypeScript-based Natural Language Query Interface for the USDA PLANTS Database, powered by Claude AI and RAG (Retrieval Augmented Generation) architecture.

**Technology**: Anthropic Claude (Sonnet 4), Pinecone Vector Database, Voyage AI Embeddings, TypeScript, Express.js

**Description**: This RAG-based project enables users to query the USDA PLANTS Database using natural language instead of complex search forms. Ask questions like "What native wildflowers bloom in spring in North Carolina?" and receive intelligent, contextual answers powered by semantic search and AI-generated responses. The system combines vector embeddings for semantic understanding with structured data retrieval to provide accurate, informative answers about native plants.

**Key Features**:
- Natural language plant queries with semantic search
- Hybrid search combining vector similarity and structured filters
- AI-powered conversational responses using Claude
- Multi-phase implementation from basic RAG to multi-agent architecture
- CLI and API interfaces for flexible usage
- Real-time query processing with comprehensive logging

**Use Cases**: Gardening and landscaping planning, native plant identification, ecological restoration projects, educational resources, pollinator garden design

---

### [Cortex](./cortex)
An autonomous AI agent CLI that intelligently executes tasks through natural language conversations.

**Technology**: Vercel AI SDK, OpenAI, TypeScript, Ink (React for CLI), Laminar, OpenSpec

**Description**: Cortex is a production-ready AI agent that combines file operations, shell commands, code execution, and web search into a conversational terminal interface. Built with a manual agent loop using `streamText`, Cortex demonstrates advanced agent architecture patterns including tool chaining, autonomous task execution, and systematic agent evaluation. The project showcases spec-driven development with OpenSpec for managing change proposals and maintaining alignment between documentation and implementation.

**Key Features**:
- Manual agent loop with full control over conversation flow and tool execution
- Autonomous multi-step task execution with intelligent tool chaining
- Interactive terminal UI built with React components (Ink)
- Systematic agent evaluation and testing with Laminar
- Spec-driven development workflow using OpenSpec
- Tool design with Zod schemas, parallel execution, and error handling
- Conversation memory management across multi-turn interactions

**Use Cases**: Code refactoring and analysis, workflow automation, technical research, data analysis, development task assistance

---

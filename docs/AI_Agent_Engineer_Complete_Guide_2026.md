# The Complete Guide: How to Become an AI Agent Engineer in 2026

**Author:** Arman Hezarkhani  
**Source:** https://x.com/ArmanHezarkhani

---

## Introduction

We're going to pay several engineers over $1,000,000 this year. Not founders. Engineers.

The best AI agent engineers have absurd leverage—one person shipping what used to take a team of five. At Tenex, compensation is uncapped. So the math just works.

Problem is, we can't find enough of them.

We've reviewed hundreds of take-home assignments this year. Most candidates fail. Not because they can't code, but because they never learned to work with AI before trying to build AI systems.

The ones who get hired took a different path. This guide is that path.

**Ten projects. Complete them all and you'll be able to build, ship, and maintain production AI agents—the skill set that commands seven figures.**

---

## Agents Are Simpler Than You Think

Before we dive into the projects, let me give you the mental model that makes everything click.

Strip away the jargon and every agent has three parts:

### 1. Trigger
What starts the agent? A user message, a webhook, a cron job, an email arriving, a file being uploaded. The trigger is the event that wakes up your agent.

### 2. Agent Loop
The core reasoning cycle. The LLM receives context, decides what to do, takes an action, observes the result, and decides whether to continue or stop. This loop is the "agentic" part. It's what separates an agent from a chatbot.

### 3. Tools
The capabilities available to the agent. Reading files, searching the web, calling APIs, executing code, sending emails, updating databases. Tools are how agents actually do things in the world.

That's it. Every agent framework—LangGraph, CrewAI, the Claude Agent SDK—is just a different way of implementing these three components. Once you understand this architecture, you can learn any framework in a weekend.

The projects in this guide are sequenced to build these skills progressively. First you'll learn to work with AI. Then you'll build simple apps. Then chatbots. Then agents with tools. Then agents that act autonomously. Then production systems.

---

## Project 1: Vibe Code a Complete App with Lovable

### Overview
Before you write a single line of code, you need to learn what "vibe coding" actually feels like. Lovable is the perfect place to start.

**What you'll build:** A job application tracker.

Lovable is an AI-powered full-stack app builder. You describe what you want in plain English, and it generates a working React application. The tech stack (React 18, TypeScript, Tailwind CSS) produces smooth, modern apps out of the box.

### Why This Matters
Vibe coding—the term Andrej Karpathy coined in February 2025—isn't about being lazy. It's about learning to communicate with AI so clearly that it can execute your vision. Collins Dictionary named it the 2025 Word of the Year. 25% of Y Combinator startups in Winter 2025 had codebases that were 95% AI-generated.

If you can't articulate what you want precisely enough for Lovable to build it, you definitely can't articulate it precisely enough to build agents.

### The Build
Create a job application tracker with:
- A Kanban board view (Applied → Phone Screen → Onsite → Offer → Rejected)
- A detail view for each company showing notes, contacts, and next steps
- A dashboard with stats: applications this week, response rate, pipeline by stage
- Search and filter by company, role, or status

The goal isn't just to finish—it's to iterate. Your first prompt won't be perfect. You'll refine, adjust, and learn how to communicate precisely with AI.

### What You'll Learn
- How to break down a product vision into implementable pieces
- How to prompt iteratively instead of trying to get everything right the first time
- How to debug when things don't work ("I am frustrated" is an official Lovable prompting pattern—it actually helps)

### Key Insight
The quality of your output is directly proportional to the quality of your input. "Make me a tracker" produces garbage. "Create a Kanban board with five columns for job application stages, drag-and-drop between columns, and a slide-out panel when clicking a card that shows company details and interview notes" produces something useful.

### Alternative Ideas
- Personal finance dashboard with spending categories and monthly trends
- Workout tracker with exercise library, sets/reps logging, and progress charts
- Reading list manager with status, ratings, and notes
- Recipe collection app with ingredient search and meal planning

---

## Project 2: Build a Web App with Claude Code

### Overview
Now you're going to build a similar app, but with more control. Claude Code is where you learn to direct AI to write real code.

**What you'll build:** A bookmark manager with superpowers.

Claude Code (formerly Claude's agentic coding tool, now available as the Claude Agent SDK for developers) is different from Lovable. You're not just prompting—you're collaborating. Claude reads your files, understands your codebase, runs commands, and iterates until things work.

### The Build
Create a bookmark manager that includes:
- User authentication (email/password or OAuth)
- Save bookmarks with auto-fetched title, description, and thumbnail
- Tagging system with auto-suggestions based on content
- Full-text search across all bookmarks
- Folder organization with drag-and-drop
- Public/private sharing with unique links
- Deploy to Vercel or Railway

This project forces you to deal with real backend complexity: databases, authentication, external API calls (for fetching link previews), and deployment.

### What You'll Learn
- How to break complex projects into manageable tasks
- How to review and understand AI-generated code (this is critical—vibe coding without understanding is dangerous in production)
- How to debug with AI assistance
- How to deploy

### The Anthropic Pattern
Tell Claude to write tests first. Confirm the tests fail. Then implement until they pass. This workflow produces dramatically better results than "just write the code."

### Alternative Ideas
- Habit tracker with streaks, reminders, and weekly reports
- Simple invoicing tool with PDF generation and payment status
- Time tracker with projects, clients, and exportable reports
- Personal CRM for managing contacts, notes, and follow-up reminders

---

## Project 3: Build a Mobile App with Cursor and Expo

### Overview
Same skills, different environment. Mobile development has its own quirks, and learning to direct AI across different platforms makes you more versatile.

**What you'll build:** A receipt scanner and expense tracker.

Cursor is an AI-first IDE that integrates Claude and GPT directly into your coding workflow. Combined with Expo's hot reloading and cross-platform capabilities, you can move fast.

### The Build
Create an expense tracker that includes:
- Camera integration to photograph receipts
- Auto-extraction of merchant, amount, and date from the photo (use Claude's vision)
- Manual category assignment with smart defaults
- Monthly spending breakdown by category
- Export to CSV for taxes or reimbursement
- Works on both iOS and Android

This project teaches you mobile-specific patterns: camera permissions, image handling, local storage, and building UIs that feel native on both platforms.

### What You'll Learn
- How to translate between AI suggestions and platform-specific constraints
- How mobile development patterns differ from web
- How to test on physical devices
- How to use multimodal AI (vision) in a real app

This project is critical because mobile apps appear in several of the real take-home assignments we give at Tenex. If you can build confidently with Expo, you're ahead of most candidates.

### Alternative Ideas
- Voice memo app with transcription and searchable archive
- Workout timer with custom intervals and audio cues
- Daily journal with prompts, mood tracking, and photo attachments
- Flashcard app with spaced repetition

---

## Project 4: Your First LLM Integration

### Overview
Now you're ready to build something that actually uses AI. Start simple: a ChatGPT wrapper.

**What you'll build:** A writing coach that improves your prose.

This sounds trivial. It is. That's the point. You need to understand the fundamentals before you add complexity.

### The Build
Create a writing improvement tool that:
- Accepts pasted text or direct typing
- Connects to Claude or OpenAI's API
- Streams the improved version in real-time (typing effect)
- Shows a diff view highlighting what changed and why
- Lets you accept/reject individual suggestions
- Maintains history of your writing sessions
- Has tone presets: Professional, Casual, Academic, Concise

The key is the diff view. Don't just spit out improved text—show the user exactly what changed. This teaches you about structured output and building UIs that make AI useful, not just impressive.

### What You'll Learn
- How LLM APIs actually work
- Token economics
- The difference between streaming and non-streaming responses
- How to structure prompts for consistent output
- Error handling when APIs fail

### Key Insight
Most "AI apps" are just chat wrappers with a good system prompt. Understanding this deeply—why some prompts work and others don't—is foundational knowledge for everything that follows.

### Alternative Ideas
- Code reviewer that catches bugs and suggests improvements
- Interview prep coach that asks questions and critiques your answers
- Meal planner that suggests recipes based on ingredients and dietary restrictions
- Email rewriter that adjusts tone for different audiences

---

## Project 5: Document Q&A with RAG

### Overview
Now you're adding retrieval. This is where AI apps get genuinely useful.

**What you'll build:** A company knowledge base that answers employee questions.

RAG (Retrieval-Augmented Generation) is the pattern that connects LLMs to your data. Instead of the model hallucinating answers, it retrieves relevant context first, then generates based on actual information.

### The Architecture
Documents → Chunking → Embeddings → Vector DB → Retrieval → LLM → Answer with Citations

### The Build
Create a "Talk to Your Company" knowledge base:
- Upload employee handbook, policies, benefits docs, org charts (PDFs and markdown)
- Chunk documents intelligently (by section, not arbitrary character counts)
- Embed into a vector database (ChromaDB locally, Pinecone for production)
- Chat interface where employees ask questions
- Every answer includes clickable citations showing the exact source
- Confidence indicator when the system isn't sure
- Admin view showing most common questions (to identify documentation gaps)

The citation piece is critical. Users don't trust AI that can't show its work.

### What You'll Learn
- Chunking strategies and why chunk size matters
- Embedding models and how semantic search works
- Vector databases and their tradeoffs
- How to add citations that users can actually verify
- When RAG fails and why

This is the foundation for the Talk-to-a-Folder take-home assignment we give to engineering candidates at Tenex. A user authenticates with GSuite, pastes a Google Drive folder link, and chats with an agent that can answer questions about any file in the folder with citations.

### Alternative Ideas
- Research paper assistant that answers questions about uploaded academic papers
- Legal document analyzer for contracts and agreements
- Personal knowledge base for your own notes and documents
- Textbook Q&A for students studying specific subjects

---

## Project 6: The ReAct Agent Loop From Scratch

### Overview
Before you touch any framework, build the core agent loop yourself. This is the project that separates people who use agents from people who understand them.

**What you'll build:** A competitive research agent that investigates companies.

### The Architecture
User Input → LLM Decides Action → Execute Tool → Observe Result → Repeat Until Done

### The Prompt Pattern (ReAct)

```
You are a competitive research assistant with access to these tools:
- search(query): Search the web for information
- get_company_info(ticker): Get company financials and info
- calculate(expression): Evaluate math expressions

To use a tool, respond with:
THOUGHT: [your reasoning]
ACTION: [tool_name]
INPUT: [tool_input]

When you have the final answer, respond with:
THOUGHT: [your reasoning]
ANSWER: [your final response]
```

### The Build
Create a research agent that can answer questions like:
- "How does Stripe's revenue compare to Square's?"
- "What are the main risks mentioned in Tesla's latest 10-K?"
- "Give me a competitive analysis of Figma vs. Sketch vs. Canva"

The agent should:
- Decide which tools to use based on the question
- Chain multiple searches when needed
- Show its reasoning at each step
- Know when to stop researching and synthesize an answer
- Handle failures gracefully (what if a search returns nothing?)

Build it with: Python + any LLM API. No frameworks. Raw API calls. This is intentional.

### What You'll Learn
- How the agent loop actually works
- Why tool descriptions matter
- How to parse LLM outputs reliably
- Why agents sometimes get stuck in loops
- How to implement stopping conditions

This is the foundation everything else builds on. If you skip this, you'll never truly understand what LangGraph and CrewAI are abstracting away.

### Alternative Ideas
- Trip planner that searches flights, hotels, and activities
- Fact-checker that verifies claims against multiple sources
- Product comparison agent that researches and ranks options
- Job research agent that analyzes companies before interviews

---

## Project 7: Build an MCP Server

### Overview
MCP (Model Context Protocol) is the universal standard for connecting agents to tools. Anthropic released it in November 2024, OpenAI and Google adopted it by early 2025, and it's now governed by the Linux Foundation under the Agentic AI Foundation.

MCP is to AI agents what USB-C is to devices—one protocol, everything connects.

**What you'll build:** An MCP server that exposes your personal CRM as tools for any AI assistant.

### The Architecture
Your Data → MCP Server → Claude/GPT/Any MCP Client → Agent Actions

### Core Concepts
- **Tools:** Functions the agent can call (add_contact, search_contacts, log_interaction)
- **Resources:** Data the agent can access (contact list, recent interactions, tags)
- **Prompts:** Pre-built interaction patterns (weekly_followup, meeting_prep)

### The Build
Create an MCP server for a personal CRM that includes:
- Tools: add_contact, update_contact, search_contacts, log_interaction, get_contact_history, add_reminder
- Resources: All contacts (with pagination), contacts by tag, upcoming reminders
- Storage: SQLite database for persistence

Once built, you can ask Claude: "Who should I follow up with this week?" or "What do I know about Sarah from the Acme meeting?" and it will query your actual data.

Build it with: TypeScript or Python MCP SDK. Start with the official quickstart, then customize.

### What You'll Learn
- How standardized tool interfaces work
- Why MCP is winning over custom integrations
- How to make your data agent-accessible while maintaining security
- How to test MCP servers with the Claude desktop app

There are already thousands of MCP servers available—over 5,800 as of late 2025. But building your own teaches you how the protocol actually works, which matters when you're debugging production agents.

### Alternative Ideas
- Obsidian notes server that exposes your knowledge base
- Local SQLite database server for any structured data
- Task manager that integrates with your todo app
- Calendar server that exposes scheduling tools

---

## Project 8: Calendar and Email Agent

### Overview
Now you're building something that takes actions in the real world. This is where agents get genuinely useful—and where things get genuinely tricky.

**What you'll build:** A calendar assistant that helps you schedule meetings and draft emails.

### The Architecture
User Request → Parse Intent → Check Calendar → Draft Response → Human Approval → Execute

### Core Concepts
- **OAuth integration:** How agents authenticate with external services
- **Human-in-the-loop:** Getting approval before taking irreversible actions
- **State management:** Tracking conversation context across turns
- **Action boundaries:** What the agent can vs. cannot do

### The Build
Create a calendar assistant where a user can:
- Authenticate with their Google account
- See their calendar in a clean, readable format
- Chat naturally: "I have three meetings I need to schedule with Joe, Dan, and Sally. I really want to block my mornings off to work out, so can you write me an email draft I can share with each of them?"
- Ask questions: "How much of my time am I spending in meetings? How would you recommend I decrease that?"
- Review and approve email drafts before they're sent
- Get scheduling suggestions based on availability patterns

The human-in-the-loop piece is critical. The agent can draft emails, but a human must approve them. This is a core pattern in production agents.

### What You'll Learn
- Real-world API integration challenges
- Why approval workflows matter (you do NOT want an agent sending emails without review)
- How to handle scheduling conflicts
- The difference between drafting and sending

This is one of the exact take-home assignments we give to engineering candidates at Tenex. The Calendar Assistant tests OAuth integration, agent design, and product thinking all at once.

### Alternative Ideas
- Meeting prep agent that researches attendees and creates briefing docs
- Travel booking agent that searches and suggests flights/hotels
- Expense report agent that drafts reports from receipt photos
- Sales outreach agent that drafts personalized emails based on prospect research

---

## Project 9: Proactive Agent with Triggers

### Overview
Until now, all your agents have been reactive—they wait for user input. Real-world agents often need to act autonomously.

**What you'll build:** An inbox concierge that automatically classifies and organizes your email.

This is where you learn triggers—the first part of the trigger/loop/tools framework.

### The Architecture
Trigger (new email / scheduled job) → Agent Loop → Classify → Take Action → Log Result

### The Build
Create an email classification system that:
- Authenticates with Gmail via OAuth
- Fetches your last 200 email threads on first load
- Classifies each thread into buckets: Important, Can Wait, Auto-Archive, Newsletter, Requires Response
- Shows emails in a clean UI with subject lines and previews (like the Gmail homepage)
- Lets users create custom buckets ("Recruiting", "Client X", "Personal")
- Reclassifies all emails when new buckets are added
- Runs automatically on new incoming emails (webhook or polling)

The key insight: you don't need fine-tuning. Prompting with good examples handles most classification tasks.

### What You'll Learn
- How to implement triggers (cron jobs, webhooks, polling)
- How to process items in batches efficiently
- How to prompt for consistent classification
- How to handle failures gracefully (what happens when the API is down?)
- How to log and monitor autonomous agents

This is the Inbox Concierge take-home at Tenex—it tests classification design, batch processing, and the ability to build proactive systems.

### Key Insight
Proactive agents require more guardrails than reactive ones. You can't ask "are you sure?" when the user isn't there. Your code must be bulletproof about what actions are allowed and when.

### Alternative Ideas
- GitHub PR reviewer that automatically comments on new pull requests
- Daily news digest that curates articles based on your interests
- Slack channel summarizer that posts daily recaps of busy channels
- Social media monitor that alerts you to mentions of your company
- Price tracker that notifies you when items drop below a threshold

---

## Project 10: Production Agent with Observability

### Overview
This is the capstone: a production-ready agent with everything a real deployment needs.

**What you'll build:** Your Calendar Agent from Project 8, rebuilt for production.

### The Architecture
Agent + Observability Layer + Evaluation Suite + Alerting + Cost Tracking

### Core Concepts
- **Tracing:** Following requests through the entire agent pipeline
- **Evaluation:** Automated testing of agent outputs
- **Cost management:** Tracking and controlling LLM spend
- **Failure modes:** Graceful degradation when things break
- **Monitoring:** Knowing when something goes wrong at 3am

### The Build
Take your Calendar Agent and add:
- **Tracing:** Log every step (user input → intent parsing → calendar lookup → email draft → approval). Use LangSmith, LangFuse, or Maxim.
- **Evaluation suite:** 30+ test cases covering common queries, edge cases, and failure modes. Track pass/fail rates over time.
- **Cost tracking:** Track tokens used per request, cost per user, cost per feature. Set up alerts for unusual spend.
- **Error handling:** Graceful fallbacks when the calendar API is down, when the LLM times out, when parsing fails.
- **Dashboard:** Success rate, average latency, cost per day, most common failure modes.
- **Alerting:** PagerDuty/Slack alerts when error rates spike or costs exceed thresholds.

Deploy it and keep it running for at least a week. Watch what breaks. Fix it. This is the only way to learn what production actually requires.

### What You'll Learn
- Why production agents need different patterns than prototypes
- How to catch regressions before users do
- When to alert humans
- How to optimize cost without sacrificing quality

### Key Insight
The best agent in the world is useless if it breaks at 3am and nobody notices. Production readiness is what separates demos from real products.

### Alternative Ideas
- Add observability to your Inbox Concierge
- Add observability to your competitive research agent
- Add observability to any agent you want to actually use daily

---

## The Real Tenex Take-Home Assignments

At Tenex, we hire AI engineers who can actually build. Here are the exact take-home projects we give candidates—all of which map to the skills in this guide:

### Calendar Assistant
Build a web or mobile interface where users authenticate with GSuite, view their calendar, and chat with an agent that can help them schedule meetings and draft emails.

### Talk-to-a-Folder
Build an interface where users authenticate with GSuite, paste a Google Drive folder link, and chat with an agent that can answer questions about any file in the folder with citations.

### Better-Perplexity
Build a chat interface with web search capabilities, then extend it in a technically compelling direction of your choice.

### Inbox Concierge
Build an interface that classifies the user's last 200 email threads into buckets, then lets users create custom buckets that trigger reclassification.

### Smart Recipe Planner
Build a mobile app using Expo where users photograph ingredients and get recipe suggestions—no chat interface, just structured UI.

Each project tests different skills: OAuth integration, RAG implementation, classification, structured outputs, mobile development, and creative extension of basic capabilities.

The best submissions share common traits: they work reliably, they handle edge cases gracefully, and they include thoughtful documentation about tradeoffs and next steps.

---

## The 2026 Landscape: What Actually Matters

Now that you understand the fundamentals, here's how the frameworks map to real use cases:

### Claude Agent SDK
The fastest path from "idea" to "working agent" for most use cases. What started as Anthropic's internal coding tool has become a general-purpose agent framework. At Tenex, we've found it's the best choice for getting things working quickly. It gives you the same tools, agent loop, and context management that power Claude Code.

### LangGraph
Dominates for complex production agents. It treats agent workflows as state machines with nodes, edges, and conditional logic. If you need branching, retries, human-in-the-loop approvals, or complex multi-step workflows, LangGraph is the standard. LinkedIn, Uber, and 400+ companies run it in production.

### CrewAI
Owns multi-agent collaboration. If you need multiple agents working together with defined roles—researcher, writer, reviewer—CrewAI's abstraction is cleaner than building it yourself. Over 100,000 developers are certified through their community courses, and it powers 1.4 billion agentic automations monthly.

### MCP
The universal standard for tool connections. Don't build custom integrations anymore. Build MCP servers. Everything is converging on this protocol.

### What You Should Ignore
AutoGPT (good for experiments, bad for production), OpenAI's Swarm (explicitly "not production-ready" in their own docs), and any framework that hasn't been updated in the last six months.

---

## The Vibe Coding Advantage

Here's something that wasn't true two years ago: you don't need to be a great programmer to build great agents.

The bottleneck has shifted. The scarce skills are now:

- **Clear problem definition:** Knowing exactly what you want to build
- **Architectural thinking:** Understanding how components fit together
- **Quality judgment:** Knowing when output is good enough
- **Iteration speed:** Quickly trying variations and converging on solutions

You can learn these skills by building the projects in this guide. Each one forces you to define a problem clearly, architect a solution, judge quality, and iterate.

The meta-skill is learning to work with AI effectively. If you can direct Claude Code or Cursor to build agents, you can build agents 10x faster than someone who codes everything by hand.

Simon Willison put it well: "If an LLM wrote every line of your code, but you've reviewed, tested, and understood it all, that's not vibe coding—that's using an LLM as a typing assistant." The professional version of vibe coding is AI-assisted development where you remain in control.

---

## The 100-Hour Curriculum

Here's how to structure your learning:

### Hours 1-10: Learn to Work with AI
- Vibe code a complete app with Lovable (Project 1)
- Read Anthropic's "Building Effective Agents" guide
- Get comfortable with the delegation mindset

### Hours 11-25: Build Non-Agentic Apps
- Build a web app with Claude Code (Project 2)
- Build a mobile app with Cursor + Expo (Project 3)
- Deploy both to production

### Hours 26-40: First LLM Integrations
- Build your ChatGPT wrapper (Project 4)
- Build the RAG document Q&A (Project 5)
- Understand how retrieval transforms what's possible

### Hours 41-55: Understand Agent Fundamentals
- Build the ReAct loop from scratch (Project 6)
- Build an MCP server (Project 7)
- Internalize the trigger/loop/tools framework

### Hours 56-80: Build Real Agents
- Build the calendar/email agent (Project 8)
- Build a proactive agent with triggers (Project 9)
- Handle the complexity of real-world integrations

### Hours 81-100: Production Readiness
- Add observability to one of your agents (Project 10)
- Deploy it publicly
- Document your learnings and next steps

That's about 2-3 hours per day for five weeks, or a focused month if you can dedicate more time.

---

## What Separates Good From Great

The engineers who excel at agent development share these traits:

### They think in systems, not prompts
Prompt engineering matters, but system design matters more. Where does context come from? How do tools interact? What happens when things fail?

### They test obsessively
Great agent engineers build evaluation suites before they build features. They know exactly how their agent performs across hundreds of test cases.

### They understand the cost/quality tradeoff
Every agent decision has a cost. More context = better answers = more tokens = more money. Great engineers find the sweet spot.

### They design for failure
Agents will hallucinate, call wrong tools, get stuck in loops, and produce garbage. Great engineers anticipate these failures and handle them gracefully.

### They iterate rapidly
The first version of any agent is terrible. The tenth version is usually good. Great engineers move through iterations quickly instead of trying to get it perfect the first time.

These aren't innate traits. They're skills you develop by building things and paying attention to what works.

---

## TL;DR

- **Start by mastering AI tools, not frameworks.** The best AI engineers aren't the best coders—they're the best at working with AI. Learn to vibe code effectively before you build AI systems.

- **Agents have three parts: trigger, loop, tools.** Every framework is just a different way of implementing these. Understand the pattern, and you can learn any framework.

- **The 10 projects form a curriculum:** Lovable app → Claude Code web app → Cursor mobile app → ChatGPT wrapper → RAG document Q&A → ReAct loop from scratch → MCP server → Calendar agent → Proactive agent → Production observability.

- **The landscape has settled.** Claude Agent SDK for speed, LangGraph for complex workflows, CrewAI for multi-agent systems, MCP for tool connections.

- **The Tenex take-homes test real skills.** Calendar Assistant, Talk-to-a-Folder, Better-Perplexity, Inbox Concierge, Smart Recipe Planner—each tests different patterns you need to master.

- **Production is different from prototypes.** Observability, evaluation, cost tracking, and failure handling separate real systems from demos.

- **100 hours of focused building beats 200 hours of tutorials.** Build things, break things, and iterate until they work. The frameworks are free. The APIs are available. The only question is whether you'll put in the work.

**Start building.**

---

*Article compiled from X (formerly Twitter) post by Arman Hezarkhani (@ArmanHezarkhani), cofounder of Tenex*

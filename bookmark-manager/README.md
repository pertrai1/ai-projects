# Bookmark Manager

## Overview

A bookmark manager with superpowers, built with Claude Code using a spec-driven development approach.

**Tech Stack:** Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma v7, Tailwind CSS v4, Vitest

### The Build

- User authentication (email/password or OAuth)
- Save bookmarks with auto-fetched title, description, and thumbnail
- Tagging system with auto-suggestions based on content
- Full-text search across all bookmarks
- Folder organization with drag-and-drop
- Public/private sharing with unique links
- Deploy to Vercel

### The Anthropic Pattern

Tell Claude to write tests first. Confirm the tests fail. Then implement until they pass. This workflow produces dramatically better results than "just write the code."

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL
npm run dev             # starts on http://localhost:3000
```

## Roadmap

### 1. Project Setup & Planning ✅

- Tech stack selected (Next.js, TypeScript, Prisma, PostgreSQL, Tailwind, Vitest)
- Repository structure configured
- Linting, formatting, and testing set up
- Health-check endpoint and home page created

### 2. User Authentication

- Implement basic email/password authentication
- Setup OAuth (Google/GitHub)
- Add secure password storage/validation
- Authentication tests and error handling

### 3. Bookmark CRUD & Preview

- Design bookmark data model
- Implement create/read/update/delete for bookmarks
- Integrate external API for fetching link previews (title, description, thumbnail)
- Write unit and integration tests for preview logic

### 4. Tagging & Suggestions

- Build tagging UI and backend
- Implement auto-suggestions based on bookmark content
- Allow manual tag edit
- Ensure test coverage

### 5. Folder Organization & Drag-and-Drop

- Data model for folders
- Implement folder CRUD operations
- Front-end drag-and-drop for folders and bookmarks
- Folder/bookmark reordering logic

### 6. Full-Text Search

- Backend and front-end search implementation
- Indexing strategies for performance
- Test search features thoroughly

### 7. Sharing Features

- Public/private sharing of bookmarks/folders
- Generate unique links for sharing
- Set access controls
- Write tests for sharing logic

### 8. Testing Pattern: Anthropic Style

- Write tests before implementation for each major feature
- Confirm tests fail initially
- Implement feature until tests pass
- Review code and refactor as needed

### 9. Deployment & Final Checks

- Set up a hosted PostgreSQL instance (Neon or Vercel Postgres free tier)
- Connect the repository to Vercel with root directory set to `bookmark-manager/`
- Configure `DATABASE_URL` as an environment variable in Vercel dashboard
- Deploy and verify `/api/health` returns 200 on the live URL
- Final end-to-end testing
- Monitor deployment and resolve issues
- Documentation and onboarding guide

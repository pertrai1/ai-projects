# Documentation Specification

## ADDED Requirements

### Requirement: Project Overview
The README SHALL provide a clear, comprehensive introduction to the project.

#### Scenario: Project title and description
- **WHEN** a user reads the README
- **THEN** they see a clear title and 1-2 paragraph description of the red-teaming probe agent

#### Scenario: Research context provided
- **WHEN** a user wants to understand the background
- **THEN** the README includes a Background section explaining multi-turn conversational failures in LLMs

#### Scenario: Reference to source paper
- **WHEN** a user wants to learn more about the research
- **THEN** the README links to or references the "Eliciting Behaviors in Multi-Turn Conversations" paper

### Requirement: Getting Started Guide
The README SHALL include step-by-step setup instructions.

#### Scenario: Prerequisites listed
- **WHEN** a user wants to run the project
- **THEN** required dependencies (Node.js version, npm, API keys) are clearly listed

#### Scenario: Installation steps provided
- **WHEN** a user follows the setup guide
- **THEN** instructions for cloning, installing dependencies, and configuring environment variables are included

#### Scenario: Environment configuration explained
- **WHEN** a user needs to configure API keys
- **THEN** instructions reference .env.example and explain required variables

### Requirement: Usage Instructions
The README SHALL document how to run and use the application.

#### Scenario: Basic usage command
- **WHEN** a user wants to run the application
- **THEN** the command `npm run start` is documented with its purpose

#### Scenario: Available commands listed
- **WHEN** a user wants to know available operations
- **THEN** all npm scripts (build, start, type-check) are documented

### Requirement: Project Structure Documentation
The README SHALL include a visual representation of the codebase organization.

#### Scenario: Directory tree shown
- **WHEN** a user wants to understand the project layout
- **THEN** a text-based directory tree diagram is provided

#### Scenario: Key files and directories explained
- **WHEN** a user examines the structure diagram
- **THEN** important directories (src/, dist/, openspec/) and files are annotated with their purpose

### Requirement: Technical Context
The README SHALL explain key technical decisions and constraints.

#### Scenario: Project goals stated
- **WHEN** a user reads the README
- **THEN** the primary goal (learning from the research paper) is clearly stated

#### Scenario: Scope limitations documented
- **WHEN** a user wants to understand project boundaries
- **THEN** non-goals and explicit constraints from the ROADMAP are referenced

### Requirement: License Information
The README SHALL specify the project license.

#### Scenario: License clearly stated
- **WHEN** a user wants to know usage rights
- **THEN** the MIT license is documented at the end of the README

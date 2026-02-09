# AGENTS.md - Project Configuration

## Startup Protocol

At the start of EVERY task or story:

1. **Read all files in `.agent/rules/`** before any implementation work
2. **Apply rules automatically** throughout the task
3. **Confirm rule adherence** in task summaries

## Active Rules

- `preserve-artifacts.md` - Version all artifacts, never overwrite
- `testing-philosophy.md` - Tests are sacred, fix implementation not tests

---

**REMINDER**: Check `.agent/rules/` directory and follow all documented rules.

---

# Custom Agents

## Code Refactorer
- **Path**: `agents/code-refactorer.md`
- **Description**: Use this agent when you need to improve existing code structure, readability, or maintainability without changing functionality.

## Commit Agent
- **Path**: `agents/commit-agent.md`
- **Description**: Use this agent when you need to write conventional commit messages following the project's standards.

## Content Writer
- **Path**: `agents/content-writer.md`
- **Description**: Use this agent when you need to create compelling, informative content that explains complex topics in simple terms.

## Dev Browser Agent
- **Path**: `agents/dev-browser-agent.md`
- **Description**: Use this agent when you need browser automation for navigation, form filling, screen capture, or data extraction.

## Frontend Designer
- **Path**: `agents/frontend-designer.md`
- **Description**: Use this agent when you need to convert design mockups, wireframes, or visual concepts into detailed technical specifications and implementation guides.

## PRD Generator
- **Path**: `agents/prd-generator.md`
- **Description**: Use this agent to generate a technical JSON Product Requirements Document (PRD) for autonomous execution by Ralph.

## PRD Writer
- **Path**: `agents/prd-writer.md`
- **Description**: Use this agent when you need to create a comprehensive Product Requirements Document (PRD) for a software project or feature.

## Project Task Planner
- **Path**: `agents/project-task-planner.md`
- **Description**: Use this agent when you need to create a comprehensive development task list from a Product Requirements Document (PRD).

## Security Auditor
- **Path**: `agents/security-auditor.md`
- **Description**: Use this agent when you need to perform a comprehensive security audit of a codebase, identify vulnerabilities, and generate a detailed security report.

## Vibe Coding Coach
- **Path**: `agents/vibe-coding-coach.md`
- **Description**: Use this agent when users want to build applications through conversation, focusing on the vision and feel of their app rather than technical implementation details.

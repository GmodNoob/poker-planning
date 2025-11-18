# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a poker planning web application for agile task estimation using the Fibonacci sequence. The application enables teams to estimate tasks collaboratively.

**Tech Stack:**
- **Frontend**: React with Tailwind CSS, shadcn/ui components, and TanStack (Query/Router/Table)
- **Database**: SQLite
- **Configuration**: Simple file-based team composition configuration

## Project Status

This is a greenfield project. The codebase structure has not been established yet.

## Development Setup (To Be Implemented)

When setting up the project structure, ensure:
- React application with TypeScript support
- Tailwind CSS configured with shadcn/ui component system
- TanStack libraries integrated (React Query for data fetching, Router for navigation)
- SQLite database with appropriate schema for planning sessions and estimates
- Configuration system for team composition (JSON or YAML format)

## Core Features to Implement

1. **Team Configuration**: Load and manage team member definitions from configuration file
2. **Planning Sessions**: Create and manage estimation sessions
3. **Fibonacci Voting**: Implement voting mechanism using Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, etc.)
4. **Real-time Updates**: Display votes and results to team members
5. **Database Persistence**: Store sessions, votes, and results in SQLite
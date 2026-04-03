# Contributing to ClipSync

Thank you for your interest in contributing to ClipSync! This guide will help you get set up and familiar with the project conventions.

---

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Project Conventions](#project-conventions)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or higher (see `.nvmrc`)
- [pnpm](https://pnpm.io/) package manager

### Local Development Setup

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/clipsync.git
cd clipsync

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open `http://localhost:5999` in your browser. To test multi-device functionality, open the same URL from another device on the same Wi-Fi network or scan the QR code.

---

## How to Contribute

### Reporting Bugs

Open a [GitHub Issue](https://github.com/AstroAirafar/clipsync/issues) and include:

- Steps to reproduce the bug
- Expected behavior vs. actual behavior
- Browser and operating system
- Console errors or screenshots if applicable

### Suggesting Features

Open a [GitHub Issue](https://github.com/AstroAirafar/clipsync/issues) with the label **Feature Request**. Describe the use case and problem you want to solve, not just the solution.

### Code Contributions

1. Fork the repository
2. Create a branch from `main` with a descriptive name:
   - `feature/websocket-support`
   - `fix/qr-code-not-loading`
   - `docs/api-examples`
3. Make your changes
4. Submit a pull request

---

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server on port 5999 |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server on port 5999 |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript type checking (`tsc --noEmit`) |

### Before Submitting

Always run both checks before opening a pull request:

```bash
pnpm lint
pnpm type-check
```

Both must pass with no errors.

---

## Code Style

### TypeScript

- **Strict mode** is enabled -- all code must pass strict type checking
- Use explicit types for function parameters and return values where they improve clarity
- Prefer `interface` for object shapes and `type` for unions and aliases

### React

- **Functional components only** -- no class components
- Use the `"use client"` directive for components that use browser APIs, state, or effects
- One component per file, named with PascalCase (e.g., `ClipCard.tsx`)

### Styling

- **Tailwind CSS** for all styling -- no inline styles, no CSS modules, no styled-components
- Follow the existing color scheme defined in `tailwind.config.ts`:
  - Background: `bg` (#050f0a)
  - Cards: `card` (#0a1f14)
  - Primary accent: `primary` (#4ade80)
  - Secondary accent: `secondary` (#22d3ee)
- Custom animations are defined in `tailwind.config.ts` under `extend.animation`

### Imports

- Use the `@/` path alias for imports from the project root (e.g., `@/lib/types`)
- Group imports: external packages first, then internal modules

---

## Project Conventions

### File Organization

| Directory | Purpose |
|-----------|---------|
| `app/api/` | Next.js API route handlers |
| `app/` | Pages and layouts (App Router) |
| `components/` | React UI components (one per file) |
| `lib/` | Shared utilities, types, and data store |
| `docs/` | Project documentation |

### Key Files

- **`lib/types.ts`** -- All shared TypeScript interfaces and type aliases
- **`lib/store.ts`** -- In-memory data store (clips and devices)
- **`lib/network.ts`** -- Server IP and network interface detection
- **`components/Icons.tsx`** -- All SVG icons as React components

### API Routes

- API routes use Next.js Route Handlers in the `app/api/` directory
- Each route exports named functions for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Use `NextRequest` and `NextResponse` from `next/server`

### Data Storage

- All data is stored in-memory (no database)
- Clips are stored in an array with a maximum of 50 items (FIFO eviction)
- Devices are tracked in a record with 60-second inactivity timeout
- Do not introduce database dependencies without prior discussion

---

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make focused changes** -- one feature or fix per PR
3. **Run checks** -- `pnpm lint` and `pnpm type-check` must both pass
4. **Test manually** on at least two devices or browsers
5. **Write a clear PR description** explaining what changed and why
6. **Update documentation** if your changes affect behavior or the API
7. **Do not commit** `node_modules/`, `.next/`, `.env` files, or build artifacts

### PR Guidelines

- Keep PRs small and focused -- large PRs are harder to review
- Respect the existing design language and color scheme
- If adding a new dependency, explain why it is needed
- Breaking changes require discussion in an issue first

---

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We are committed to providing a welcoming and harassment-free experience for everyone. Treat others as you would like to be treated.

---

## Questions?

If you have questions or need help, open a [GitHub Issue](https://github.com/AstroAirafar/clipsync/issues) or start a [Discussion](https://github.com/AstroAirafar/clipsync/discussions).

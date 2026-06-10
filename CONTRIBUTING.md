# Contributing to Habit Pulse

Thank you for your interest in contributing! This guide covers how to get set up, run tests, and submit changes.

## Getting Started

1. Fork the repository and clone your fork.
2. Follow the **Development Setup** steps in [README.md](README.md).
3. Create a branch for your change: `git checkout -b feat/my-feature` or `fix/bug-description`.

## Running Tests

### Backend (xUnit)

```bash
# Requires Docker (no local .NET SDK needed)
docker run --rm -v "$(pwd):/src" -w /src mcr.microsoft.com/dotnet/sdk:9.0 dotnet test
```

All 51 tests should pass. The suite uses an InMemory database — Postgres-specific behavior is noted in test comments.

### Frontend (ESLint + TypeScript)

```bash
cd frontend
npm ci
npm run lint      # ESLint — must pass with 0 errors
npm run build     # TypeScript compile + Vite build — must succeed
```

## Code Style

### Backend (C#)

- Follow the existing Minimal API pattern: endpoints in `Endpoints/`, business logic in `Services/`.
- Use `Results.BadRequest`, `Results.NotFound`, etc. consistently.
- Add input validation in the endpoint handler before calling the service.
- New migrations: make them safe (nullable columns or defaults; no DROP TABLE).

### Frontend (TypeScript / React)

- Functional components with hooks only.
- State in Zustand stores; keep components presentational where possible.
- CSS lives in `src/styles/` — use existing CSS variables (`--color-*`, etc.).
- No inline styles for new code unless there is no alternative.

## Branch & PR Conventions

- Branch names: `feat/`, `fix/`, `refactor/`, `docs/`, `test/` prefixes.
- Commit messages use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Keep commits small and focused. One logical change per commit.
- Open a PR against `main`. The CI pipeline must be green before merging.

## Before Submitting a PR

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds in `frontend/`
- [ ] `dotnet test` passes (all tests green)
- [ ] `docker compose build` succeeds (test Docker images build)
- [ ] No secrets, credentials, or `.env` files committed
- [ ] New features include tests where reasonable

## Reporting Issues

Open a GitHub issue with:
- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs. actual behaviour

For security vulnerabilities, see [SECURITY.md](SECURITY.md).

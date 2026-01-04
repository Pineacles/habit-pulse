# Habit Pulse

Personal daily goal tracker PWA. Define recurring goals, set schedules, and track completions.

## Overview

Habit Pulse helps you stay consistent with daily goals by providing a simple interface to define what you want to accomplish and track your progress over time. Goals can be scheduled for specific days (weekdays only, weekends only, custom) and toggled complete with a single tap.

## Features

### MVP (Current Scope)
- **Goal Management** — Create, edit, delete daily goals
- **Flexible Scheduling** — Set goals for specific days (e.g., weekdays, weekends, Mon/Wed/Fri)
- **Time Targets** — Define how many minutes you want to spend on each goal
- **Daily View** — See only today's relevant goals
- **Binary Completion** — Toggle goals done/not done
- **Cross-Device Sync** — Access from desktop or mobile browser
- **PWA Support** — Install on mobile home screen

### Future (Post-MVP)
- Completion history & streaks
- Gamification (badges, achievements)
- Analytics dashboard
- Offline support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | ASP.NET Core 8 (Minimal APIs) |
| Database | PostgreSQL |
| ORM | Entity Framework Core 8 |
| Auth | JWT (username/password) |
| API Docs | OpenAPI 3.0 (Swagger UI) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| PWA | vite-plugin-pwa |

## Project Structure

```
habit-pulse/
├── src/
│   └── HabitPulse.Api/          # ASP.NET Core backend
│       ├── Endpoints/           # API route definitions
│       ├── Models/              # EF Core entities
│       ├── Dtos/                # Request/response objects
│       ├── Services/            # Business logic
│       └── Data/                # DbContext & migrations
│
├── frontend/                    # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── api/
│
├── .github/workflows/           # CI/CD
├── docker-compose.yml           # Local development
└── README.md
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/) (or use Docker)
- [Docker](https://www.docker.com/) (optional, for local DB)

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:YOUR_USERNAME/habit-pulse.git
   cd habit-pulse
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   cd src/HabitPulse.Api
   dotnet ef database update
   ```

4. **Start the backend**
   ```bash
   dotnet run
   ```
   API available at `http://localhost:5000`
   Swagger UI at `http://localhost:5000/swagger`

5. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App available at `http://localhost:5173`

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/goals` | List user's goals |
| POST | `/api/goals` | Create a goal |
| PUT | `/api/goals/{id}` | Update a goal |
| DELETE | `/api/goals/{id}` | Delete a goal |
| POST | `/api/goals/{id}/toggle` | Toggle today's completion |

## Deployment

The application is configured for self-hosted deployment via GitHub Actions. On push to `main`:

1. Backend builds and deploys to server via SSH
2. Frontend builds and syncs static files to Nginx
3. Services restart automatically

## Data Model

```
Users (1) ──→ (N) Goals (1) ──→ (N) Completions
```

- **Users** — Authentication credentials
- **Goals** — Name, target minutes, schedule (which days), sort order
- **Completions** — Records of goal completion per date

---

Built for personal productivity.

# Habit Pulse

A modern, self-hosted habit tracking application to help build consistent daily routines.

![.NET](https://img.shields.io/badge/.NET-9.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
[![CI](https://github.com/Pineapplelles/habit-pulse/actions/workflows/ci.yml/badge.svg)](https://github.com/Pineapplelles/habit-pulse/actions/workflows/ci.yml)

## Features

- **Simple & Measurable Goals** — Create simple checkbox habits or measurable goals with targets
- **Flexible Scheduling** — Set goals for specific days (weekdays, weekends, custom patterns) or on a fixed interval (every N days)
- **Events Calendar** — Track one-off events alongside your recurring habits
- **Beautiful UI** — Glassmorphism design with animated backgrounds and smooth transitions
- **Dark/Light Theme** — Automatic theme detection with manual toggle
- **Drag & Drop Reordering** — Organize your goals in your preferred order
- **Mobile Responsive** — Works seamlessly on desktop, tablet, and mobile
- **Self-Hosted** — Full control over your data
- **Auto-Deploy** — GitHub Actions CI/CD pipeline

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| ASP.NET Core | 9.0 | Minimal API framework |
| Entity Framework Core | 9.0 | ORM & migrations |
| PostgreSQL | 16 | Database |
| JWT Bearer | 9.0 | Authentication |
| BCrypt.Net | 4.0 | Password hashing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 6.4+ | Build tool |
| Zustand | 5.0 | State management |
| React Router | 7.1 | Routing |
| Framer Motion | 11.15 | Animations |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker & Docker Compose | Containerization |
| Nginx | Reverse proxy & static serving |
| GitHub Actions | CI/CD auto-deploy |
| Cloudflare Tunnel | Secure access |

## Project Structure

```
habit-pulse/
├── src/
│   └── HabitPulse.Api/           # ASP.NET Core backend
│       ├── Data/                 # DbContext configuration
│       ├── Dtos/                 # Request/Response DTOs
│       ├── Endpoints/            # Minimal API endpoints
│       ├── Migrations/           # EF Core migrations
│       ├── Models/               # Entity models
│       └── Services/             # Business logic
│
├── frontend/                     # React + Vite frontend
│   └── src/
│       ├── api/                  # API client
│       ├── components/           # UI components
│       ├── pages/                # Route pages
│       ├── stores/               # Zustand stores
│       └── types/                # TypeScript types
│
├── tests/                        # xUnit integration tests
├── .github/workflows/            # CI/CD pipeline
├── docker-compose.yml            # Production deployment
└── docker-compose.dev.yml        # Local development
```

## Running Locally

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/Pineapplelles/habit-pulse.git
cd habit-pulse

# Create environment file
cp .env.example .env
# Edit .env with your values

# Start all services
docker compose up -d --build

# Access the app
# Frontend: http://localhost:4080
# API: http://localhost:5100
```

### Development Setup

```bash
# Start database only
docker compose -f docker-compose.dev.yml up -d

# Backend (terminal 1)
cd src/HabitPulse.Api
cp appsettings.Development.json.example appsettings.Development.json
# Edit appsettings.Development.json with your dev DB credentials and JWT key
dotnet run

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full production setup and secrets guidance.

## Testing

```bash
# Backend tests (51 tests)
docker run --rm -v "$(pwd):/src" -w /src mcr.microsoft.com/dotnet/sdk:9.0 dotnet test

# Frontend lint + build
cd frontend && npm run lint && npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributor guidelines.

## API Endpoints

All goal and event endpoints require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user (auth required) |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/goals?todayOnly=true` | Get goals (today's schedule by default) |
| `GET` | `/api/goals/{id}` | Get a specific goal |
| `POST` | `/api/goals` | Create goal |
| `PUT` | `/api/goals/{id}` | Update goal |
| `DELETE` | `/api/goals/{id}` | Delete goal |
| `POST` | `/api/goals/{id}/toggle` | Toggle today's completion |
| `POST` | `/api/goals/reorder` | Reorder goals (array of IDs) |
| `GET` | `/api/goals/calendar?startDate=&endDate=` | Daily completion stats |
| `GET` | `/api/goals/calendar/day?date=` | Goal details for a day |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events?date=` | Get events (optional date/range filter) |
| `GET` | `/api/events/{id}` | Get a specific event |
| `POST` | `/api/events` | Create event |
| `PUT` | `/api/events/{id}` | Update event |
| `DELETE` | `/api/events/{id}` | Delete event |
| `GET` | `/api/events/calendar?startDate=&endDate=` | Event counts per day |
| `GET` | `/api/events/calendar/day?date=` | All events for a day |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (no auth) |

## Data Model

```
Users (1) ──→ (N) Goals (1) ──→ (N) Completions
Users (1) ──→ (N) Events
```

- **Users** — Authentication & profile
- **Goals** — Name, target, schedule (weekday-based or interval), sort order
- **Completions** — Daily completion records linked to goals
- **Events** — One-off calendar events with optional time

## Screenshots

<!-- Add screenshots here. Example:
![Dashboard](docs/screenshots/dashboard.png)
![Calendar](docs/screenshots/calendar.png)
-->

*Screenshots coming soon. To add: place PNG files under `docs/screenshots/` and update this section.*

## Roadmap

- [x] Goal CRUD with flexible scheduling
- [x] Daily completion tracking
- [x] Calendar heatmap view
- [x] Events calendar
- [x] Drag & drop goal reordering
- [x] Dark/light theme
- [x] Docker compose production setup
- [ ] Completion streaks & analytics
- [ ] Weekly/monthly summary view
- [ ] Goal categories & tags
- [ ] PWA & offline support
- [ ] Data export (CSV/JSON)

---

*Personal project for productivity tracking. See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute.*

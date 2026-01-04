# 🎯 Habit Pulse

A modern, self-hosted habit tracking application to help build consistent daily routines.

![.NET](https://img.shields.io/badge/.NET-9.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

> ⚠️ **Work in Progress** — This project is actively being developed with new features added regularly.

## ✨ Features

- **Simple & Measurable Goals** — Create simple checkbox habits or measurable goals with targets
- **Flexible Scheduling** — Set goals for specific days (weekdays, weekends, custom patterns)
- **Beautiful UI** — Glassmorphism design with animated backgrounds and smooth transitions
- **Dark/Light Theme** — Automatic theme detection with manual toggle
- **Drag & Drop Reordering** — Organize your goals in your preferred order
- **Mobile Responsive** — Works seamlessly on desktop, tablet, and mobile
- **Self-Hosted** — Full control over your data
- **Auto-Deploy** — GitHub Actions CI/CD pipeline

## 🛠️ Tech Stack

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
| Vite | 6.0 | Build tool |
| Tailwind CSS | 4.0 | Styling |
| Zustand | 5.0 | State management |
| React Router | 7.1 | Routing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker & Docker Compose | Containerization |
| Nginx | Reverse proxy & static serving |
| GitHub Actions | CI/CD auto-deploy |
| Cloudflare Tunnel | Secure access |

## 📁 Project Structure

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
├── .github/workflows/            # CI/CD pipeline
├── docker-compose.yml            # Production deployment
└── docker-compose.dev.yml        # Local development
```

## 🚀 Running Locally

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
# Edit appsettings.Development.json with your values
dotnet ef database update
dotnet run

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/goals` | Get all goals |
| `GET` | `/api/goals/today` | Get today's goals |
| `POST` | `/api/goals` | Create goal |
| `PUT` | `/api/goals/{id}` | Update goal |
| `DELETE` | `/api/goals/{id}` | Delete goal |
| `POST` | `/api/goals/{id}/toggle` | Toggle completion |
| `PUT` | `/api/goals/reorder` | Reorder goals |

## 📊 Data Model

```
Users (1) ──→ (N) Goals (1) ──→ (N) Completions
```

- **Users** — Authentication & profile
- **Goals** — Name, target, schedule, sort order
- **Completions** — Daily completion records

## 🔮 Roadmap

- [ ] Completion history & streaks
- [ ] Analytics dashboard
- [ ] Weekly/monthly views
- [ ] Goal categories
- [ ] PWA & offline support
- [ ] Export data

---

*Personal project for productivity tracking.*

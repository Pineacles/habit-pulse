# Habit Pulse - Deployment Guide

## Local Development

### Prerequisites
- Docker Desktop
- .NET 9 SDK
- Node.js 20+

### Setup

1. **Start PostgreSQL:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run Backend:**
   ```bash
   cd src/HabitPulse.Api
   dotnet ef database update
   dotnet run
   ```

3. **Run Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Production Deployment

### Server Requirements
- Linux server (Ubuntu 22.04+ recommended)
- Docker & Docker Compose
- Git
- At least 1GB RAM

### Initial Setup

1. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Clone Repository:**
   ```bash
   sudo mkdir -p /opt/habit-pulse
   sudo chown $USER:$USER /opt/habit-pulse
   cd /opt/habit-pulse
   git clone https://github.com/YOUR_USERNAME/habit-pulse.git .
   ```

3. **Create Environment File:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Set secure values:
   ```
   DB_PASSWORD=your_secure_password_32_chars
   JWT_KEY=your_secure_jwt_key_32_chars_min
   FRONTEND_URL=https://yourdomain.com
   API_URL=https://yourdomain.com
   ```

4. **Start Services:**
   ```bash
   docker-compose up -d
   ```

5. **Check Status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Auto-Deploy on Push (GitHub Actions)

1. **Add GitHub Secrets:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `SERVER_HOST`: Your server IP or domain
     - `SERVER_USER`: SSH username (e.g., `ubuntu`)
     - `SERVER_SSH_KEY`: Your private SSH key

2. **Setup SSH Key on Server:**
   ```bash
   # On your local machine, generate a deploy key
   ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy
   
   # Copy public key to server
   ssh-copy-id -i ~/.ssh/github-deploy.pub user@your-server
   
   # Add private key content to GitHub SECRET: SERVER_SSH_KEY
   cat ~/.ssh/github-deploy
   ```

3. **Push to Main:**
   ```bash
   git push origin main
   ```
   
   The server will automatically pull and rebuild.

---

## Database Migrations

### Creating Migrations (Development)

When you change models:

```bash
cd src/HabitPulse.Api

# Create a descriptive migration
dotnet ef migrations add AddNewFeatureName

# Review the migration in /Migrations folder
# Ensure it uses ALTER TABLE, not DROP TABLE

# Apply locally
dotnet ef database update
```

### Production Migrations

Migrations auto-apply on startup. The API runs `db.Database.Migrate()` when it starts.

**Safe Migration Practices:**

| Change | Migration Result | Safe? |
|--------|-----------------|-------|
| Add nullable column | `ALTER TABLE ADD COLUMN` | ✅ |
| Add column with default | `ALTER TABLE ADD COLUMN DEFAULT` | ✅ |
| Rename column | Requires manual edit | ⚠️ |
| Change column type | Requires data migration | ⚠️ |
| Remove column | `ALTER TABLE DROP COLUMN` | ✅ |
| Drop table | `DROP TABLE` | ❌ |

**To add a new field safely:**

```csharp
// 1. Make it nullable OR provide default
public string? NewField { get; set; }

// OR
public bool NewField { get; set; } = false;
```

---

## SSL/HTTPS Setup (Optional)

For production with HTTPS, add Traefik or use nginx-proxy:

```bash
# Using Caddy (easiest)
sudo apt install caddy

# Edit /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy localhost:80
}

sudo systemctl restart caddy
```

---

## Troubleshooting

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Without Cache
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Access
```bash
docker-compose exec db psql -U postgres -d habitpulse
```

### Reset Database (CAUTION)
```bash
docker-compose down -v  # This deletes all data!
docker-compose up -d
```

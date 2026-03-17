# Docker Commands Quick Reference

Quick reference guide for all Docker-related npm scripts.

## 🚀 Development Mode

### Start Services
```bash
# Start in detached mode (background)
npm run docker:dev

# Start with build (rebuild images)
npm run docker:dev:build

# Start in foreground (see logs)
npm run docker:dev:up
```

### View Logs
```bash
# All services
npm run docker:dev:logs

# Specific service
npm run docker:dev:logs:server
npm run docker:dev:logs:client
npm run docker:dev:logs:mongodb
```

### Manage Services
```bash
# Stop services (keeps containers)
npm run docker:dev:stop

# Restart services
npm run docker:dev:restart

# Stop and remove containers
npm run docker:dev:down

# Stop, remove containers and volumes (clean slate)
npm run docker:dev:clean

# Full rebuild (clean + rebuild + start)
npm run docker:dev:rebuild
```

### Debug & Inspect
```bash
# View running containers
npm run docker:dev:ps

# View resource usage
npm run docker:dev:stats

# Access shell in containers
npm run docker:dev:shell:server
npm run docker:dev:shell:client
npm run docker:dev:shell:mongodb
```

## 🏭 Production Mode

### Start Services
```bash
# Start in detached mode with build
npm run docker:prod

# Start in foreground (see logs)
npm run docker:prod:up
```

### View Logs
```bash
# All services
npm run docker:prod:logs

# Specific service
npm run docker:prod:logs:server
npm run docker:prod:logs:client
npm run docker:prod:logs:mongodb
```

### Manage Services
```bash
# Stop services (keeps containers)
npm run docker:prod:stop

# Restart services
npm run docker:prod:restart

# Stop and remove containers
npm run docker:prod:down

# Stop, remove containers and volumes
npm run docker:prod:clean

# Full rebuild (clean + rebuild + start)
npm run docker:prod:rebuild
```

### Inspect
```bash
# View running containers
npm run docker:prod:ps
```

## 🧹 Cleanup

```bash
# Clean all (dev + prod)
npm run docker:clean:all
```

## 📋 Common Workflows

### First Time Setup
```bash
# 1. Create .env file from .env.example
cp .env.example .env

# 2. Edit .env with your configuration

# 3. Start development environment
npm run docker:dev:build
```

### Daily Development
```bash
# Start services
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop when done
npm run docker:dev:down
```

### After Code Changes
```bash
# If you changed dependencies, rebuild
npm run docker:dev:rebuild

# If just code changes, restart is enough
npm run docker:dev:restart
```

### Deploy to Production
```bash
# Build and start production
npm run docker:prod

# Monitor logs
npm run docker:prod:logs
```

## 🔍 Troubleshooting

### Services won't start
```bash
# Check logs
npm run docker:dev:logs

# Clean and rebuild
npm run docker:dev:rebuild
```

### Port conflicts
```bash
# Check what's using the port
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Change port in .env file
SERVER_PORT=3001
```

### Database connection issues
```bash
# Check MongoDB logs
npm run docker:dev:logs:mongodb

# Access MongoDB shell
npm run docker:dev:shell:mongodb
```

### View container status
```bash
npm run docker:dev:ps
```

## 📝 Notes

- **Development mode**: Uses bind mounts for hot reload
- **Production mode**: Uses built images, no hot reload
- **Volumes**: Data persists between container restarts
- **Networks**: Services communicate via Docker network
- **Environment**: Variables loaded from `.env` file


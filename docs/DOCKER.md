# Docker Setup Guide

This project includes a comprehensive Docker setup with development and production configurations.

## 🏗️ Architecture

- **Client**: React + Vite frontend (port 5173 in dev, 80 in prod)
- **Server**: Node.js + Express backend (port 3000)
- **Database**: MongoDB (port 27017)

## 📁 Docker Files

- `docker-compose.yml` - Development configuration with hot reload
- `docker-compose.prod.yml` - Production configuration
- `Client/Dockerfile` - Multi-stage Dockerfile for frontend
- `Server/Dockerfile` - Multi-stage Dockerfile for backend
- `.dockerignore` - Files to exclude from Docker builds

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- `.env` file with required environment variables (see `.env.example`)

### Development Mode

1. **Create `.env` file** from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Update environment variables** in `.env`:
   - Set MongoDB credentials
   - Configure Auth0 credentials
   - Set API URLs

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f server
   docker-compose logs -f client
   docker-compose logs -f mongodb
   ```

5. **Access services**:
   - Client: http://localhost:5173 (API requests are proxied automatically)
   - Server: http://localhost:3000 (direct access, or via proxy from client)
   - MongoDB: localhost:27017

### Production Mode

1. **Build and start production containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **Access services**:
   - Client: http://localhost:80 (or configured port)
   - Server: http://localhost:3000

## 🔄 Reverse Proxy (Vite)

The frontend uses **Vite's built-in reverse proxy** to forward API requests to the backend:

- All `/api/*` requests are automatically proxied to the backend server
- No CORS issues in development
- Simplified API configuration (use relative URLs)

### How it works:

1. Frontend makes requests to `/api/*` (relative URLs)
2. Vite dev server intercepts these requests
3. Requests are forwarded to the backend server (via Docker network or localhost)
4. Responses are returned to the frontend seamlessly

### Configuration:

- **In Docker**: Proxy target is `http://server:3000` (uses Docker service name)
- **Locally**: Proxy target is `http://localhost:3000`
- **Custom**: Set `VITE_PROXY_TARGET` environment variable

The API service (`Client/src/services/api.ts`) automatically uses relative URLs in development to leverage the proxy, and full URLs in production.

## 🔥 Hot Reload (Development)

The development setup uses **bind mounts** to enable hot reload:

- **Client**: Changes to `Client/src/` are immediately reflected
- **Server**: Changes to `Server/src/` trigger automatic TypeScript recompilation

### How it works:

1. Source code is mounted as bind volumes
2. `node_modules` are stored in named volumes (better performance)
3. Vite uses polling for file watching in Docker
4. Server uses `tsx --watch` for hot reload

## 📦 Volumes

### Named Volumes (Persistent Data)

- `mongodb_data` - MongoDB database files (dev)
- `mongodb_data_prod` - MongoDB database files (prod)
- `server_node_modules` - Server dependencies (dev)
- `client_node_modules` - Client dependencies (dev)

### Bind Mounts (Development Only)

- Source code directories for hot reload
- Configuration files

## 🌐 Networks

- `mern-network` - Development network (bridge driver)
- `mern-network-prod` - Production network (bridge driver)

Services communicate through these isolated networks.

## 🛠️ Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose build --no-cache
docker-compose up -d
```

### View running containers
```bash
docker-compose ps
```

### Execute commands in containers
```bash
# Server shell
docker-compose exec server sh

# Client shell
docker-compose exec client sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password
```

### View resource usage
```bash
docker stats
```

## 🔍 Health Checks

All services include health checks:

- **MongoDB**: Checks database connectivity
- **Server**: Checks `/health` endpoint
- **Client**: Nginx health endpoint

View health status:
```bash
docker-compose ps
```

## 🔒 Security Best Practices

### Development
- MongoDB exposed on localhost (for development tools)
- Source code bind mounted (for hot reload)

### Production
- MongoDB not exposed externally (internal network only)
- Non-root user in server container
- Resource limits configured
- Security headers in Nginx
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Port already in use
```bash
# Change ports in .env file or docker-compose.yml
SERVER_PORT=3001
CLIENT_PORT=5174
```

### Container won't start
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild without cache
docker-compose build --no-cache
```

### Hot reload not working
- Ensure bind mounts are correctly configured
- Check file permissions
- Verify Vite polling is enabled (already configured)

### MongoDB connection issues
- Verify `MONGO_URI` in `.env`
- Check MongoDB container is healthy: `docker-compose ps`
- Wait for MongoDB to fully start (health check)

### Node modules issues
```bash
# Remove node_modules volumes and rebuild
docker-compose down -v
docker-compose up -d --build
```

## 📝 Environment Variables

### Development Variables

- `MONGO_ROOT_USERNAME` - MongoDB root username
- `MONGO_ROOT_PASSWORD` - MongoDB root password
- `MONGO_DATABASE` - MongoDB database name
- `MONGO_PORT` - MongoDB exposed port (default: 27017)
- `SERVER_PORT` - Backend server port (default: 3000)
- `CLIENT_PORT` - Frontend dev server port (default: 5173)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `VITE_API_URL` - API URL (optional in dev, uses proxy if empty)
- `VITE_PROXY_TARGET` - Custom proxy target (default: auto-detected)
- `VITE_AUTH0_DOMAIN` - Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience
- `AUTH0_DOMAIN` - Auth0 domain (server)
- `AUTH0_AUDIENCE` - Auth0 API audience (server)
- `AUTH0_CLIENT_ID` - Auth0 client ID (server)
- `AUTH0_CLIENT_SECRET` - Auth0 client secret (server)

**Note**: In development, `VITE_API_URL` can be left empty to use the reverse proxy. The proxy will automatically forward `/api/*` requests to the backend.

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use `docker-compose.prod.yml`
3. Configure proper domain names in `CLIENT_URL`
4. Use secrets management for sensitive data
5. Enable HTTPS (use reverse proxy like Traefik or Nginx)
6. Set up proper backup strategy for MongoDB volumes

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)


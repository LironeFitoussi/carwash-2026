# Docker Setup Guide — MERN Stack (TypeScript + Auth0)

A complete reference for recreating this Docker development and production setup in any similar MERN stack application.

---

## Project Structure

```
project-root/
├── docker-compose.yml          # Root: includes Server + Client compose files
├── .dockerignore               # Root-level ignore (optional)
├── scripts/
│   ├── boot.js                 # Bootstrap: copy .env files + install deps
│   ├── build.js                # Parallel build for Server + Client
│   └── check-docker.js         # Docker availability check before dev
├── Server/
│   ├── Dockerfile              # Multi-stage: development / build / production
│   ├── compose.yml             # Server service definition
│   └── .dockerignore
└── Client/
    ├── Dockerfile              # Multi-stage: development / build / production
    ├── compose.yml             # Client service definition
    ├── nginx.conf              # Nginx config for production SPA serving
    └── .dockerignore
```

---

## Root docker-compose.yml

Uses Docker Compose's `include` directive to split service definitions across subdirectories.

```yaml
include:
  - ./Server/compose.yml
  - ./Client/compose.yml
```

**Why:** Keeps each app's Docker config co-located with its source code. Clean separation of concerns.

---

## Server/compose.yml

```yaml
services:
  server:
    build:
      context: .
      target: development        # Uses the "development" stage in the Dockerfile
    container_name: mern-server
    restart: unless-stopped
    env_file: .env               # Loads Server/.env
    ports:
      - "3000:3000"
    volumes:
      - server_node_modules:/app/node_modules   # Named volume keeps node_modules inside container
    networks:
      - mern-network
    develop:
      watch:                     # Docker Watch: live sync/rebuild on file changes
        - action: sync           # Sync src/ changes instantly (no rebuild)
          path: ./src
          target: /app/src
          ignore:
            - node_modules/
        - action: rebuild        # Rebuild image if package.json changes
          path: package.json
        - action: rebuild
          path: package-lock.json

volumes:
  server_node_modules:           # Persists node_modules across restarts

networks:
  mern-network:
    driver: bridge
```

---

## Client/compose.yml

```yaml
services:
  client:
    build:
      context: .
      target: development
    container_name: mern-client
    restart: unless-stopped
    env_file: .env               # Loads Client/.env
    ports:
      - "5173:5173"
    volumes:
      - client_node_modules:/app/node_modules
    networks:
      - mern-network
    depends_on:
      - server                   # Client waits for server to start
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
          ignore:
            - node_modules/
        - action: sync
          path: ./public         # Also sync public/ assets
          target: /app/public
        - action: rebuild
          path: package.json
        - action: rebuild
          path: package-lock.json

volumes:
  client_node_modules:
```

**Note:** `mern-network` is defined in `Server/compose.yml` and shared here because Docker Compose merges networks across included files.

---

## Server/Dockerfile

Multi-stage build with 3 targets:

```dockerfile
# ─── Stage 1: Development ───────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# tsx enables hot reload for TypeScript without pre-compiling
RUN npm install -g tsx

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]       # Runs: tsx --watch src/server.ts


# ─── Stage 2: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci                      # Includes devDependencies (needed for tsc)

COPY . .
RUN npm run build               # tsc -b && tsc-alias → outputs to /dist


# ─── Stage 3: Production ────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production    # Only runtime deps

COPY --from=build /app/dist ./dist   # Copy compiled output from build stage

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Health check hits GET /health — make sure your Express app has this route
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["npm", "start"]            # node dist/server.js
```

---

## Client/Dockerfile

```dockerfile
# ─── Stage 1: Development ───────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
# --host 0.0.0.0 exposes Vite dev server outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ─── Stage 2: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build               # tsc -b && vite build → outputs to /dist


# ─── Stage 3: Production ────────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf   # Custom nginx config (SPA routing)

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Client/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression for text assets
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing — all paths fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Aggressive caching for static assets (hashed filenames)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Simple health check endpoint for container orchestration
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

## .dockerignore Files

### Root `.dockerignore`
```
node_modules
.git
.gitignore
.env
.env.local
.env.*.local
npm-debug.log*
dist
.vscode
.idea
coverage
Client/node_modules
Server/node_modules
Client/dist
Server/dist
```

### Server/.dockerignore
```
node_modules
dist
.git
.env
.env.local
*.log
.vscode
coverage
tsconfig.tsbuildinfo
```

### Client/.dockerignore
```
node_modules
dist
.git
.env
.env.local
*.log
.vscode
coverage
```

**Key rule:** Always ignore `node_modules` and `dist` — these are generated inside the container.

---

## Root package.json Scripts

```json
{
  "scripts": {
    "boot":         "node scripts/boot.js",
    "dev":          "node scripts/check-docker.js && docker compose watch",
    "dev:detached": "node scripts/check-docker.js && docker compose up -d --build",
    "stop":         "docker compose down",
    "logs":         "docker compose logs -f",
    "reset":        "docker compose down -v",
    "build":        "node scripts/build.js",
    "install:all":  "npm install --prefix Server && npm install --prefix Client"
  }
}
```

| Command | What it does |
|---|---|
| `npm run boot` | First-time setup: copy `.env.example` files + install all deps |
| `npm run dev` | Check Docker is running, then start with live watch |
| `npm run dev:detached` | Same but runs containers in background |
| `npm run stop` | Stop all containers |
| `npm run logs` | Tail logs from all containers |
| `npm run reset` | Stop containers AND delete volumes (full reset) |

---

## Helper Scripts

### scripts/check-docker.js
Runs before `docker compose watch`. Checks:
1. Internet connectivity (DNS lookup)
2. Docker CLI is installed
3. Docker daemon is running
4. Auto-launches Docker Desktop if not running (Windows, macOS, Linux)
5. Waits up to 60 seconds for Docker to become available
6. Provides clear error messages with fix instructions

### scripts/boot.js
First-time project setup:
1. Copies `Server/.env.example` → `Server/.env`
2. Copies `Client/.env.example` → `Client/.env`
3. Runs `npm install` in Server and Client **in parallel**

### scripts/build.js
CI/pre-deploy build:
- Runs `npm run build` in Server and Client in parallel
- Reports success/failure for each

---

## How Docker Watch Works

`docker compose watch` (requires Docker Desktop 4.24+ / Docker Engine 23+) replaces the old volume-mount hot-reload pattern:

| Action | Trigger | Effect |
|---|---|---|
| `sync` | `src/` file change | Copies file into running container instantly — no restart |
| `rebuild` | `package.json` change | Rebuilds the Docker image and recreates the container |

**Named volumes for `node_modules`:**
Both services mount `node_modules` as a named Docker volume (not a bind mount). This means:
- `node_modules` lives inside the container
- Host `node_modules` is ignored
- No Windows/macOS filesystem performance issues
- No accidental overwrite from the host

---

## Network Architecture

```
[Host]
  :3000 ──────► mern-server (Express API)
  :5173 ──────► mern-client (Vite dev server)

[Inside Docker — mern-network bridge]
  mern-client ──► mern-server (by service name)
```

In development, the client proxies API calls to `http://server:3000` (Docker DNS resolves `server` to the container). Configure this in `Client/vite.config.ts`:

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://server:3000',
    },
  },
})
```

---

## MongoDB

MongoDB is **not** in this Docker setup — it runs as a cloud service (MongoDB Atlas). The `MONGODB_URI` in `Server/.env` points to Atlas.

To add a local MongoDB container, add to `Server/compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mern-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - mern-network

volumes:
  mongo_data:
```

Then set `MONGODB_URI=mongodb://mongo:27017/yourdb` in `Server/.env`.

---

## Recreating This Setup — Checklist

- [ ] Create `Server/Dockerfile` with 3 stages: `development`, `build`, `production`
- [ ] Create `Client/Dockerfile` with 3 stages: `development`, `build`, `production`
- [ ] Create `Client/nginx.conf` with SPA fallback (`try_files $uri $uri/ /index.html`)
- [ ] Create `Server/compose.yml` with named volume for `node_modules`, Docker Watch config
- [ ] Create `Client/compose.yml` with `depends_on: server`, named volume, Docker Watch config
- [ ] Create root `docker-compose.yml` using `include:` to reference both compose files
- [ ] Create `.dockerignore` in Server/ and Client/ (exclude `node_modules`, `dist`, `.env`)
- [ ] Add root `package.json` scripts: `dev`, `stop`, `logs`, `reset`, `boot`
- [ ] Create `scripts/check-docker.js` to gate `npm run dev`
- [ ] Create `scripts/boot.js` for first-time `.env` copy + parallel install
- [ ] Add `EXPOSE 3000` in Server dev stage, `EXPOSE 5173` in Client dev stage
- [ ] Vite dev command must include `--host 0.0.0.0` to be reachable from host
- [ ] Add `/health` route to Express for the production health check
- [ ] Add non-root user (`nodejs`) in Server production stage
- [ ] Client `.env` and Server `.env` are separate files — both have `.env.example` committed

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Named volumes for `node_modules` | Avoids host/container OS mismatch, faster on Windows/macOS |
| `docker compose watch` instead of bind mounts | More explicit and reliable than volume-based HMR |
| `include:` in root compose | Keeps each service's config with its own source code |
| `node:20-alpine` base | Small image, fast builds |
| `nginx:alpine` for client production | Minimal, production-grade static file server |
| `npm ci` instead of `npm install` | Reproducible installs from lockfile |
| Separate `.env` per service | Server and Client have different env vars (Auth0 audience, Vite prefixes) |

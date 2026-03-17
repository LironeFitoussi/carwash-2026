# Testing Docker Setup

Quick guide to test your Docker setup.

## 🧪 Quick Test

### 1. Verify Docker is Running
```bash
docker --version
docker-compose --version
```

### 2. Check Environment File
Make sure you have a `.env` file at the project root:
```bash
# If not, create it
cp .env.example .env
```

Edit `.env` and set at minimum:
- `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD`
- Auth0 credentials (if testing auth)

### 3. Start Development Environment
```bash
npm run docker:dev:build
```

This will:
- Build Docker images for client, server, and mongodb
- Start all services
- Set up Docker network and volumes

### 4. Check Container Status
```bash
npm run docker:dev:ps
```

You should see:
- `mern-mongodb` - Running
- `mern-server` - Running
- `mern-client` - Running

### 5. View Logs
```bash
# All services
npm run docker:dev:logs

# Or specific service
npm run docker:dev:logs:server
npm run docker:dev:logs:client
npm run docker:dev:logs:mongodb
```

### 6. Test Endpoints

#### Health Check
```bash
# Server health
curl http://localhost:3000/health

# Should return: {"success":true,"message":"Server is healthy"}
```

#### Client (Browser)
Open http://localhost:5173 in your browser

#### API via Proxy (from client)
The frontend automatically proxies `/api/*` requests to the backend.

### 7. Test Hot Reload

#### Test Server Hot Reload
1. Edit `Server/src/server.ts`
2. Add a console.log or change a message
3. Check logs: `npm run docker:dev:logs:server`
4. Changes should reflect immediately

#### Test Client Hot Reload
1. Edit `Client/src/pages/HomePage.tsx`
2. Change some text
3. Save the file
4. Browser should auto-refresh with changes

### 8. Test Database Connection

Access MongoDB shell:
```bash
npm run docker:dev:shell:mongodb
```

Then in MongoDB shell:
```javascript
use mern_db
db.users.find()
exit
```

### 9. Clean Up
```bash
# Stop services
npm run docker:dev:down

# Stop and remove volumes (clean slate)
npm run docker:dev:clean
```

## ✅ Success Indicators

- ✅ All containers show "Up" status
- ✅ Server health check returns success
- ✅ Client loads at http://localhost:5173
- ✅ No errors in logs
- ✅ Hot reload works (code changes reflect)

## 🐛 Common Issues

### Port Already in Use
```bash
# Check what's using the port
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Change port in .env
SERVER_PORT=3001
```

### Containers Won't Start
```bash
# Check logs
npm run docker:dev:logs

# Rebuild from scratch
npm run docker:dev:rebuild
```

### MongoDB Connection Failed
```bash
# Check MongoDB is running
npm run docker:dev:ps

# Check MongoDB logs
npm run docker:dev:logs:mongodb

# Verify MONGO_URI in .env matches docker-compose settings
```

### Hot Reload Not Working
- Ensure bind mounts are correct (already configured)
- Check file permissions
- Verify volumes are mounted: `docker-compose ps`

## 🚀 Next Steps

Once everything is working:
1. Configure Auth0 credentials in `.env`
2. Test authentication flow
3. Start building your features!

For more details, see:
- [DOCKER.md](./DOCKER.md) - Full Docker documentation
- [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) - All available commands (legacy - see main README for current commands)


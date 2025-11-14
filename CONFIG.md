# Environment & Configuration Guide

## System Requirements

- **Node.js**: 16.x or higher (recommends 18.x+)
- **pnpm**: 8.x or higher (or use npm instead)
- **RAM**: 512MB minimum for development
- **Disk**: 500MB for node_modules

## Ports Used

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Next.js Frontend | 3000 | HTTP | React app UI |
| WebSocket Server | 3001 | WS/WSS | Real-time sync |

## Installation Steps

### 1. Prerequisites

Check if Node.js is installed:
```bash
node --version
# v18.0.0 or higher

npm --version
# 9.0.0 or higher
```

Install pnpm (optional but recommended):
```bash
npm install -g pnpm@latest
pnpm --version
# 8.0.0 or higher
```

### 2. Install Project Dependencies

```bash
cd e:\Editor\er-pick-ban
pnpm install
# Or if using npm:
# npm install
```

This installs:
- ✅ `express` - HTTP server framework
- ✅ `ws` - WebSocket library
- ✅ `next` - React framework
- ✅ `react` & `react-dom` - UI library
- ✅ `typescript` - Type safety
- ✅ `tailwindcss` - CSS styling
- ✅ `concurrently` - Run multiple commands

### 3. Verify Installation

```bash
# Check Node modules installed
ls node_modules

# Verify main packages
pnpm list express ws next react
```

## Running the Application

### Development Mode (Recommended)

```bash
pnpm dev
```

This command:
- Starts WebSocket server on port 3001 (from `server.js`)
- Starts Next.js frontend on port 3000
- Both run concurrently in one terminal

**Expected output:**
```
> er-pick-ban@0.1.0 dev
> concurrently "next dev" "node server.js"

🚀 Pick/Ban Server running on ws://localhost:3001
Health check: http://localhost:3001/health
Active rooms: http://localhost:3001/api/rooms

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info using webpack 5.x
```

### Individual Services (if needed)

**Run only frontend:**
```bash
next dev
# Runs on port 3000 only
```

**Run only server:**
```bash
node server.js
# Runs on port 3001 only
```

### Production Build

```bash
# Build frontend
pnpm build

# Run production version
NODE_ENV=production pnpm start &
NODE_ENV=production node server.js
```

## Configuration

### WebSocket URL Configuration

The WebSocket URL is auto-detected in `lib/websocket.ts`:

```typescript
// Auto-detection:
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : '';
this.url = `${protocol}://${host}${port}/ws`;
```

**Examples:**
- Local: `ws://localhost:3001/ws`
- Production: `wss://yourdomain.com/ws`

### Environment Variables

Create `.env.local` for local development:

```bash
# Frontend
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Backend (in server.js)
PORT=3001
NODE_ENV=development
```

### Server Configuration

Edit `server.js` for custom settings:

```javascript
// Change port
const PORT = process.env.PORT || 3001;

// Change room cleanup timeout (5 minutes)
setTimeout(() => { ... }, 300000);

// Change health check endpoint
app.get('/health', (req, res) => { ... });
```

## Troubleshooting

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Failed

**Error:** `WebSocket is not connected`

**Check list:**
1. Is `pnpm dev` running?
2. Is server listening on 3001?
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

3. Check browser console (F12) for errors
4. Verify firewall isn't blocking port 3001

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### CORS Issues

**Error:** `CORS policy: Cross-Origin Request Blocked`

**Solution:** WebSocket doesn't use CORS, but if you see this:
1. Check browser console for full error
2. Ensure WebSocket URL matches window location
3. Verify server is running on port 3001

## Performance Optimization

### Frontend Optimization

```javascript
// Next.js Build Output
pnpm build

// Expected sizes:
// ✓ Linting and type checking
// ○ Creating an optimized production build
// ✓ Compiled 10 files
```

### Server Optimization

```bash
# Monitor server resources
node --max-old-space-size=1024 server.js
# Allocates 1GB RAM to Node.js
```

## Deployment Checklist

- [ ] Node.js 18+ installed on server
- [ ] Ports 3000 & 3001 accessible
- [ ] Firewall allows WebSocket connections
- [ ] SSL certificate for HTTPS/WSS
- [ ] Environment variables set
- [ ] Database configured (if needed)
- [ ] Logging configured
- [ ] Monitoring set up

## Deployment Platforms

### Heroku
```bash
git push heroku main
heroku logs --tail
```

### Railway
```bash
# Automatic deployment from Git
```

### Digital Ocean / AWS
```bash
# Manual deployment
scp -r ./* user@server:/app/er-pick-ban
ssh user@server "cd /app/er-pick-ban && pnpm install && pnpm build"
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000 3001
CMD ["pnpm", "dev"]
```

Build and run:
```bash
docker build -t er-pick-ban .
docker run -p 3000:3000 -p 3001:3001 er-pick-ban
```

## Debugging

### Enable Debug Logging

Add to `lib/websocket.ts`:
```typescript
private handleMessage(message: WSMessage) {
  console.log('[WebSocket]', message.type, message);
  // ... rest of code
}
```

Add to `server.js`:
```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('[Server]', message.type, message);
  // ... rest of code
});
```

### Browser DevTools

1. Open **Chrome DevTools** (F12)
2. Go to **Network** tab
3. Click **WS** filter to show WebSocket connections
4. Expand connection to see messages

### Network Analysis

```bash
# Monitor WebSocket traffic
node --inspect=9229 server.js

# Then open chrome://inspect
```

## Monitoring

### Check Active Rooms

```bash
curl http://localhost:3001/api/rooms

# Response:
# {
#   "rooms": [
#     {
#       "code": "ABC123",
#       "hasLeft": true,
#       "hasRight": true,
#       "spectators": 2
#     }
#   ]
# }
```

### Server Health

```bash
curl http://localhost:3001/health

# Response:
# {"status":"ok"}
```

## Logs & Monitoring

### Console Logs (Development)
```bash
pnpm dev 2>&1 | tee app.log
```

### Production Logging

```javascript
// server.js - add file logging
const fs = require('fs');
const logFile = fs.createWriteStream('server.log');

ws.on('message', (data) => {
  logFile.write(`[${new Date().toISOString()}] ${data}\n`);
});
```

---

**Status**: ✅ Ready for development or production deployment!

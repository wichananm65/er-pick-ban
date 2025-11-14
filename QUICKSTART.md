# Quick Start Guide - Pick & Ban System

## What Was Fixed

The original app couldn't sync between two different browsers/clients because it was using browser local storage. Now it has a **real-time WebSocket server** that enables true multiplayer communication.

## Installation & Running

### 1. Install Dependencies
```bash
cd e:\Editor\er-pick-ban
pnpm install
```

### 2. Start Everything
```bash
pnpm dev
```

This command runs **both**:
- ✅ Next.js frontend on http://localhost:3000
- ✅ WebSocket server on ws://localhost:3001

### 3. Test the App

**Browser 1 - Create Room:**
1. Open http://localhost:3000
2. Click "สร้างห้อง" (Create Room)
3. Copy the room code (e.g., ABC123)

**Browser 2 - Join Room:**
1. Open http://localhost:3000 in another browser/tab
2. Paste the room code
3. Click "เข้าร่วมห้อง" (Join Room)

✅ **NOW BOTH PLAYERS WILL SEE EACH OTHER IN REAL-TIME!**

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your Browser                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React App (Next.js)                             │   │
│  │  - GameRoom.tsx (game interface)                 │   │
│  │  - Menu.tsx (room selection)                     │   │
│  └──────────────────────────────────────────────────┘   │
│         │                                                 │
│         │ WebSocket Connection (ws://)                    │
│         ↓                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  websocket.ts (Client)                           │   │
│  │  - Handles all socket events                     │   │
│  │  - Auto-reconnect on disconnect                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      │
                      │ Real-time messages
                      ↓
┌─────────────────────────────────────────────────────────┐
│                 Node.js Server                           │
│              (server.js on port 3001)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Express + WebSocket (ws library)                │   │
│  │  - Room Management (in-memory)                   │   │
│  │  - State Synchronization                        │   │
│  │  - Broadcasting to all players                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Key Files

### Frontend
- **app/page.tsx** - Entry point
- **components/GameRoom.tsx** - ⭐ Real-time game interface with WebSocket listeners
- **components/Menu.tsx** - Room creation/joining
- **lib/websocket.ts** - ⭐ WebSocket client (handles all socket communication)
- **lib/storage.ts** - ⭐ API layer using WebSocket instead of browser storage

### Backend
- **server.js** - ⭐ Complete WebSocket server with room management

## How Real-Time Sync Works

### Old Way (Broken)
```
Browser 1 → Local Storage
           ❌ Browser 2 can't see it
Browser 2 → Local Storage (polling every 1 second)
```

### New Way (Fixed!)
```
Browser 1 → WebSocket → Server (room management)
                          ↓
                        All players see it instantly
                          ↓
Browser 2 ← WebSocket ←  Server
```

## Communication Flow Example

**When Player 1 picks a hero:**

1. Player 1 clicks hero in GameRoom
2. `handleHeroClick()` saves to server
3. `saveGameState()` sends WebSocket message
4. Server receives `update-state` message
5. Server updates room state
6. Server broadcasts `state-updated` to ALL players
7. **Both Player 1 and Player 2 get the update instantly** ⚡
8. UI updates in real-time

## Testing Features

### Feature 1: Room Creation & Joining
- [ ] Create room gets unique code
- [ ] Join room with same code works
- [ ] Both players see same state

### Feature 2: Real-Time Updates
- [ ] Player 1 bans hero → Player 2 sees it immediately
- [ ] Player 1 picks hero → Player 2 sees it immediately
- [ ] Phase changes sync instantly

### Feature 3: Spectator Mode
- [ ] Enter room code, click "ดูการแข่งขัน"
- [ ] See game updates in real-time
- [ ] Cannot ban/pick (read-only)

### Feature 4: Reliability
- [ ] Close browser and reconnect
- [ ] Lose internet temporarily
- [ ] Multiple spectators watch same game

## Troubleshooting

### Issue: "Cannot connect to server"
```bash
# Check if server is running
curl http://localhost:3001/health
# Should show: {"status":"ok"}

# If not running, restart
pnpm dev
```

### Issue: Players don't see each other
```bash
# 1. Check room code is EXACTLY the same
# 2. Check browser console for errors (F12)
# 3. Verify both on port 3000 (not different ports)
# 4. Try a new room code
```

### Issue: Game state not syncing
```bash
# Check Active Rooms
curl http://localhost:3001/api/rooms
# Should show your room with both players
```

## Production Deployment

When deploying to production:

1. Update WebSocket URL in `lib/websocket.ts`:
```typescript
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.hostname; // Use production domain
```

2. Deploy server.js to a Node.js host (e.g., Heroku, Railway, etc.)

3. Ensure firewall allows WebSocket connections (port 3001 or your custom port)

4. Use environment variables for configuration:
```bash
NODE_ENV=production PORT=3001 node server.js
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Express.js, WebSocket (ws library)
- **Real-Time**: WebSocket for instant two-way communication
- **Package Manager**: pnpm (fast, efficient)

## Files Created/Modified

### New Files
- ✅ `server.js` - WebSocket server
- ✅ `lib/websocket.ts` - WebSocket client
- ✅ `.eslintignore` - Ignore server.js lint errors

### Modified Files
- ✅ `lib/storage.ts` - Now uses WebSocket instead of browser storage
- ✅ `components/GameRoom.tsx` - Listens to WebSocket events
- ✅ `package.json` - Added express, ws, concurrently dependencies

## Next Steps

1. ✅ Install: `pnpm install`
2. ✅ Run: `pnpm dev`
3. ✅ Test: Open 2 browsers and create/join rooms
4. ✅ Deploy: Follow production deployment section

Enjoy your multiplayer pick/ban system! 🎮

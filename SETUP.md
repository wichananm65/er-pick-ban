# Pick & Ban System - Real-Time Multiplayer

A real-time pick/ban system built with Next.js and WebSocket for multiplayer gaming tournaments.

## Features

✅ **Real-Time Synchronization** - Both players see updates instantly  
✅ **Room-Based System** - Create and join rooms with unique codes  
✅ **Two-Player Match** - Left (Blue) vs Right (Red)  
✅ **Spectator Mode** - Multiple viewers can watch  
✅ **WebSocket Server** - Express.js backend with real-time updates  
✅ **Responsive Design** - Works on desktop and mobile  

## Architecture

### Backend (Node.js + WebSocket)
- **server.js**: Express server with WebSocket (ws) handling
- In-memory room management
- Real-time message broadcasting
- Automatic cleanup of inactive rooms

### Frontend (Next.js + React)
- **lib/websocket.ts**: WebSocket client with event handling
- **lib/storage.ts**: API layer communicating with server
- **components/GameRoom.tsx**: Real-time game interface
- **components/Menu.tsx**: Room creation/joining interface

## Setup Instructions

### 1. Install Dependencies

```bash
cd er-pick-ban
pnpm install
```

Or with npm:
```bash
npm install
```

### 2. Run Development Mode

This starts both the Next.js client and WebSocket server:

```bash
pnpm dev
```

Or:
```bash
npm run dev
```

**Expected output:**
```
🚀 Pick/Ban Server running on ws://localhost:3001
Health check: http://localhost:3001/health
Active rooms: http://localhost:3001/api/rooms

> er-pick-ban@0.1.0 dev
> next dev
...
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3. Access the Application

- **Client**: http://localhost:3000
- **Server Health Check**: http://localhost:3001/health
- **Active Rooms**: http://localhost:3001/api/rooms

## How It Works

### 1. Create a Room
- Click "สร้างห้อง" (Create Room)
- You become the **Left player (Blue)**
- Share the room code with another player

### 2. Join a Room
- Other player enters the room code
- Clicks "เข้าร่วมห้อง" (Join Room)
- They become the **Right player (Red)**

### 3. Real-Time Synchronization
- Both players see the same game state
- When one player bans/picks a hero, the other player sees it **instantly**
- No polling needed - WebSocket handles all updates

### 4. Watch as Spectator
- Enter a room code and click "ดูการแข่งขัน" (Watch Match)
- See the game in real-time without playing

## Project Structure

```
er-pick-ban/
├── server.js                 # WebSocket server (Node.js)
├── package.json              # Dependencies
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page
│   └── globals.css           # Global styles
├── components/
│   ├── PickBanGame.tsx       # Main game controller
│   ├── GameRoom.tsx          # Game interface (real-time)
│   ├── Menu.tsx              # Room menu
│   ├── TeamPanel.tsx         # Team display
│   ├── HeroGrid.tsx          # Hero selection grid
│   └── PhaseInfo.tsx         # Phase information
└── lib/
    ├── gameData.ts           # Game configuration
    ├── websocket.ts          # WebSocket client
    └── storage.ts            # API layer
```

## Communication Protocol

### Messages (Client → Server)

**init-room**: Create a new room
```json
{ "type": "init-room", "roomCode": "ABC123" }
```

**join-room**: Join existing room
```json
{ "type": "join-room", "roomCode": "ABC123", "side": "right" }
```

**spectate-room**: Watch a room
```json
{ "type": "spectate-room", "roomCode": "ABC123" }
```

**update-state**: Update game state
```json
{ 
  "type": "update-state", 
  "roomCode": "ABC123",
  "state": { 
    "currentPhase": 0,
    "actionCount": 0,
    "leftBans": [1, 2],
    "rightBans": [],
    ...
  }
}
```

**check-room-capacity**: Check if room exists
```json
{ "type": "check-room-capacity", "roomCode": "ABC123" }
```

### Messages (Server → Client)

**room-initialized**: Room created successfully
```json
{ 
  "type": "room-initialized", 
  "roomCode": "ABC123",
  "side": "left",
  "roomState": { ... }
}
```

**player-joined**: Another player joined
```json
{ 
  "type": "player-joined",
  "side": "right",
  "roomState": { ... }
}
```

**state-updated**: Game state changed
```json
{ 
  "type": "state-updated",
  "roomState": { ... }
}
```

## Troubleshooting

### "WebSocket is not connected"
- Ensure `pnpm dev` is running
- Check if server is running: http://localhost:3001/health
- Verify no port conflicts (3000 for Next.js, 3001 for WebSocket)

### Players can't find the room
- Make sure both players used the **exact same room code**
- Check that both have active WebSocket connections
- Try refreshing the page

### Spectator can't see game
- Ensure at least one player is in the room
- Verify room code is correct
- Check browser console for errors

## Production Deployment

For production, you'll need to:

1. Update WebSocket URL in `lib/websocket.ts` to use production domain
2. Use a proper process manager (PM2, systemd, etc.) for the server
3. Configure CORS for your domain
4. Use WSS (WebSocket Secure) with SSL certificates

Example for production:
```bash
# Build Next.js
npm run build

# Start server (requires Node.js)
NODE_ENV=production PORT=3001 node server.js &
npm run start
```

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, WebSocket (ws)
- **Real-Time**: WebSocket for two-way communication
- **UI**: Lucide React icons

## License

MIT

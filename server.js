// ======================================
// server.js - Real-time Pick/Ban Server (legacy CommonJS)
// ESLint: disable require-imports rule for this file
// ======================================
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// In-memory storage for rooms
const rooms = new Map();
const playerConnections = new Map(); // playerSide+roomCode -> ws connection

// Room state interface
class Room {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.currentPhase = 0;
    this.actionCount = 0;
    this.leftBans = [];
    this.rightBans = [];
    this.leftPicks = [];
    this.rightPicks = [];
    this.leftPlayer = null;
    this.rightPlayer = null;
    this.spectators = new Set();
    this.createdAt = Date.now();
  }

  getState() {
    return {
      currentPhase: this.currentPhase,
      actionCount: this.actionCount,
      leftBans: this.leftBans,
      rightBans: this.rightBans,
      leftPicks: this.leftPicks,
      rightPicks: this.rightPicks,
    };
  }

  updateState(newState) {
    if (newState.currentPhase !== undefined) this.currentPhase = newState.currentPhase;
    if (newState.actionCount !== undefined) this.actionCount = newState.actionCount;
    if (newState.leftBans !== undefined) this.leftBans = newState.leftBans;
    if (newState.rightBans !== undefined) this.rightBans = newState.rightBans;
    if (newState.leftPicks !== undefined) this.leftPicks = newState.leftPicks;
    if (newState.rightPicks !== undefined) this.rightPicks = newState.rightPicks;
  }
}

// Helper function to broadcast to all room participants
function broadcastToRoom(roomCode, message, excludeWs = null) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const participants = [room.leftPlayer, room.rightPlayer, ...room.spectators].filter(Boolean);
  
  participants.forEach(ws => {
    if (ws && ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Helper function to clean up disconnected players
function cleanupConnection(ws) {
  for (const [key, connection] of playerConnections.entries()) {
    if (connection === ws) {
      playerConnections.delete(key);
      const [side, roomCode] = key.split(':');
      const room = rooms.get(roomCode);
      
      if (room) {
        if (side === 'left') {
          room.leftPlayer = null;
        } else if (side === 'right') {
          room.rightPlayer = null;
        } else if (side.startsWith('spectator')) {
          room.spectators.delete(ws);
        }

        // Notify others that player left
        broadcastToRoom(roomCode, {
          type: 'player-left',
          side: side,
          roomState: room.getState(),
        });

        // Clean up empty rooms after 5 minutes
        if (!room.leftPlayer && !room.rightPlayer && room.spectators.size === 0) {
          setTimeout(() => {
            if (!room.leftPlayer && !room.rightPlayer && room.spectators.size === 0) {
              rooms.delete(roomCode);
            }
          }, 300000); // 5 minutes
        }
      }
      break;
    }
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message.type);

      switch (message.type) {
        case 'init-room':
          handleInitRoom(ws, message);
          break;
        case 'join-room':
          handleJoinRoom(ws, message);
          break;
        case 'spectate-room':
          handleSpectateRoom(ws, message);
          break;
        case 'update-state':
          handleUpdateState(ws, message);
          break;
        case 'get-room-state':
          handleGetRoomState(ws, message);
          break;
        case 'check-room-capacity':
          handleCheckCapacity(ws, message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Connection closed');
    cleanupConnection(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    cleanupConnection(ws);
  });
});

// Handlers
function handleInitRoom(ws, message) {
  const { roomCode } = message;
  
  if (rooms.has(roomCode)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room already exists',
    }));
    return;
  }

  const room = new Room(roomCode);
  room.leftPlayer = ws;
  rooms.set(roomCode, room);
  playerConnections.set(`left:${roomCode}`, ws);

  ws.send(JSON.stringify({
    type: 'room-initialized',
    roomCode,
    side: 'left',
    roomState: room.getState(),
  }));

  console.log(`Room ${roomCode} created`);
}

function handleJoinRoom(ws, message) {
  const { roomCode, side } = message;
  
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found',
    }));
    return;
  }

  if (side === 'left' && room.leftPlayer) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Left player slot already taken',
    }));
    return;
  }

  if (side === 'right' && room.rightPlayer) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Right player slot already taken',
    }));
    return;
  }

  if (side === 'left') {
    room.leftPlayer = ws;
  } else if (side === 'right') {
    room.rightPlayer = ws;
  }

  playerConnections.set(`${side}:${roomCode}`, ws);

  ws.send(JSON.stringify({
    type: 'room-joined',
    roomCode,
    side,
    roomState: room.getState(),
  }));

  // Notify other players
  broadcastToRoom(roomCode, {
    type: 'player-joined',
    side,
    roomState: room.getState(),
  }, ws);

  console.log(`Player (${side}) joined room ${roomCode}`);
}

function handleSpectateRoom(ws, message) {
  const { roomCode } = message;
  
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found',
    }));
    return;
  }

  room.spectators.add(ws);
  playerConnections.set(`spectator-${Date.now()}:${roomCode}`, ws);

  ws.send(JSON.stringify({
    type: 'room-spectated',
    roomCode,
    side: 'spectator',
    roomState: room.getState(),
  }));

  console.log(`Spectator joined room ${roomCode}`);
}

function handleUpdateState(ws, message) {
  const { roomCode, state } = message;
  
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found',
    }));
    return;
  }

  room.updateState(state);

  broadcastToRoom(roomCode, {
    type: 'state-updated',
    roomState: room.getState(),
  });

  console.log(`Room ${roomCode} state updated`);
}

function handleGetRoomState(ws, message) {
  const { roomCode } = message;
  
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found',
    }));
    return;
  }

  ws.send(JSON.stringify({
    type: 'room-state',
    roomState: room.getState(),
  }));
}

function handleCheckCapacity(ws, message) {
  const { roomCode } = message;
  
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'capacity-check',
      hasLeft: false,
      hasRight: false,
      exists: false,
    }));
    return;
  }

  ws.send(JSON.stringify({
    type: 'capacity-check',
    hasLeft: !!room.leftPlayer,
    hasRight: !!room.rightPlayer,
    exists: true,
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Server info endpoint
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([code, room]) => ({
    code,
    hasLeft: !!room.leftPlayer,
    hasRight: !!room.rightPlayer,
    spectators: room.spectators.size,
  }));
  res.json({ rooms: roomList });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Pick/Ban Server running on ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Active rooms: http://localhost:${PORT}/api/rooms\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// ======================================
// lib/storage.ts - WebSocket-based Storage
// ======================================
import { wsClient } from './websocket';
import type { WSMessage } from './websocket';

export interface GameState {
  currentPhase: number;
  actionCount: number;
  leftBans: number[];
  rightBans: number[];
  leftPicks: number[];
  rightPicks: number[];
}

// Promise-based message handling for request-response pattern
const waitForMessage = (type: string, timeout = 5000): Promise<WSMessage> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout waiting for ${type}`));
    }, timeout);

    const unsubscribe = wsClient.on(type as unknown as 'init-room', (message) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(message);
    });
  });
};

// Initialize room with default game state
export const initializeRoom = async (roomCode: string): Promise<void> => {
  try {
    // Ensure WebSocket is connected
    if (!wsClient.isConnected()) {
      await wsClient.connect();
    }

    wsClient.send({
      type: 'init-room',
      roomCode,
    });

    // Wait for confirmation
    await waitForMessage('room-initialized');
    console.log(`Room ${roomCode} initialized`);
  } catch (err) {
    console.error('Failed to initialize room:', err);
    throw err;
  }
};

// Load game state from storage
export const loadGameState = async (roomCode: string): Promise<GameState | null> => {
  try {
    if (!wsClient.isConnected()) {
      await wsClient.connect();
    }

    wsClient.send({
      type: 'get-room-state',
      roomCode,
    });

    const response = await waitForMessage('room-state');
    const roomState = response.roomState as unknown as GameState;
    return roomState;
  } catch (err) {
    console.log('Failed to load game state:', err);
    return null;
  }
};

// Save game state to storage
export const saveGameState = async (roomCode: string, state: GameState): Promise<void> => {
  try {
    if (!wsClient.isConnected()) {
      await wsClient.connect();
    }

    wsClient.send({
      type: 'update-state',
      roomCode,
      state: state as unknown as Record<string, unknown>,
    });

    console.log(`Game state saved for room ${roomCode}`);
  } catch (err) {
    console.error('Failed to save game state:', err);
    throw err;
  }
};

// Check room capacity
export const checkRoomCapacity = async (roomCode: string): Promise<{ hasLeft: boolean; hasRight: boolean }> => {
  try {
    if (!wsClient.isConnected()) {
      await wsClient.connect();
    }

    wsClient.send({
      type: 'check-room-capacity',
      roomCode,
    });

    const response = await waitForMessage('capacity-check');
    return {
      hasLeft: response.hasLeft as boolean,
      hasRight: response.hasRight as boolean,
    };
  } catch (err) {
    console.error('Failed to check room capacity:', err);
    return { hasLeft: false, hasRight: false };
  }
};

// Register player in room
export const registerPlayer = async (roomCode: string, side: 'left' | 'right'): Promise<boolean> => {
  try {
    if (!wsClient.isConnected()) {
      await wsClient.connect();
    }

    wsClient.send({
      type: 'join-room',
      roomCode,
      side,
    });

    const response = await waitForMessage('room-joined', 5000);
    return response.type === 'room-joined';
  } catch (err) {
    console.error('Failed to register player:', err);
    return false;
  }
};
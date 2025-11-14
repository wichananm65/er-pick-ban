// ======================================
// lib/storage.ts
// ======================================
declare global {
  interface Window {
    storage: {
      get(key: string, secure?: boolean): Promise<{ value: string } | null>;
      set(key: string, value: string, secure?: boolean): Promise<void>;
      remove?(key: string, secure?: boolean): Promise<void>;
    };
  }
}

export interface GameState {
  currentPhase: number;
  actionCount: number;
  leftBans: number[];
  rightBans: number[];
  leftPicks: number[];
  rightPicks: number[];
}

// Check if storage API is available
const isStorageAvailable = () => {
  return typeof window !== 'undefined' && window.storage;
};

// Initialize room with default game state
export const initializeRoom = async (roomCode: string): Promise<void> => {
  if (!isStorageAvailable()) return;
  
  const initialState: GameState = {
    currentPhase: 0,
    actionCount: 0,
    leftBans: [],
    rightBans: [],
    leftPicks: [],
    rightPicks: []
  };
  
  try {
    await window.storage.set(`room:${roomCode}`, JSON.stringify(initialState), true);
  } catch (err) {
    console.error('Failed to initialize room:', err);
  }
};

// Load game state from storage
export const loadGameState = async (roomCode: string): Promise<GameState | null> => {
  if (!isStorageAvailable()) return null;
  
  try {
    const result = await window.storage.get(`room:${roomCode}`, true);
    if (result) {
      return JSON.parse(result.value);
    }
  } catch (err) {
    console.log('No existing game state');
  }
  return null;
};

// Save game state to storage
export const saveGameState = async (roomCode: string, state: GameState): Promise<void> => {
  if (!isStorageAvailable()) return;
  
  try {
    await window.storage.set(`room:${roomCode}`, JSON.stringify(state), true);
  } catch (err) {
    console.error('Failed to save game state:', err);
  }
};

// Check room capacity
export const checkRoomCapacity = async (roomCode: string): Promise<{ hasLeft: boolean; hasRight: boolean }> => {
  if (!isStorageAvailable()) return { hasLeft: false, hasRight: false };
  
  try {
    const leftPlayer = await window.storage.get(`room:${roomCode}:left`, true);
    const rightPlayer = await window.storage.get(`room:${roomCode}:right`, true);
    return {
      hasLeft: !!leftPlayer,
      hasRight: !!rightPlayer
    };
  } catch (err) {
    return { hasLeft: false, hasRight: false };
  }
};

// Register player in room
export const registerPlayer = async (roomCode: string, side: 'left' | 'right'): Promise<boolean> => {
  if (!isStorageAvailable()) return false;
  
  try {
    await window.storage.set(`room:${roomCode}:${side}`, Date.now().toString(), true);
    return true;
  } catch (err) {
    console.error('Failed to register player:', err);
    return false;
  }
};
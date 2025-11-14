// ======================================
// components/PickBanGame.tsx
// ======================================
'use client';

import React, { useState } from 'react';
import Menu from './Menu';
import GameRoom from './GameRoom';

export type Mode = 'menu' | 'game';
export type Side = 'left' | 'right' | 'spectator' | null;

export default function PickBanGame() {
  const [mode, setMode] = useState<Mode>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [userSide, setUserSide] = useState<Side>(null);

  const handleCreateRoom = (code: string, side: Side) => {
    setRoomCode(code);
    setUserSide(side);
    setMode('game');
  };

  const handleJoinRoom = (code: string, side: Side) => {
    setRoomCode(code);
    setUserSide(side);
    setMode('game');
  };

  const handleExitRoom = () => {
    setMode('menu');
    setRoomCode('');
    setUserSide(null);
  };

  if (mode === 'menu') {
    return (
      <Menu
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  return (
    <GameRoom
      roomCode={roomCode}
      userSide={userSide}
      onExit={handleExitRoom}
    />
  );
}
// components/PickBanGame.tsx
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

  const handleCreateRoom = (code: string) => {
    setRoomCode(code);
    setUserSide('left');
    setMode('game');
  };

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setUserSide('right');
    setMode('game');
  };

  const handleSpectateRoom = (code: string) => {
    setRoomCode(code);
    setUserSide('spectator');
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
        onSpectateRoom={handleSpectateRoom}
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
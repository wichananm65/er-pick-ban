// ======================================
// components/GameRoom.tsx
// ======================================
'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { heroes, phases } from '@/lib/gameData';
import { loadGameState, saveGameState } from '@/lib/storage';
import { wsClient } from '@/lib/websocket';
import type { Side } from './PickBanGame';
import TeamPanel from './TeamPanel';
import HeroGrid from './HeroGrid';
import PhaseInfo from './PhaseInfo';

interface GameRoomProps {
  roomCode: string;
  userSide: Side;
  onExit: () => void;
}

export default function GameRoom({ roomCode, userSide, onExit }: GameRoomProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [leftBans, setLeftBans] = useState<number[]>([]);
  const [rightBans, setRightBans] = useState<number[]>([]);
  const [leftPicks, setLeftPicks] = useState<number[]>([]);
  const [rightPicks, setRightPicks] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Load initial game state and setup WebSocket listeners
  useEffect(() => {
    const setupRoom = async () => {
      try {
        // Connect WebSocket
        await wsClient.connect();

        // Load initial state
        const state = await loadGameState(roomCode);
        if (state) {
          setCurrentPhase(state.currentPhase);
          setActionCount(state.actionCount);
          setLeftBans(state.leftBans);
          setRightBans(state.rightBans);
          setLeftPicks(state.leftPicks);
          setRightPicks(state.rightPicks);
        }
      } catch (err) {
        console.error('Failed to setup room:', err);
      }
    };

    setupRoom();
  }, [roomCode]);

  // Listen for real-time state updates from WebSocket
  useEffect(() => {
    const handleStateUpdate = (message: Record<string, unknown>) => {
      const roomState = message.roomState as unknown as Record<string, unknown>;
      if (roomState) {
        setCurrentPhase(roomState.currentPhase as number);
        setActionCount(roomState.actionCount as number);
        setLeftBans(roomState.leftBans as number[]);
        setRightBans(roomState.rightBans as number[]);
        setLeftPicks(roomState.leftPicks as number[]);
        setRightPicks(roomState.rightPicks as number[]);
      }
    };

    const handlePlayerJoined = (message: Record<string, unknown>) => {
      const side = message.side as string;
      console.log(`Player joined: ${side}`);
      const roomState = message.roomState as unknown as Record<string, unknown>;
      if (roomState) {
        setCurrentPhase(roomState.currentPhase as number);
        setActionCount(roomState.actionCount as number);
        setLeftBans(roomState.leftBans as number[]);
        setRightBans(roomState.rightBans as number[]);
        setLeftPicks(roomState.leftPicks as number[]);
        setRightPicks(roomState.rightPicks as number[]);
      }
    };

    // Subscribe to WebSocket events
    const unsubscribeStateUpdate = wsClient.on('state-updated', handleStateUpdate as unknown as (message: Record<string, unknown>) => void);
    const unsubscribePlayerJoined = wsClient.on('player-joined', handlePlayerJoined as unknown as (message: Record<string, unknown>) => void);

    return () => {
      unsubscribeStateUpdate();
      unsubscribePlayerJoined();
    };
  }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHeroClick = async (heroId: number) => {
    if (userSide === 'spectator') return;
    if (currentPhase >= phases.length) return;

    const phase = phases[currentPhase];
    if (phase.side !== userSide) return;

    const allBanned = [...leftBans, ...rightBans];
    const allPicked = [...leftPicks, ...rightPicks];
    
    if (allBanned.includes(heroId) || allPicked.includes(heroId)) return;

    let newLeftBans = leftBans;
    let newRightBans = rightBans;
    let newLeftPicks = leftPicks;
    let newRightPicks = rightPicks;

    if (phase.action === 'ban') {
      if (phase.side === 'left') {
        newLeftBans = [...leftBans, heroId];
      } else {
        newRightBans = [...rightBans, heroId];
      }
    } else {
      if (phase.side === 'left') {
        newLeftPicks = [...leftPicks, heroId];
      } else {
        newRightPicks = [...rightPicks, heroId];
      }
    }

    const newCount = actionCount + 1;
    let newPhase = currentPhase;
    let finalCount = newCount;

    if (newCount >= phase.count) {
      newPhase = currentPhase + 1;
      finalCount = 0;
    }

    // Save to storage immediately
    await saveGameState(roomCode, {
      currentPhase: newPhase,
      actionCount: finalCount,
      leftBans: newLeftBans,
      rightBans: newRightBans,
      leftPicks: newLeftPicks,
      rightPicks: newRightPicks
    });

    // Update local state
    setLeftBans(newLeftBans);
    setRightBans(newRightBans);
    setLeftPicks(newLeftPicks);
    setRightPicks(newRightPicks);
    setActionCount(finalCount);
    setCurrentPhase(newPhase);
  };

  const resetGame = async () => {
    const newState = {
      currentPhase: 0,
      actionCount: 0,
      leftBans: [],
      rightBans: [],
      leftPicks: [],
      rightPicks: []
    };
    
    await saveGameState(roomCode, newState);
    
    setCurrentPhase(0);
    setActionCount(0);
    setLeftBans([]);
    setRightBans([]);
    setLeftPicks([]);
    setRightPicks([]);
  };

  const getHeroStatus = (heroId: number): 'available' | 'banned' | 'picked-left' | 'picked-right' => {
    if (leftBans.includes(heroId) || rightBans.includes(heroId)) return 'banned';
    if (leftPicks.includes(heroId)) return 'picked-left';
    if (rightPicks.includes(heroId)) return 'picked-right';
    return 'available';
  };

  const currentPhaseData = currentPhase < phases.length ? phases[currentPhase] : null;
  const isGameOver = currentPhase >= phases.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">รหัสห้อง:</h2>
            <code className="bg-gray-900 text-blue-400 px-4 py-2 rounded text-lg font-mono">{roomCode}</code>
            <button
              onClick={copyRoomCode}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
              title="คัดลอกรหัสห้อง"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {userSide === 'spectator' && (
              <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Eye size={16} className="mr-2" />
                โหมดดูการแข่งขัน
              </span>
            )}
            {userSide !== 'spectator' && (
              <span className={`${userSide === 'left' ? 'bg-blue-600' : 'bg-red-600'} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                {userSide === 'left' ? 'ทีมซ้าย (Blue)' : 'ทีมขวา (Red)'}
              </span>
            )}
            <button
              onClick={onExit}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              ออก
            </button>
          </div>
        </div>

        {/* Phase Info */}
        <PhaseInfo
          currentPhaseData={currentPhaseData}
          actionCount={actionCount}
          isGameOver={isGameOver}
          onReset={resetGame}
          userSide={userSide}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Team */}
          <TeamPanel
            side="left"
            bans={leftBans}
            picks={leftPicks}
          />

          {/* Hero Grid */}
          <HeroGrid
            heroes={heroes}
            getHeroStatus={getHeroStatus}
            onHeroClick={handleHeroClick}
            isClickable={(heroId) => {
              const status = getHeroStatus(heroId);
              return userSide !== 'spectator' && 
                     !isGameOver && 
                     currentPhaseData?.side === userSide && 
                     status === 'available';
            }}
          />

          {/* Right Team */}
          <TeamPanel
            side="right"
            bans={rightBans}
            picks={rightPicks}
          />
        </div>
      </div>
    </div>
  );
}
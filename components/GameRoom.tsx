// components/GameRoom.tsx
'use client';

import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { heroes, phases } from '../lib/gameData';
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

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHeroClick = (heroId: number) => {
    if (userSide === 'spectator') return;
    if (currentPhase >= phases.length) return;

    const phase = phases[currentPhase];
    if (phase.side !== userSide) return;

    const allBanned = [...leftBans, ...rightBans];
    const allPicked = [...leftPicks, ...rightPicks];
    
    if (allBanned.includes(heroId) || allPicked.includes(heroId)) return;

    if (phase.action === 'ban') {
      if (phase.side === 'left') {
        setLeftBans([...leftBans, heroId]);
      } else {
        setRightBans([...rightBans, heroId]);
      }
    } else {
      if (phase.side === 'left') {
        setLeftPicks([...leftPicks, heroId]);
      } else {
        setRightPicks([...rightPicks, heroId]);
      }
    }

    const newCount = actionCount + 1;
    setActionCount(newCount);

    if (newCount >= phase.count) {
      setCurrentPhase(currentPhase + 1);
      setActionCount(0);
    }
  };

  const resetGame = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">รหัสห้อง:</h2>
            <code className="bg-gray-900 text-blue-400 px-4 py-2 rounded text-lg font-mono">{roomCode}</code>
            <button
              onClick={copyRoomCode}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
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
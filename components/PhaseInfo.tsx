// ======================================
// components/PhaseInfo.tsx
// ======================================
'use client';

import React from 'react';
import type { Phase } from '@/lib/gameData';
import type { Side } from './PickBanGame';

interface PhaseInfoProps {
  currentPhaseData: Phase | null;
  actionCount: number;
  isGameOver: boolean;
  onReset: () => void;
  userSide: Side;
}

export default function PhaseInfo({ currentPhaseData, actionCount, isGameOver, onReset, userSide }: PhaseInfoProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 text-center">
      {!isGameOver && currentPhaseData ? (
        <>
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentPhaseData.desc} ({actionCount}/{currentPhaseData.count})
          </h3>
          <p className="text-gray-400">
            {currentPhaseData.side === 'left' ? '🔵 ทีมซ้าย' : '🔴 ทีมขวา'} - 
            {currentPhaseData.action === 'ban' ? ' กำลังแบนตัวละคร' : ' กำลังเลือกตัวละคร'}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-green-400 mb-2">✓ การเลือกเสร็จสิ้น</h3>
          {userSide !== 'spectator' && (
            <button
              onClick={onReset}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              เริ่มใหม่
            </button>
          )}
        </>
      )}
    </div>
  );
}
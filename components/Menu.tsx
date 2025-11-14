// components/Menu.tsx
'use client';

import React, { useState } from 'react';
import { Users, Eye } from 'lucide-react';

interface MenuProps {
  onCreateRoom: (code: string) => void;
  onJoinRoom: (code: string) => void;
  onSpectateRoom: (code: string) => void;
}

export default function Menu({ onCreateRoom, onJoinRoom, onSpectateRoom }: MenuProps) {
  const [inputCode, setInputCode] = useState('');

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    onCreateRoom(code);
  };

  const handleJoinRoom = () => {
    if (inputCode.trim()) {
      onJoinRoom(inputCode.toUpperCase());
    }
  };

  const handleSpectateRoom = () => {
    if (inputCode.trim()) {
      onSpectateRoom(inputCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white mb-2">Pick & Ban System</h1>
          <p className="text-gray-400">เลือกโหมดการเล่น</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Users className="inline mr-2" size={20} />
            สร้างห้อง
          </button>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="กรอกรหัสห้อง"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
            
            <button
              onClick={handleJoinRoom}
              disabled={!inputCode.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              เข้าร่วมห้อง
            </button>
            
            <button
              onClick={handleSpectateRoom}
              disabled={!inputCode.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              <Eye className="inline mr-2" size={18} />
              ดูการแข่งขัน (Spectator)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
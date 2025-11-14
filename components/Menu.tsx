// ======================================
// components/Menu.tsx
// ======================================
'use client';

import React, { useState } from 'react';
import { Users, Eye, AlertCircle } from 'lucide-react';
import { checkRoomCapacity, registerPlayer, initializeRoom } from '@/lib/storage';
import type { Side } from './PickBanGame';

interface MenuProps {
  onCreateRoom: (code: string, side: Side) => void;
  onJoinRoom: (code: string, side: Side) => void;
}

export default function Menu({ onCreateRoom, onJoinRoom }: MenuProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    const code = generateRoomCode();
    
    try {
      await initializeRoom(code);
      await registerPlayer(code, 'left');
      onCreateRoom(code, 'left');
    } catch (err) {
      setError('ไม่สามารถสร้างห้องได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    
    setLoading(true);
    const code = inputCode.toUpperCase();
    
    try {
      const capacity = await checkRoomCapacity(code);
      
      if (!capacity.hasLeft) {
        setError('ห้องนี้ยังไม่มีผู้เล่นฝั่งซ้าย กรุณาตรวจสอบรหัสห้อง');
        setLoading(false);
        return;
      }
      
      if (capacity.hasRight) {
        setError('ห้องเต็มแล้ว! มีผู้เล่นครบ 2 คนแล้ว กรุณาเข้าเป็น Spectator แทน');
        setLoading(false);
        return;
      }
      
      await registerPlayer(code, 'right');
      setError('');
      onJoinRoom(code, 'right');
    } catch (err) {
      setError('ไม่สามารถเข้าร่วมห้องได้ กรุณาตรวจสอบรหัสห้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleSpectateRoom = async () => {
    if (!inputCode.trim()) return;
    
    setLoading(true);
    const code = inputCode.toUpperCase();
    
    try {
      const capacity = await checkRoomCapacity(code);
      
      if (!capacity.hasLeft) {
        setError('ห้องนี้ยังไม่มีผู้เล่น กรุณาตรวจสอบรหัสห้อง');
        setLoading(false);
        return;
      }
      
      setError('');
      onJoinRoom(code, 'spectator');
    } catch (err) {
      setError('ไม่สามารถดูการแข่งขันได้ กรุณาตรวจสอบรหัสห้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white mb-2">Pick & Ban System</h1>
          <p className="text-gray-400">เลือกโหมดการเล่น</p>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mt-4">
            <p className="text-blue-300 text-sm">💡 ห้องจำกัด 2 ผู้เล่น (ฝั่งซ้าย + ฝั่งขวา)</p>
            <p className="text-blue-300 text-sm">👁️ Spectator ดูได้ไม่จำกัด</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Users className="inline mr-2" size={20} />
            {loading ? 'กำลังสร้างห้อง...' : 'สร้างห้อง (เป็นฝั่งซ้าย)'}
          </button>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="กรอกรหัสห้อง"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              disabled={loading}
            />
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-start">
                <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleJoinRoom}
              disabled={!inputCode.trim() || loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง (เป็นฝั่งขวา)'}
            </button>
            
            <button
              onClick={handleSpectateRoom}
              disabled={!inputCode.trim() || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              <Eye className="inline mr-2" size={18} />
              {loading ? 'กำลังเข้าดู...' : 'ดูการแข่งขัน (Spectator)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
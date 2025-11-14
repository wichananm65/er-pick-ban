// components/HeroGrid.tsx
'use client';

import React from 'react';
import type { Hero } from '../lib/gameData';

interface HeroGridProps {
  heroes: Hero[];
  getHeroStatus: (heroId: number) => 'available' | 'banned' | 'picked-left' | 'picked-right';
  onHeroClick: (heroId: number) => void;
  isClickable: (heroId: number) => boolean;
}

export default function HeroGrid({ heroes, getHeroStatus, onHeroClick, isClickable }: HeroGridProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-xl font-bold text-white mb-4 text-center">ตัวละคร</h3>
      <div className="grid grid-cols-2 gap-3">
        {heroes.map((hero) => {
          const status = getHeroStatus(hero.id);
          const clickable = isClickable(hero.id);
          
          return (
            <button
              key={hero.id}
              onClick={() => onHeroClick(hero.id)}
              disabled={!clickable}
              className={`
                relative p-4 rounded-lg font-semibold transition-all transform
                ${status === 'available' ? `${hero.color} hover:scale-105` : ''}
                ${status === 'banned' ? 'bg-gray-900 opacity-40 cursor-not-allowed' : ''}
                ${status === 'picked-left' ? 'bg-blue-600 ring-2 ring-blue-400' : ''}
                ${status === 'picked-right' ? 'bg-red-600 ring-2 ring-red-400' : ''}
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
                ${!clickable && status === 'available' ? 'opacity-60' : ''}
              `}
            >
              <span className="text-white">{hero.name}</span>
              {status === 'banned' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-red-500 text-2xl font-bold">✗</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
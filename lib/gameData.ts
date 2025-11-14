export interface Hero {
  id: number;
  name: string;
  color: string;
}

export interface Phase {
  step: number;
  side: 'left' | 'right';
  action: 'ban' | 'pick';
  count: number;
  desc: string;
}

export const heroes: Hero[] = [
  { id: 1, name: 'Warrior', color: 'bg-red-600' },
  { id: 2, name: 'Mage', color: 'bg-blue-600' },
  { id: 3, name: 'Archer', color: 'bg-green-600' },
  { id: 4, name: 'Assassin', color: 'bg-purple-600' },
  { id: 5, name: 'Tank', color: 'bg-yellow-600' },
  { id: 6, name: 'Support', color: 'bg-pink-600' },
  { id: 7, name: 'Fighter', color: 'bg-orange-600' },
  { id: 8, name: 'Marksman', color: 'bg-teal-600' },
  { id: 9, name: 'Jungler', color: 'bg-indigo-600' },
  { id: 10, name: 'Paladin', color: 'bg-cyan-600' },
];

export const phases: Phase[] = [
  { step: 1, side: 'left', action: 'ban', count: 2, desc: 'ฝั่งซ้ายแบน 2' },
  { step: 2, side: 'right', action: 'ban', count: 2, desc: 'ฝั่งขวาแบน 2' },
  { step: 3, side: 'left', action: 'pick', count: 1, desc: 'ฝั่งซ้ายเลือก 1' },
  { step: 4, side: 'right', action: 'pick', count: 2, desc: 'ฝั่งขวาเลือก 2' },
  { step: 5, side: 'left', action: 'ban', count: 2, desc: 'ฝั่งซ้ายแบน 2' },
  { step: 6, side: 'right', action: 'ban', count: 2, desc: 'ฝั่งขวาแบน 2' },
  { step: 7, side: 'right', action: 'pick', count: 1, desc: 'ฝั่งขวาเลือก 1' },
  { step: 8, side: 'left', action: 'pick', count: 2, desc: 'ฝั่งซ้ายเลือก 2' },
  { step: 9, side: 'right', action: 'pick', count: 1, desc: 'ฝั่งขวาเลือก 1' },
];
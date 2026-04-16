// Map pin definitions and saved coordinates
// Coordinates are stored as % of map image dimensions (0-100)

export interface MapPin {
  id: string;
  label: string;
  x: number; // 0-100 (% of map width)
  y: number; // 0-100 (% of map height)
  type: 'monster' | 'shop' | 'boss' | 'heal';
  emoji: string;
  image: string; // path to card image
  rank?: string;
}

// Available pins that can be placed on the map
export const AVAILABLE_PINS: Omit<MapPin, 'x' | 'y'>[] = [
  { id: 'goblin', label: 'Goblin Scout', type: 'monster', emoji: '🗡️', image: '/cards/monsters/goblin.png', rank: 'C' },
  { id: 'skeleton', label: 'Skeleton Warrior', type: 'monster', emoji: '💀', image: '/cards/monsters/skeleton.png', rank: 'C' },
  { id: 'slime', label: 'Slime', type: 'monster', emoji: '🟢', image: '/cards/monsters/slime.png', rank: 'C' },
  // { id: 'slime_king', label: 'Slime King', type: 'monster', emoji: '👑', image: '/cards/monsters/slime_king.png', rank: 'A' },
  { id: 'dark_knight', label: 'Dark Knight', type: 'monster', emoji: '⚔️', image: '/cards/monsters/dark_knight.png', rank: 'B' },
  { id: 'flame_serpent', label: 'Flame Serpent', type: 'monster', emoji: '🐍', image: '/cards/monsters/flame_serpent.png', rank: 'B' },
  { id: 'lich', label: 'Lich King', type: 'monster', emoji: '☠️', image: '/cards/monsters/lich.png', rank: 'A' },
  { id: 'duo', label: 'Queen & King', type: 'monster', emoji: '👑', image: '/cards/monsters/duo.png', rank: 'S' },
  { id: 'boss', label: 'Infernal Demon Lord', type: 'boss', emoji: '👹', image: '/cards/monsters/boss.png', rank: 'Boss' },
  { id: 'shop', label: 'Shop', type: 'shop', emoji: '🛒', image: '/cards/items/healing-potion.png' },
];

// localStorage key for saved pin positions
export const MAP_PINS_KEY = 'loc-dnd-map-pins';

// Default pin positions (shared across all staff)
export const DEFAULT_PINS: MapPin[] = [
  { id: 'goblin', label: 'Goblin Scout', type: 'monster', emoji: '🗡️', image: '/cards/monsters/goblin.png', rank: 'C', x: 22.228800455729168, y: 56.83946739903604 },
  { id: 'skeleton', label: 'Skeleton Warrior', type: 'monster', emoji: '💀', image: '/cards/monsters/skeleton.png', rank: 'C', x: 46.23579545454545, y: 64.34899131553895 },
  { id: 'slime', label: 'Slime', type: 'monster', emoji: '🟢', image: '/cards/monsters/slime.png', rank: 'C', x: 51.28388748331917, y: 78.74923252361968 },
  // { id: 'slime_king', label: 'Slime King', type: 'monster', emoji: '👑', image: '/cards/monsters/slime_king.png', rank: 'A', x: 55.996950708254424, y: 79.97154844866373 },
  { id: 'dark_knight', label: 'Dark Knight', type: 'monster', emoji: '⚔️', image: '/cards/monsters/dark_knight.png', rank: 'B', x: 68.47616792929293, y: 75.1016497342261 },
  { id: 'flame_serpent', label: 'Flame Serpent', type: 'monster', emoji: '🐍', image: '/cards/monsters/flame_serpent.png', rank: 'B', x: 45.865688131313135, y: 47.0508323079523 },
  { id: 'lich', label: 'Lich King', type: 'monster', emoji: '☠️', image: '/cards/monsters/lich.png', rank: 'A', x: 79.22664141414143, y: 60.691607763599954 },
  { id: 'duo', label: 'Queen & King', type: 'monster', emoji: '👑', image: '/cards/monsters/duo.png', rank: 'S', x: 84.7808837890625, y: 45.15971439483297 },
  { id: 'boss', label: 'Infernal Demon Lord', type: 'boss', emoji: '👹', image: '/cards/monsters/boss.png', rank: 'Boss', x: 65.41377520320391, y: 46.32765785704688 },
  { id: 'shop', label: 'ร้านค้า', type: 'shop', emoji: '🛒', image: '/cards/items/healing-potion.png', x: 37.037563131313135, y: 62.6855988566292 },
];

export function loadPins(): MapPin[] {
  try {
    const raw = localStorage.getItem(MAP_PINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PINS;
}

export function savePins(pins: MapPin[]) {
  try {
    localStorage.setItem(MAP_PINS_KEY, JSON.stringify(pins));
  } catch {}
}

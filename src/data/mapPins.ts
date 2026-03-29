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
  { id: 'slime_king', label: 'Slime King', type: 'monster', emoji: '👑', image: '/cards/monsters/slime_king.png', rank: 'A' },
  { id: 'dark_knight', label: 'Dark Knight', type: 'monster', emoji: '⚔️', image: '/cards/monsters/dark_knight.png', rank: 'B' },
  { id: 'flame_serpent', label: 'Flame Serpent', type: 'monster', emoji: '🐍', image: '/cards/monsters/flame_serpent.png', rank: 'B' },
  { id: 'lich', label: 'Lich King', type: 'monster', emoji: '☠️', image: '/cards/monsters/lich.png', rank: 'A' },
  { id: 'duo', label: 'Queen & King', type: 'monster', emoji: '👑', image: '/cards/monsters/duo.png', rank: 'S' },
  { id: 'boss', label: 'Infernal Demon Lord', type: 'boss', emoji: '👹', image: '/cards/monsters/boss.png', rank: 'Boss' },
  { id: 'shop', label: 'ร้านค้า', type: 'shop', emoji: '🛒', image: '/cards/items/potion-of-healing.png' },
  { id: 'heal1', label: 'Full Heal #1', type: 'heal', emoji: '💊', image: '/cards/items/potion-of-healing.png' },
  { id: 'heal2', label: 'Full Heal #2', type: 'heal', emoji: '💊', image: '/cards/items/potion-of-healing.png' },
];

// localStorage key for saved pin positions
export const MAP_PINS_KEY = 'loc-dnd-map-pins';

export function loadPins(): MapPin[] {
  try {
    const raw = localStorage.getItem(MAP_PINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function savePins(pins: MapPin[]) {
  try {
    localStorage.setItem(MAP_PINS_KEY, JSON.stringify(pins));
  } catch {}
}

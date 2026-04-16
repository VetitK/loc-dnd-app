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
  {
    "id": "goblin",
    "label": "Goblin Scout",
    "type": "monster",
    "emoji": "🗡️",
    "image": "/cards/monsters/goblin.png",
    "rank": "C",
    "x": 22.352356900107345,
    "y": 55.98877298901076
  },
  {
    "id": "skeleton",
    "label": "Skeleton Warrior",
    "type": "monster",
    "emoji": "💀",
    "image": "/cards/monsters/skeleton.png",
    "rank": "C",
    "x": 49.052607667330335,
    "y": 75.0744332220281
  },
  {
    "id": "slime",
    "label": "Slime",
    "type": "monster",
    "emoji": "🟢",
    "image": "/cards/monsters/slime.png",
    "rank": "C",
    "x": 38.43375157564663,
    "y": 61.757606144876
  },
  {
    "id": "slime_king",
    "label": "Slime King",
    "type": "monster",
    "emoji": "👑",
    "image": "/cards/monsters/slime_king.png",
    "rank": "A",
    "x": 21.02480502068941,
    "y": 0.06125233896062276
  },
  {
    "id": "dark_knight",
    "label": "Dark Knight",
    "type": "monster",
    "emoji": "⚔️",
    "image": "/cards/monsters/dark_knight.png",
    "rank": "B",
    "x": 60.116653526998675,
    "y": 66.49186920428818
  },
  {
    "id": "flame_serpent",
    "label": "Flame Serpent",
    "type": "monster",
    "emoji": "🐍",
    "image": "/cards/monsters/flame_serpent.png",
    "rank": "B",
    "x": 44.26687333805471,
    "y": 49.96510942717433
  },
  {
    "id": "lich",
    "label": "Lich King",
    "type": "monster",
    "emoji": "☠️",
    "image": "/cards/monsters/lich.png",
    "rank": "A",
    "x": 68.59062584906754,
    "y": 61.41852146674799
  },
  {
    "id": "duo",
    "label": "Queen & King",
    "type": "monster",
    "emoji": "👑",
    "image": "/cards/monsters/duo.png",
    "rank": "S",
    "x": 48.227481058834535,
    "y": 85.19657607178671
  },
  {
    "id": "boss",
    "label": "Infernal Demon Lord",
    "type": "boss",
    "emoji": "👹",
    "image": "/cards/monsters/boss.png",
    "rank": "Boss",
    "x": 67.3450298649064,
    "y": 51.46101043098903
  },
  {
    "id": "shop",
    "label": "Shop",
    "type": "shop",
    "emoji": "🛒",
    "image": "/cards/items/healing-potion.png",
    "x": 45.990174200818664,
    "y": 66.18121388179591
  }
]

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

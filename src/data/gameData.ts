// ============ GAME DATA CONFIG ============
// Edit this file to adjust ALL game stats.
// Dice format: [6,4] means 1d6 + 1d4. Only d4 and d6 allowed.
// Attack roll: 2d6. Crit Fail=2 (miss), <AC = dmg/2, >=AC = full dmg, Crit Hit=12 (dmg x2)

export interface CharClass {
  name: string;
  hp: number;
  ac: number;
  emoji: string;
  color: string;
  equipment: string[];
  skills: Skill[];
}

export interface Skill {
  name: string;
  dice: number[];
  dmgType?: string;
  type: 'atk' | 'heal' | 'buff' | 'debuff' | 'selfheal';
  description: string;
  unlock?: boolean;
  singleUse?: boolean;
  stun?: boolean;
}

export interface Monster {
  id: string;
  name: string;
  nameTH: string;
  rank: 'C' | 'B' | 'A' | 'S';
  hp: number;
  ac: number;
  atk: number[];
  atkType: string;
  target: string;
  vulnerable: string[];
  resistant: string[];
  immune: string[];
  lootLoc: number;
  drops: { name: string; chance: number }[];
  aoe?: { every: number; dice: number[]; type: string };
  selfHeal?: { every: number; dice: number[] };
  drain?: { every: number; dice: number[] };
  phase2?: { hp: number; atk: number[] };
  special?: string;
  cooldown: number;
}

export interface DuoConfig {
  name: string;
  nameTH: string;
  rank: 'S';
  lootLoc: number;
  drops: { name: string; chance: number }[];
  cooldown: number;
  queen: {
    name: string; hp: number; ac: number; atk: number[]; atkType: string;
    vulnerable: string[]; resistant: string[]; immune: string[];
    debuffEvery: number; buffKingEvery: number;
  };
  king: {
    name: string; hp: number; ac: number; atk: number[]; atkType: string;
    vulnerable: string[]; resistant: string[]; immune: string[];
    aoe: { every: number; dice: number[]; type: string };
  };
}

export interface BossConfig {
  name: string;
  nameTH: string;
  ac: number;
  atk: number[];
  atkType: string;
  vulnerable: string[];
  resistant: string[];
  immune: string[];
  aoe: { every: number; dice: number[]; type: string };
  rage: { every: number; dice: number[]; type: string; target: string };
}

export interface ShopItem {
  name: string;
  type: 'consumable' | 'passive' | 'skill_unlock' | 'temp_skill' | 'service';
  cost: number;
  effect: string;
  shop: 'standard' | 'secret' | 'both';
  forClass?: string;
}

// ============ CLASSES ============
export const CLASSES: CharClass[] = [
  {
    name: 'Fighter', hp: 22, ac: 7, emoji: '⚔️', color: '#f59e0b',
    equipment: ['ดาบ', 'โล่', 'ผ้าคลุม'],
    skills: [
      { name: 'Sword Slash', dice: [6, 4], dmgType: 'Physical', type: 'atk', description: 'Physical Damage 1d6+1d4' },
      { name: 'Shield Wall', dice: [], type: 'buff', description: 'เพิ่ม AC ทั้งทีม +2 เป็นเวลา 1 เทิร์น' },
      { name: 'Taunt', dice: [], type: 'buff', description: 'ล่อการโจมตีมอนฯ มาที่ตัวเอง 1 เทิร์น', unlock: true },
      { name: 'Second Wind', dice: [], type: 'selfheal', description: 'ฮีลตัวเอง 25% ของ Max HP (ปัดลง)', unlock: true },
      { name: 'Stun Strike', dice: [6, 6, 6, 4], dmgType: 'Physical', type: 'atk', description: 'Physical Damage 3d6+1d4 + Stun มอนฯ 1 เทิร์น', singleUse: true, stun: true },
    ],
  },
  {
    name: 'Priest', hp: 18, ac: 6, emoji: '📖', color: '#22c55e',
    equipment: ['หนังสือ/Tome', 'มงกุฏสวมหัว'],
    skills: [
      { name: 'Heal', dice: [6, 4], type: 'heal', description: 'ฮีล HP เพื่อน 1 คน = 1d6+1d4 HP' },
      { name: 'Amplify Damage', dice: [6], type: 'buff', description: 'บัฟ damage ตัวละคร 1 คน +1d6 เทิร์นถัดไป' },
      { name: 'Armor Break', dice: [], type: 'debuff', description: 'ลด AC มอนฯ ลงครึ่งหนึ่ง 1 เทิร์น', unlock: true },
      { name: 'Daze', dice: [], type: 'debuff', description: 'มอนฯ ติด Disadvantage 1 เทิร์น', unlock: true },
      { name: 'Empower', dice: [], type: 'buff', description: 'เพื่อน 1 คน ติด Advantage 1 เทิร์น', unlock: true },
    ],
  },
  {
    name: 'Mage', hp: 14, ac: 6, emoji: '🔮', color: '#3b82f6',
    equipment: ['หมวกแม่มด', 'คฑาเวทย์', 'ผ้าคลุม'],
    skills: [
      { name: 'Staff Strike', dice: [6], dmgType: 'Physical', type: 'atk', description: 'Physical Damage 1d6' },
      { name: 'Fireball', dice: [6, 4], dmgType: 'Fire', type: 'atk', description: 'Fire Damage 1d6+1d4 🔥' },
      { name: 'Frost Bolt', dice: [6, 4], dmgType: 'Frost', type: 'atk', description: 'Frost Damage 1d6+1d4 ❄️', unlock: true },
      { name: 'Lightning', dice: [6, 6], dmgType: 'Lightning', type: 'atk', description: 'Lightning Damage 2d6 ⚡', unlock: true },
      { name: 'Necrotic Blast', dice: [6, 6], dmgType: 'Necrotic', type: 'atk', description: 'Necrotic Damage 2d6 💀', unlock: true },
      { name: 'Holy Light', dice: [6, 6, 6], dmgType: 'Holy', type: 'atk', description: 'Holy Damage 3d6 🌟', unlock: true },
    ],
  },
];

// ============ MONSTERS ============
export const MONSTERS: Monster[] = [
  {
    id: 'goblin', name: 'Goblin Scout', nameTH: 'ก็อบลินลาดตระเวน', rank: 'C',
    hp: 14, ac: 5, atk: [6, 4], atkType: 'Physical', target: 'lowest_hp',
    vulnerable: [], resistant: [], immune: [], lootLoc: 15, cooldown: 2,
    drops: [{ name: 'Potion of Healing', chance: 0.5 }],
    special: 'เคลื่อนที่เร็ว แต่อ่อนแอ เหมาะฟาร์มเงิน',
  },
  {
    id: 'skeleton', name: 'Skeleton Warrior', nameTH: 'โครงกระดูกนักรบ', rank: 'C',
    hp: 16, ac: 6, atk: [6, 6], atkType: 'Physical', target: 'last_attacker',
    vulnerable: [], resistant: [], immune: ['Necrotic'], lootLoc: 20, cooldown: 2,
    aoe: { every: 2, dice: [6, 4], type: 'Physical' },
    drops: [
      { name: 'Scroll: Frost Bolt', chance: 0.4 },
      { name: 'Scroll: Daze', chance: 0.3 },
      { name: 'Scroll: Armor Break', chance: 0.1 },
    ],
    special: 'Undead - สกิล Heal ถ้าใช้กับมอนฯ ตัวนี้ จะทำ damage x2 แทน | AoE ทุก 2 เทิร์น',
  },
  {
    id: 'slime', name: 'Slime', nameTH: 'สไลม์เหนียว', rank: 'C',
    hp: 12, ac: 5, atk: [6, 4], atkType: 'Physical', target: 'first_init',
    vulnerable: [], resistant: [], immune: [], lootLoc: 20, cooldown: 2,
    drops: [{ name: 'Random Scroll', chance: 0.2 }],
    special: 'ทำให้มึนงง (Disadvantage) | ตาย 3 ครั้ง (รวมทุกทีม) = Slime King',
  },
  {
    id: 'slime_king', name: 'Slime King', nameTH: 'ราชาสไลม์', rank: 'A',
    hp: 48, ac: 12, atk: [6, 6], atkType: 'Physical', target: 'init_cycle',
    vulnerable: ['Lightning'], resistant: ['Physical'], immune: ['Frost'],
    lootLoc: 70, cooldown: 0,
    drops: [
      { name: 'Random Item', chance: 1 },
      { name: 'Random Scroll', chance: 1 },
    ],
    special: 'Slime วิวัฒนาการ! โจมตีวนตาม Initiative สูง→ต่ำ | ฆ่าแล้วกลับเป็น Slime ปกติ รีเซ็ตตัวนับ',
  },
  {
    id: 'dark_knight', name: 'Dark Knight', nameTH: 'อัศวินทมิฬ', rank: 'B',
    hp: 20, ac: 6, atk: [6, 6, 4], atkType: 'Physical', target: 'last_attacker',
    vulnerable: ['Holy', 'Lightning'], resistant: ['Physical'], immune: ['Necrotic'],
    lootLoc: 30, cooldown: 3,
    aoe: { every: 2, dice: [6, 4], type: 'Physical' },
    drops: [
      { name: 'Scroll: Lightning', chance: 0.4 },
      { name: 'Iron Ring', chance: 0.3 },
      { name: 'Scroll: Armor Break', chance: 0.2 },
    ],
    special: 'เกราะหนัก AC สูง ต้องใช้ Armor Break หรือ Elemental',
  },
  {
    id: 'flame_serpent', name: 'Flame Serpent', nameTH: 'งูเพลิง', rank: 'B',
    hp: 28, ac: 8, atk: [6, 6], atkType: 'Fire', target: 'highest_hp',
    vulnerable: ['Frost'], resistant: [], immune: ['Fire'],
    lootLoc: 45, cooldown: 3,
    selfHeal: { every: 3, dice: [4] },
    drops: [
      { name: 'Scroll: Necrotic Blast', chance: 0.3 },
      { name: 'Potion of Healing', chance: 1 },
      { name: 'Scroll: Daze', chance: 0.3 },
    ],
    special: 'ฮีลตัวเองทุก 3 เทิร์น | Immune ต่อ Fire (ฮีลถ้าโดนไฟ)',
  },
  {
    id: 'lich', name: 'Lich King', nameTH: 'พ่อมดมรณะ', rank: 'A',
    hp: 24, ac: 7, atk: [6, 6], atkType: 'Necrotic', target: 'most_dmg',
    vulnerable: ['Fire', 'Holy'], resistant: ['Frost'], immune: ['Necrotic'],
    lootLoc: 60, cooldown: 5,
    drain: { every: 2, dice: [6, 4] },
    phase2: { hp: 12, atk: [6, 6, 6] },
    drops: [{ name: 'Lich Crown', chance: 1 }],
    special: 'ดูด HP ฮีลตัวเอง | Phase 2: ฟื้นด้วย 10 HP หลังตาย โจมตีแรงขึ้น',
  },
];

// ============ DUO ============
export const DUO: DuoConfig = {
  name: 'Queen Divine & King Conquer', nameTH: 'ราชินีแดนสรวง & ราชาผู้พิชิต',
  rank: 'S', lootLoc: 100, cooldown: 10,
  drops: [
    { name: 'Scroll: Holy Light', chance: 1 },
    { name: 'Phoenix Feather', chance: 1 },
  ],
  queen: {
    name: 'Queen Divine', hp: 16, ac: 4, atk: [6, 6], atkType: 'Holy',
    vulnerable: ['Necrotic'], resistant: ['Frost'], immune: ['Holy', 'Physical'],
    debuffEvery: 2, buffKingEvery: 3,
  },
  king: {
    name: 'King Conquer', hp: 24, ac: 7, atk: [6, 6, 4], atkType: 'Physical',
    vulnerable: ['Holy', 'Lightning'], resistant: ['Frost', 'Necrotic', 'Fire'], immune: [],
    aoe: { every: 3, dice: [6, 6], type: 'Physical' },
  },
};

// ============ BOSS ============
export const BOSS: BossConfig = {
  name: 'Infernal Demon Lord', nameTH: 'ราชาปีศาจนรก',
  ac: 8, atk: [6, 6, 6], atkType: 'Fire',
  vulnerable: ['Holy'], resistant: ['Physical', 'Lightning'], immune: ['Necrotic', 'Fire'],
  aoe: { every: 2, dice: [6, 6], type: 'Fire' },
  rage: { every: 4, dice: [6, 6, 6, 6], type: 'Fire', target: 'lowest_ac' },
};

// ============ SHOP ITEMS ============
export const SHOP_ITEMS: ShopItem[] = [
  { name: 'Potion of Healing', type: 'consumable', cost: 15, effect: 'ฮีล HP 1 ตัว = 2d4 HP', shop: 'standard' },
  { name: 'Full Heal', type: 'service', cost: 30, effect: 'ฮีล HP ทั้งทีมเต็ม (0 LOC หาก TPK)', shop: 'both' },
  { name: 'Iron Ring', type: 'passive', cost: 25, effect: 'เพิ่ม AC ทั้งทีม +1 ตลอดเกม', shop: 'standard' },
  { name: 'Fire Resist Cloak', type: 'passive', cost: 25, effect: 'ลด Fire Damage -1 ตลอดเกม (ทั้งทีม)', shop: 'standard' },
  { name: 'Scroll: Taunt', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Taunt ให้ Fighter (ถาวร)', shop: 'standard', forClass: 'Fighter' },
  { name: 'Scroll: Second Wind', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Second Wind ให้ Fighter (ถาวร)', shop: 'secret', forClass: 'Fighter' },
  { name: 'Scroll: Frost Bolt', type: 'skill_unlock', cost: 30, effect: 'ปลดล็อค Frost Bolt ให้ Mage (ถาวร)', shop: 'standard', forClass: 'Mage' },
  { name: 'Scroll: Lightning', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Lightning ให้ Mage (ถาวร)', shop: 'secret', forClass: 'Mage' },
  { name: 'Scroll: Necrotic Blast', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Necrotic Blast ให้ Mage (ถาวร)', shop: 'secret', forClass: 'Mage' },
  { name: 'Scroll: Armor Break', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Armor Break ให้ Priest (ถาวร)', shop: 'secret', forClass: 'Priest' },
  { name: 'Scroll: Daze', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Daze ให้ Priest (ถาวร)', shop: 'standard', forClass: 'Priest' },
  { name: 'Scroll: Empower', type: 'skill_unlock', cost: 40, effect: 'ปลดล็อค Empower ให้ Priest (ถาวร)', shop: 'standard', forClass: 'Priest' },
  { name: 'Scroll: Stun Strike', type: 'temp_skill', cost: 20, effect: 'ใช้ Stun Strike 1 ครั้ง (หายหลังใช้)', shop: 'secret', forClass: 'Fighter' },
  { name: 'Elixir of Power', type: 'consumable', cost: 20, effect: 'ตัวละคร 1 ตัว ได้ Advantage 2 เทิร์น', shop: 'secret' },
  { name: 'Phoenix Feather', type: 'consumable', cost: 35, effect: 'ชุบชีวิตตัวละครที่ตาย กลับมา HP เต็ม', shop: 'secret' },
  { name: 'Holy Water', type: 'consumable', cost: 15, effect: 'ทำ Holy Damage 2d6 (ใครก็ใช้ได้)', shop: 'secret' },
  { name: 'Whetstone', type: 'consumable', cost: 15, effect: 'เพิ่ม damage ครั้งถัดไป +3 (Fighter)', shop: 'standard', forClass: 'Fighter' },
  { name: 'Stun Bomb', type: 'consumable', cost: 30, effect: 'Stun มอนฯ 1 เทิร์น (ใครก็ใช้ได้)', shop: 'standard' },
];

// ============ DAMAGE TYPE COLORS ============
export const DMG_COLORS: Record<string, string> = {
  Physical: '#94a3b8',
  Fire: '#ef4444',
  Frost: '#3b82f6',
  Lightning: '#eab308',
  Necrotic: '#8b5cf6',
  Holy: '#fbbf24',
};

export const DMG_EMOJI: Record<string, string> = {
  Physical: '🗡️',
  Fire: '🔥',
  Frost: '❄️',
  Lightning: '⚡',
  Necrotic: '💀',
  Holy: '🌟',
};

// ============ ATTACK ROLL RULES ============
// 2d6 system:
// Roll 2 (snake eyes) = Critical Failure → auto miss (0 damage)
// Roll < AC = Glancing Blow → damage / 2 (min 1)
// Roll >= AC = Normal Hit → full damage
// Roll 12 (boxcars) = Critical Hit → damage × 2
export const ATTACK_RULES = {
  critFail: 2,
  critHit: 12,
  glancingMultiplier: 0.5,
  critMultiplier: 2,
};

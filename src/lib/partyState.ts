import { CLASSES } from '@/data/gameData';

export const PARTY_CLASS_IDS = ['fighter', 'priest', 'mage'] as const;
export type PartyClassId = typeof PARTY_CLASS_IDS[number];

export interface PartyBuffs {
  lichCrown: boolean;
  resistantCloak: boolean;
  ironRing: Record<PartyClassId, boolean>;
}

export interface PartyState {
  hp: Record<PartyClassId, number>;
  buffs: PartyBuffs;
}

const HP_KEY = (id: PartyClassId) => `loc-dnd-hp-${id}`;
const BUFF_LICH = 'loc-dnd-buff-lich-crown';
const BUFF_CLOAK = 'loc-dnd-buff-resistant-cloak';
const BUFF_RING = (id: PartyClassId) => `loc-dnd-buff-iron-ring-${id}`;

const LICH_CROWN_HP_BONUS = 5;
const IRON_RING_AC_BONUS = 1;

const classById = Object.fromEntries(CLASSES.map(c => [c.name.toLowerCase(), c])) as Record<PartyClassId, typeof CLASSES[number]>;

const safeGet = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const safeSet = (key: string, val: string) => { try { localStorage.setItem(key, val); } catch {} };

export function effectiveMaxHp(id: PartyClassId, buffs: PartyBuffs): number {
  return classById[id].hp + (buffs.lichCrown ? LICH_CROWN_HP_BONUS : 0);
}

export function effectiveAc(id: PartyClassId, buffs: PartyBuffs): number {
  return classById[id].ac + (buffs.ironRing[id] ? IRON_RING_AC_BONUS : 0);
}

export function loadPartyState(): PartyState {
  const buffs: PartyBuffs = {
    lichCrown: safeGet(BUFF_LICH) === '1',
    resistantCloak: safeGet(BUFF_CLOAK) === '1',
    ironRing: {
      fighter: safeGet(BUFF_RING('fighter')) === '1',
      priest: safeGet(BUFF_RING('priest')) === '1',
      mage: safeGet(BUFF_RING('mage')) === '1',
    },
  };

  const hp = {} as Record<PartyClassId, number>;
  for (const id of PARTY_CLASS_IDS) {
    const stored = safeGet(HP_KEY(id));
    const max = effectiveMaxHp(id, buffs);
    const parsed = stored != null ? parseInt(stored) : NaN;
    hp[id] = Number.isFinite(parsed) ? Math.max(0, Math.min(max, parsed)) : max;
  }

  return { hp, buffs };
}

export function savePartyHp(id: PartyClassId, value: number) {
  safeSet(HP_KEY(id), String(value));
}

export function savePartyBuff(
  key: 'lichCrown' | 'resistantCloak' | 'ironRing',
  value: boolean | Record<PartyClassId, boolean>,
) {
  if (key === 'lichCrown') safeSet(BUFF_LICH, value ? '1' : '0');
  else if (key === 'resistantCloak') safeSet(BUFF_CLOAK, value ? '1' : '0');
  else if (key === 'ironRing' && typeof value === 'object') {
    for (const id of PARTY_CLASS_IDS) safeSet(BUFF_RING(id), value[id] ? '1' : '0');
  }
}

export function resetPartyHpToFull(state: PartyState): PartyState {
  const hp = {} as Record<PartyClassId, number>;
  for (const id of PARTY_CLASS_IDS) hp[id] = effectiveMaxHp(id, state.buffs);
  return { ...state, hp };
}

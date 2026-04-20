'use client';
import { useState, useEffect } from 'react';
import { CLASSES, MONSTERS, DUO, BOSS } from '@/data/gameData';
import {
  PARTY_CLASS_IDS,
  type PartyClassId,
  type PartyState,
  loadPartyState,
  savePartyHp,
  effectiveMaxHp,
  effectiveAc,
  resetPartyHpToFull,
} from '@/lib/partyState';

// === Types ===
interface Combatant {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  ac: number;
  type: 'player' | 'monster';
  initiative: number;
  rollOrder: number;
  color: string;
  emoji: string;
  cardId: string;
}

interface FightResult {
  outcome: 'victory' | 'boss_end' | 'tpk' | 'duo_end';
  loc: number;
  items: string[];
  dmgThisFight: number;
}

// === Helpers ===
const BOSS_KEY = 'loc-dnd-boss-dmg';
const DUO_KEY = 'loc-dnd-duo-dmg';
const loadNum = (key: string) => { try { return parseInt(localStorage.getItem(key) || '0') || 0; } catch { return 0; } };
const saveNum = (key: string, val: number) => { try { localStorage.setItem(key, String(val)); } catch {} };

const MON_EMOJI: Record<string, string> = {
  goblin: '🗡️', skeleton: '💀', slime: '🟢', slime_king: '👑',
  dark_knight: '⚔️', flame_serpent: '🐍', lich: '☠️',
  queen: '👸', king: '🤴', boss: '👹',
};

// === Card Placeholder ===
// Card images go in /public/cards/{monsters|classes|items}/{id}.png
// Standard boardgame card ratio: 63.5mm × 88mm (greywolf sleeve size)
function CardAvatar({ cardId, type, emoji, size = 'md' }: { cardId: string; type: string; emoji: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const path = `/cards/${type}/${cardId}.png`;
  const w = size === 'sm' ? 'w-12' : size === 'md' ? 'w-20' : 'w-28';

  return (
    <div className={`${w} shrink-0 rounded-lg overflow-hidden bg-gradient-to-b from-slate-700/40 to-slate-900/60 border border-slate-700/30 flex items-center justify-center`}
      style={{ aspectRatio: '63.5/88' }}>
      <img src={path} alt={cardId}
        className={`w-full h-full object-cover ${imgLoaded ? '' : 'hidden'}`}
        onLoad={() => setImgLoaded(true)}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      {!imgLoaded && (
        <div className="flex flex-col items-center gap-0.5">
          <span className={size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-5xl'}>{emoji}</span>
          <span className="text-[6px] text-slate-600 tracking-widest uppercase">card</span>
        </div>
      )}
    </div>
  );
}

// === Monster options ===
const monsterOptions = [
  ...MONSTERS.map(m => ({ id: m.id, name: m.name, nameTH: m.nameTH, rank: m.rank, hp: m.hp, ac: m.ac, emoji: MON_EMOJI[m.id] || '👾', drops: m.drops, lootLoc: m.lootLoc })),
  { id: 'duo', name: 'Queen & King (Duo)', nameTH: DUO.nameTH, rank: 'S' as const, hp: DUO.queen.hp + DUO.king.hp, ac: 0, emoji: '👑', drops: DUO.drops, lootLoc: DUO.lootLoc },
  { id: 'boss', name: BOSS.name, nameTH: BOSS.nameTH, rank: 'Boss' as const, hp: 9999, ac: BOSS.ac, emoji: '👹', drops: [] as { name: string; chance: number }[], lootLoc: 0 },
];

const rankColor = (r: string) => r === 'C' ? '#22c55e' : r === 'B' ? '#3b82f6' : r === 'A' ? '#ef4444' : r === 'S' ? '#a78bfa' : '#f59e0b';

// === Main Component ===
export default function CombatTracker() {
  const [phase, setPhase] = useState<'select' | 'initiative' | 'fight' | 'result'>('select');
  const [selectedId, setSelectedId] = useState('');
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [round, setRound] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [fightDmg, setFightDmg] = useState(0);
  const [bossDmg, setBossDmg] = useState(0);
  const [duoDmg, setDuoDmg] = useState(0);
  const [result, setResult] = useState<FightResult | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [party, setParty] = useState<PartyState | null>(null);

  useEffect(() => {
    setBossDmg(loadNum(BOSS_KEY));
    setDuoDmg(loadNum(DUO_KEY));
    setParty(loadPartyState());
  }, []);

  // === Enter Initiative Phase (manual entry) ===
  const enterInitiative = () => {
    if (!selectedId) return;
    let order = 0;
    const list: Combatant[] = [];

    // Monsters listed first (they roll first physically)
    if (selectedId === 'duo') {
      list.push({ id: 'queen', name: 'Queen Divine', maxHp: DUO.queen.hp, hp: DUO.queen.hp, ac: DUO.queen.ac, type: 'monster', initiative: 0, rollOrder: order++, color: '#a78bfa', emoji: '👸', cardId: 'queen' });
      list.push({ id: 'king', name: 'King Conquer', maxHp: DUO.king.hp, hp: DUO.king.hp, ac: DUO.king.ac, type: 'monster', initiative: 0, rollOrder: order++, color: '#ef4444', emoji: '🤴', cardId: 'king' });
    } else if (selectedId === 'boss') {
      list.push({ id: 'boss', name: BOSS.name, maxHp: 9999, hp: 9999, ac: BOSS.ac, type: 'monster', initiative: 0, rollOrder: order++, color: '#ef4444', emoji: '👹', cardId: 'boss' });
    } else {
      const m = MONSTERS.find(x => x.id === selectedId)!;
      list.push({ id: 'monster', name: m.name, maxHp: m.hp, hp: m.hp, ac: m.ac, type: 'monster', initiative: 0, rollOrder: order++, color: '#ef4444', emoji: MON_EMOJI[m.id] || '👾', cardId: m.id });
    }

    // Players listed after monsters — always reload persisted HP + buffs
    const current = loadPartyState();
    setParty(current);
    for (const cls of CLASSES) {
      const id = cls.name.toLowerCase() as PartyClassId;
      const maxHp = effectiveMaxHp(id, current.buffs);
      const ac = effectiveAc(id, current.buffs);
      const hp = Math.max(0, Math.min(maxHp, current.hp[id]));
      list.push({ id, name: cls.name, maxHp, hp, ac, type: 'player', initiative: 0, rollOrder: order++, color: cls.color, emoji: cls.emoji, cardId: id });
    }

    setCombatants(list);
    setPhase('initiative');
  };

  const setInitiative = (id: string, val: number) => {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, initiative: val } : c));
  };

  const sortByInitiative = () => {
    // Tie-break by rollOrder (insertion order): monsters are inserted first, so
    // on equal initiative rolls, monsters act before players.
    setCombatants(prev => [...prev].sort((a, b) => b.initiative - a.initiative || a.rollOrder - b.rollOrder));
  };

  const startFight = () => {
    setPhase('fight');
    setRound(1);
    setCurrentIdx(0);
    setFightDmg(0);
    setLog(['⚔️ Fight started!']);
  };

  // === Adjust HP ===
  const adjustHp = (id: string, delta: number) => {
    const target = combatants.find(c => c.id === id);
    if (!target) return;

    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newHp = c.maxHp === 9999 ? c.hp + delta : Math.min(c.maxHp, Math.max(0, c.hp + delta));
      if (c.type === 'player' && PARTY_CLASS_IDS.includes(c.id as PartyClassId)) {
        savePartyHp(c.id as PartyClassId, newHp);
      }
      return { ...c, hp: newHp };
    }));

    if (delta < 0) {
      const newHp = target.maxHp === 9999 ? target.hp + delta : Math.max(0, target.hp + delta);
      setLog(prev => [`🔻 ${target.name} -${Math.abs(delta)} → ${newHp} HP`, ...prev.slice(0, 30)]);

      if (target.type === 'monster') {
        const abs = Math.abs(delta);
        setFightDmg(p => p + abs);
        if (selectedId === 'boss') setBossDmg(p => { const n = p + abs; saveNum(BOSS_KEY, n); return n; });
        if (selectedId === 'duo') setDuoDmg(p => { const n = p + abs; saveNum(DUO_KEY, n); return n; });
      }
    } else {
      const newHp = Math.min(target.maxHp, target.hp + delta);
      setLog(prev => [`💚 ${target.name} +${delta} → ${newHp} HP`, ...prev.slice(0, 30)]);
    }
  };

  // === Next Turn ===
  const nextTurn = () => {
    const alive = combatants.filter(c => c.hp > 0);
    if (alive.length === 0) return;
    let next = (currentIdx + 1) % combatants.length;
    while (combatants[next]?.hp <= 0 && next !== currentIdx) {
      next = (next + 1) % combatants.length;
    }
    if (next <= currentIdx) setRound(r => r + 1);
    setCurrentIdx(next);
  };

  // === End Fight ===
  const endFight = () => {
    const allMonsDead = combatants.filter(c => c.type === 'monster').every(c => c.hp <= 0);
    const allPlayersDead = combatants.filter(c => c.type === 'player').every(c => c.hp <= 0);

    if (selectedId === 'boss') {
      setResult({ outcome: 'boss_end', loc: 0, items: [], dmgThisFight: fightDmg });
      setPhase('result');
      return;
    }

    if (selectedId === 'duo' && !allMonsDead) {
      // Duo not fully defeated — show damage dealt
      setResult({ outcome: 'duo_end', loc: 0, items: [], dmgThisFight: fightDmg });
      setPhase('result');
      return;
    }

    if (allMonsDead) {
      const opt = monsterOptions.find(m => m.id === selectedId);
      const items: string[] = [];
      for (const drop of (opt?.drops || [])) {
        if (Math.random() < drop.chance) items.push(drop.name);
      }
      setResult({ outcome: 'victory', loc: opt?.lootLoc || 0, items, dmgThisFight: fightDmg });
      setPhase('result');
      return;
    }

    if (allPlayersDead) {
      // TPK rule: team is healed to full (free) — persist it
      if (party) {
        const healed = resetPartyHpToFull(party);
        for (const id of PARTY_CLASS_IDS) savePartyHp(id, healed.hp[id]);
        setParty(healed);
      }
      setResult({ outcome: 'tpk', loc: 0, items: [], dmgThisFight: fightDmg });
      setPhase('result');
      return;
    }

    // Manual end / flee
    resetAll();
  };

  const resetAll = () => {
    setPhase('select');
    setCombatants([]);
    setLog([]);
    setResult(null);
    setFightDmg(0);
  };

  const resetDmgCounters = () => {
    setBossDmg(0); setDuoDmg(0);
    saveNum(BOSS_KEY, 0); saveNum(DUO_KEY, 0);
    setConfirmReset(false);
  };

  const totalAccDmg = bossDmg + duoDmg;
  const quickDmg = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
  const quickHeal = [1, 2, 3, 4, 5, 6, 8, 10];

  // ==================== SELECT PHASE ====================
  if (phase === 'select') return (
    <div>
      {/* Accumulated Damage Banner */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Victory Damage</div>
            <div className="text-2xl font-extrabold text-amber-400">{totalAccDmg}</div>
            <div className="text-[10px] text-slate-500">Boss: <span className="text-red-400">{bossDmg}</span> | Duo: <span className="text-purple-400">{duoDmg}</span></div>
          </div>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="px-3 py-1.5 rounded-lg text-[10px] text-slate-500 border border-slate-700 hover:border-red-500/50 hover:text-red-400">Reset</button>
          ) : (
            <div className="flex gap-1">
              <button onClick={resetDmgCounters} className="px-3 py-1.5 rounded-lg text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">Confirm</button>
              <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-[10px] text-slate-500 border border-slate-700">Cancel</button>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-4">⚔️ เลือกมอนสเตอร์</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {monsterOptions.map(m => (
          <button key={m.id} onClick={() => setSelectedId(m.id)}
            className={`rounded-xl border overflow-hidden transition-all text-left ${selectedId === m.id ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-amber-500/5' : 'border-[#1e293b] bg-[#111827] hover:border-slate-600'}`}>
            <CardAvatar cardId={m.id === 'duo' ? 'duo' : m.id === 'boss' ? 'boss' : m.id} type="monsters" emoji={m.emoji} size="lg" />
            <div className="p-2">
              <div className="text-xs font-bold text-white truncate">{m.name}</div>
              <div className="text-[9px] text-slate-500 truncate">{m.nameTH}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: rankColor(m.rank) + '22', color: rankColor(m.rank) }}>
                  {m.rank}
                </span>
                <span className="text-[9px] text-slate-500">HP:{m.hp === 9999 ? '∞' : m.hp}</span>
                {m.ac > 0 && <span className="text-[9px] text-slate-500">AC:{m.ac}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={enterInitiative} disabled={!selectedId}
        className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed">
        🎲 ใส่ Initiative
      </button>
    </div>
  );

  // ==================== INITIATIVE PHASE ====================
  if (phase === 'initiative') {
    const allFilled = combatants.every(c => c.initiative >= 2);
    return (
      <div>
        <h2 className="text-lg font-bold text-white mb-1">🎲 ใส่ค่า Initiative (2d6)</h2>
        <p className="text-[11px] text-slate-500 mb-4">มอนฯ ทอยก่อน → นักเรียนทอยตาม ใส่ค่าที่ทอยได้ (2-12)</p>
        <div className="space-y-2 mb-4">
          {combatants.map((c) => (
            <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${c.type === 'monster' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#111827] border-[#1e293b]'}`}>
              <CardAvatar cardId={c.cardId} type={c.type === 'monster' ? 'monsters' : 'classes'} emoji={c.emoji} size="sm" />
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: c.color }}>{c.name}</div>
                <div className="text-[10px] text-slate-500">
                  {c.type === 'monster' ? '👾 มอนสเตอร์' : '👤 ผู้เล่น'} | AC: {c.ac}
                </div>
              </div>
              <input
                type="number"
                min={2} max={12}
                placeholder="2d6"
                value={c.initiative || ''}
                onChange={e => setInitiative(c.id, parseInt(e.target.value) || 0)}
                className="w-16 text-center text-xl font-extrabold text-amber-400 bg-[#0a0e1a] border border-[#334155] rounded-lg py-1 focus:border-amber-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button onClick={() => { sortByInitiative(); startFight(); }} disabled={!allFilled}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 disabled:opacity-30 disabled:cursor-not-allowed">
          ⚔️ เรียงลำดับ & เริ่มต่อสู้!
        </button>
        <button onClick={resetAll} className="mt-2 w-full py-2 rounded-xl text-xs text-slate-500 border border-[#1e293b]">← Back</button>
      </div>
    );
  }

  // ==================== RESULT PHASE ====================
  if (phase === 'result' && result) return (
    <div className="flex flex-col items-center justify-center py-8">
      {result.outcome === 'victory' && (
        <>
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-extrabold text-green-400 mb-1">Victory!</h2>
          <p className="text-[11px] text-slate-500 mb-4">Damage dealt: {result.dmgThisFight}</p>
          <div className="w-full max-w-sm p-4 rounded-xl bg-[#111827] border border-[#1e293b]">
            <div className="text-center mb-3">
              <span className="text-3xl font-extrabold text-amber-400">💰 {result.loc} LOC</span>
            </div>
            {result.items.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {result.items.map((item, j) => (
                  <span key={j} className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">🎁 {item}</span>
                ))}
              </div>
            ) : (
              <p className="text-center text-[11px] text-slate-500">ไม่ได้ดรอปไอเทม (แค่เงิน)</p>
            )}
          </div>
        </>
      )}

      {result.outcome === 'boss_end' && (
        <>
          <div className="text-5xl mb-3">👹</div>
          <h2 className="text-xl font-extrabold text-red-400 mb-1">Boss Raid Ended</h2>
          <div className="w-full max-w-sm p-4 rounded-xl bg-[#111827] border border-[#1e293b] text-center space-y-2">
            <div><span className="text-[10px] text-slate-500">Damage This Raid</span><div className="text-2xl font-extrabold text-red-400">{result.dmgThisFight}</div></div>
            <div className="border-t border-[#1e293b] pt-2">
              <span className="text-[10px] text-slate-500">Total Accumulated</span>
              <div className="text-3xl font-extrabold text-amber-400">{totalAccDmg}</div>
              <div className="text-[10px] text-slate-500">Boss: {bossDmg} | Duo: {duoDmg}</div>
            </div>
          </div>
        </>
      )}

      {result.outcome === 'duo_end' && (
        <>
          <div className="text-5xl mb-3">👑</div>
          <h2 className="text-xl font-extrabold text-purple-400 mb-1">Duo Fight Ended</h2>
          <p className="text-[11px] text-slate-500 mb-4">Damage dealt: {result.dmgThisFight}</p>
          <div className="w-full max-w-sm p-4 rounded-xl bg-[#111827] border border-[#1e293b] text-center">
            <span className="text-[10px] text-slate-500">Total Accumulated</span>
            <div className="text-3xl font-extrabold text-amber-400">{totalAccDmg}</div>
          </div>
        </>
      )}

      {result.outcome === 'tpk' && (
        <>
          <div className="text-5xl mb-3">💀</div>
          <h2 className="text-xl font-extrabold text-red-500 mb-1">Total Party Kill!</h2>
          <div className="w-full max-w-sm p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center space-y-1">
            <p className="text-xs text-red-400">เงินหมด + เสียไอเทมสุ่ม 1 ชิ้น</p>
            <p className="text-xs text-green-400">ฮีล HP เต็มฟรี + เก็บสกิลถาวรทั้งหมด</p>
          </div>
        </>
      )}

      <button onClick={resetAll} className="mt-6 px-8 py-3 rounded-xl font-bold text-white bg-[#1e293b] border border-[#334155]">
        ✅ Done
      </button>
    </div>
  );

  // ==================== FIGHT PHASE ====================
  const activeBuffLabels: string[] = [];
  if (party?.buffs.lichCrown) activeBuffLabels.push('👑 +5 Max HP');
  if (party?.buffs.resistantCloak) activeBuffLabels.push('🧥 Dmg -1');
  if (party) {
    const ringCount = PARTY_CLASS_IDS.filter(id => party.buffs.ironRing[id]).length;
    if (ringCount > 0) activeBuffLabels.push(`💍 Iron Ring x${ringCount}`);
  }

  return (
    <div>
      {activeBuffLabels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {activeBuffLabels.map(l => (
            <span key={l} className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">{l}</span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <span className="text-xs text-slate-500">Round</span>
          <span className="text-2xl font-extrabold text-white ml-2">{round}</span>
        </div>
        {(selectedId === 'boss' || selectedId === 'duo') && (
          <div className="text-center">
            <div className="text-[10px] text-slate-500">This Fight</div>
            <div className="text-lg font-extrabold text-red-400">{fightDmg}</div>
            <div className="text-[9px] text-slate-500">Total: {totalAccDmg}</div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={nextTurn} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Next →</button>
          <button onClick={endFight} className="px-4 py-2 rounded-lg bg-[#1e293b] text-slate-400 text-xs font-bold border border-[#334155]">จบไฟท์</button>
        </div>
      </div>

      {/* Combatant Cards */}
      <div className="space-y-3">
        {combatants.map((c, idx) => {
          const hpPct = c.maxHp === 9999 ? 100 : Math.max(0, (c.hp / c.maxHp) * 100);
          const isDead = c.hp <= 0;
          const isActive = idx === currentIdx;
          const barColor = isDead ? '#334155' : c.type === 'monster' ? '#ef4444' : hpPct < 30 ? '#ef4444' : '#22c55e';

          return (
            <div key={c.id} className={`rounded-xl border p-3 transition-all ${isActive ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20' : isDead ? 'border-[#1e293b] opacity-40' : 'border-[#1e293b] bg-[#111827]'}`}>
              {/* Card header */}
              <div className="flex items-center gap-3 mb-2">
                <CardAvatar cardId={c.cardId} type={c.type === 'monster' ? 'monsters' : 'classes'} emoji={c.emoji} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isActive && <span className="text-amber-400 animate-pulse text-sm">▶</span>}
                    <span className="text-sm font-bold truncate" style={{ color: isDead ? '#475569' : c.color }}>{c.name}</span>
                    {isDead && <span className="text-[9px] text-red-500 font-bold shrink-0">DEAD</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded font-bold">Init {c.initiative}</span>
                    <span className="text-blue-400">AC {c.ac}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold" style={{ color: isDead ? '#475569' : hpPct < 30 ? '#ef4444' : '#e2e8f0' }}>
                    {c.maxHp === 9999 ? '∞' : c.hp}
                  </span>
                  {c.maxHp !== 9999 && <span className="text-[10px] text-slate-500">/{c.maxHp}</span>}
                </div>
              </div>

              {/* HP Bar */}
              {c.maxHp !== 9999 && (
                <div className="h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${hpPct}%`, background: barColor }} />
                </div>
              )}

              {/* Damage buttons */}
              <div className="flex flex-wrap gap-1">
                {quickDmg.map(d => (
                  <button key={`d${d}`} onClick={() => adjustHp(c.id, -d)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95">-{d}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {quickHeal.map(d => (
                  <button key={`h${d}`} onClick={() => adjustHp(c.id, d)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 active:scale-95">+{d}</button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex gap-1 mt-1">
                <input type="number" placeholder="custom" className="flex-1 px-2 py-1 rounded text-[10px] bg-[#0a0e1a] border border-[#1e293b] text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value);
                      if (val) { adjustHp(c.id, -val); (e.target as HTMLInputElement).value = ''; }
                    }
                  }} />
                <button onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const val = parseInt(input?.value);
                  if (val) { adjustHp(c.id, -val); input.value = ''; }
                }} className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">Dmg</button>
                <button onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling?.previousElementSibling as HTMLInputElement;
                  const val = parseInt(input?.value);
                  if (val) { adjustHp(c.id, val); input.value = ''; }
                }} className="px-2 py-1 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">Heal</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combat Log */}
      <div className="mt-4 bg-[#111827] border border-[#1e293b] rounded-xl p-3 max-h-40 overflow-y-auto">
        <h3 className="text-[10px] text-slate-500 font-bold mb-2">COMBAT LOG</h3>
        {log.map((l, i) => (
          <p key={i} className="text-[10px] text-slate-400 leading-5">{l}</p>
        ))}
      </div>
    </div>
  );
}

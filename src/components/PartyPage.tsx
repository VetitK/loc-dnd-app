'use client';
import { useState, useEffect } from 'react';
import { CLASSES } from '@/data/gameData';
import {
  PARTY_CLASS_IDS,
  type PartyClassId,
  loadPartyState,
  savePartyHp,
  savePartyBuff,
  effectiveMaxHp,
  effectiveAc,
  resetPartyHpToFull,
  type PartyState,
} from '@/lib/partyState';

const CLASS_BY_ID = Object.fromEntries(CLASSES.map(c => [c.name.toLowerCase(), c])) as Record<PartyClassId, typeof CLASSES[number]>;

export default function PartyPage() {
  const [state, setState] = useState<PartyState | null>(null);
  const [customInput, setCustomInput] = useState<Record<PartyClassId, string>>({ fighter: '', priest: '', mage: '' });
  const [confirmFullHeal, setConfirmFullHeal] = useState(false);

  useEffect(() => { setState(loadPartyState()); }, []);

  if (!state) return <div className="text-slate-500 text-sm">Loading...</div>;

  const applyHp = (id: PartyClassId, delta: number) => {
    setState(prev => {
      if (!prev) return prev;
      const maxHp = effectiveMaxHp(id, prev.buffs);
      const newHp = Math.max(0, Math.min(maxHp, prev.hp[id] + delta));
      savePartyHp(id, newHp);
      return { ...prev, hp: { ...prev.hp, [id]: newHp } };
    });
  };

  const setHpDirect = (id: PartyClassId, value: number) => {
    setState(prev => {
      if (!prev) return prev;
      const maxHp = effectiveMaxHp(id, prev.buffs);
      const newHp = Math.max(0, Math.min(maxHp, value));
      savePartyHp(id, newHp);
      return { ...prev, hp: { ...prev.hp, [id]: newHp } };
    });
  };

  const fullHealAll = () => {
    setState(prev => {
      if (!prev) return prev;
      const next = resetPartyHpToFull(prev);
      for (const id of PARTY_CLASS_IDS) savePartyHp(id, next.hp[id]);
      return next;
    });
    setConfirmFullHeal(false);
  };

  const toggleFlag = (key: 'lichCrown' | 'resistantCloak') => {
    setState(prev => {
      if (!prev) return prev;
      const nextVal = !prev.buffs[key];
      const nextBuffs = { ...prev.buffs, [key]: nextVal };
      const nextHp = { ...prev.hp };
      if (key === 'lichCrown' && !nextVal) {
        for (const id of PARTY_CLASS_IDS) {
          const newMax = effectiveMaxHp(id, nextBuffs);
          if (nextHp[id] > newMax) {
            nextHp[id] = newMax;
            savePartyHp(id, newMax);
          }
        }
      }
      savePartyBuff(key, nextVal);
      return { ...prev, buffs: nextBuffs, hp: nextHp };
    });
  };

  const toggleRing = (id: PartyClassId) => {
    setState(prev => {
      if (!prev) return prev;
      const nextRing = { ...prev.buffs.ironRing, [id]: !prev.buffs.ironRing[id] };
      const nextBuffs = { ...prev.buffs, ironRing: nextRing };
      savePartyBuff('ironRing', nextRing);
      return { ...prev, buffs: nextBuffs };
    });
  };

  const quickDmg = [1, 2, 3, 5, 8];
  const quickHeal = [1, 2, 3, 5, 8];

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-1">❤️ ทีมของฉัน</h2>
      <p className="text-[11px] text-slate-500 mb-4">
        HP จะจำข้ามไฟท์ · ใช้หน้านี้สำหรับใช้ Potion, Full Heal, หรือปรับ HP นอกต่อสู้
      </p>

      <div className="mb-4 flex gap-2 flex-wrap">
        {!confirmFullHeal ? (
          <button onClick={() => setConfirmFullHeal(true)}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25">
            💚 Full Heal ทั้งทีม
          </button>
        ) : (
          <>
            <button onClick={fullHealAll}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
              ยืนยัน Full Heal
            </button>
            <button onClick={() => setConfirmFullHeal(false)}
              className="px-3 py-2 rounded-lg text-xs text-slate-500 border border-slate-700">
              ยกเลิก
            </button>
          </>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {PARTY_CLASS_IDS.map(id => {
          const cls = CLASS_BY_ID[id];
          const maxHp = effectiveMaxHp(id, state.buffs);
          const ac = effectiveAc(id, state.buffs);
          const hp = state.hp[id];
          const pct = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0;
          const barColor = hp <= 0 ? '#334155' : pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#22c55e';

          return (
            <div key={id} className="rounded-xl border border-[#1e293b] bg-[#111827] p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{cls.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: cls.color }}>{cls.name}</div>
                  <div className="flex gap-2 text-[10px] text-slate-500">
                    <span className="text-blue-400">AC {ac}{state.buffs.ironRing[id] ? ' (+1)' : ''}</span>
                    {state.buffs.lichCrown && <span className="text-purple-400">+5 Max HP</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold" style={{ color: pct < 30 ? '#ef4444' : '#e2e8f0' }}>
                    {hp}
                  </span>
                  <span className="text-xs text-slate-500">/{maxHp}</span>
                </div>
              </div>

              <div className="h-2 bg-[#0a0e1a] rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
              </div>

              <div className="flex flex-wrap gap-1">
                {quickDmg.map(d => (
                  <button key={`d${d}`} onClick={() => applyHp(id, -d)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95">-{d}</button>
                ))}
                {quickHeal.map(d => (
                  <button key={`h${d}`} onClick={() => applyHp(id, d)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 active:scale-95">+{d}</button>
                ))}
                <button onClick={() => setHpDirect(id, maxHp)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">MAX</button>
              </div>

              <div className="flex gap-1 mt-2">
                <input type="number" placeholder="จำนวน" value={customInput[id]}
                  onChange={e => setCustomInput(p => ({ ...p, [id]: e.target.value }))}
                  className="flex-1 px-2 py-1 rounded text-[10px] bg-[#0a0e1a] border border-[#1e293b] text-white" />
                <button onClick={() => { const v = parseInt(customInput[id]); if (v) { applyHp(id, -v); setCustomInput(p => ({ ...p, [id]: '' })); } }}
                  className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">Dmg</button>
                <button onClick={() => { const v = parseInt(customInput[id]); if (v) { applyHp(id, v); setCustomInput(p => ({ ...p, [id]: '' })); } }}
                  className="px-2 py-1 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">Heal</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-3">
        <h3 className="text-sm font-bold text-white mb-1">🛡️ Team Buffs / Items</h3>
        <p className="text-[10px] text-slate-500 mb-3">เปิด/ปิดตามที่ทีมได้ไอเทม — ผลจะ apply ตอนเข้าไฟท์</p>

        <div className="space-y-2">
          <label className="flex items-start gap-3 p-2 rounded-lg bg-[#0a0e1a] border border-[#1e293b] cursor-pointer">
            <input type="checkbox" checked={state.buffs.lichCrown} onChange={() => toggleFlag('lichCrown')}
              className="mt-0.5 w-4 h-4 accent-purple-500" />
            <div className="flex-1">
              <div className="text-xs font-bold text-purple-300">👑 Lich Crown</div>
              <div className="text-[10px] text-slate-500">+5 Max HP ทุกคนในทีม (ไม่ฮีล HP ปัจจุบัน)</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2 rounded-lg bg-[#0a0e1a] border border-[#1e293b] cursor-pointer">
            <input type="checkbox" checked={state.buffs.resistantCloak} onChange={() => toggleFlag('resistantCloak')}
              className="mt-0.5 w-4 h-4 accent-orange-500" />
            <div className="flex-1">
              <div className="text-xs font-bold text-orange-300">🧥 Resistant Cloak</div>
              <div className="text-[10px] text-slate-500">ลด Damage -1 ทั้งทีม ตลอดเกม (DM หักเองตอนมอนฯ โจมตี)</div>
            </div>
          </label>

          <div className="p-2 rounded-lg bg-[#0a0e1a] border border-[#1e293b]">
            <div className="text-xs font-bold text-amber-300 mb-0.5">💍 Iron Ring (+1 AC รายตัว · สูงสุด 1 ต่อคน)</div>
            <div className="text-[10px] text-slate-500 mb-2">แตะเพื่อสวม/ถอดรายคน</div>
            <div className="grid grid-cols-3 gap-2">
              {PARTY_CLASS_IDS.map(id => (
                <button key={id} type="button" onClick={() => toggleRing(id)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    state.buffs.ironRing[id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-600'
                  }`}>
                  {CLASS_BY_ID[id].emoji} {CLASS_BY_ID[id].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

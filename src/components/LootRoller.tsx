'use client';
import { useState } from 'react';
import { MONSTERS, DUO } from '@/data/gameData';

interface LootResult {
  loc: number;
  items: string[];
  rolledAt: Date;
}

export default function LootRoller() {
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState<LootResult[]>([]);
  const [rolling, setRolling] = useState(false);

  const allSources = [
    ...MONSTERS.map(m => ({ id: m.id, name: `${m.name} (Rank ${m.rank})`, loc: m.lootLoc, drops: m.drops })),
    { id: 'duo', name: `${DUO.name} (Rank S)`, loc: DUO.lootLoc, drops: DUO.drops },
  ];

  const rollLoot = () => {
    const src = allSources.find(s => s.id === selected);
    if (!src) return;
    setRolling(true);
    setTimeout(() => {
      const items: string[] = [];
      for (const drop of src.drops) {
        if (Math.random() < drop.chance) {
          items.push(drop.name);
        }
      }
      setResults(prev => [{ loc: src.loc, items, rolledAt: new Date() }, ...prev.slice(0, 19)]);
      setRolling(false);
    }, 600);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">🎲 Loot Randomizer</h2>
      <p className="text-[11px] text-slate-500 mb-4">เลือกมอนสเตอร์ที่ตาย แล้วกดทอยเพื่อสุ่มของดรอป DM แจ้งผลให้พี่มอนฯ หยิบการ์ดให้น้อง ๆ</p>

      {/* Monster selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {allSources.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)}
            className={`p-2 rounded-lg border text-left text-[11px] transition ${selected === s.id ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-[#111827] border-[#1e293b] text-slate-400 hover:border-slate-600'}`}>
            <div className="font-bold">{s.name}</div>
            <div className="text-[9px] text-slate-500">{s.loc} LOC | {s.drops.length} possible drops</div>
          </button>
        ))}
      </div>

      {/* Roll button */}
      <button onClick={rollLoot} disabled={!selected || rolling}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${rolling ? 'bg-[#1e293b] text-slate-500 animate-pulse' : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.01] active:scale-[0.99]'} ${!selected ? 'opacity-30 cursor-not-allowed' : ''}`}>
        {rolling ? '🎲 Rolling...' : '🎲 ทอยดรอป!'}
      </button>

      {/* Drop chances reference */}
      {selected && (
        <div className="mt-3 p-3 bg-[#111827] border border-[#1e293b] rounded-xl">
          <h4 className="text-[10px] text-slate-500 font-bold mb-2">โอกาสดรอป:</h4>
          {allSources.find(s => s.id === selected)?.drops.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1">
              <span className="text-slate-300">{d.name}</span>
              <span className="text-amber-400 font-bold">{(d.chance * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-500">ผลลัพธ์</h3>
          {results.map((r, i) => (
            <div key={i} className={`p-3 rounded-xl border ${i === 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-[#111827] border-[#1e293b]'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-amber-400 font-bold text-sm">💰 {r.loc} LOC</span>
                <span className="text-[9px] text-slate-600">{r.rolledAt.toLocaleTimeString('th-TH')}</span>
              </div>
              {r.items.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {r.items.map((item, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      🎁 {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500">ไม่ได้ดรอปไอเทม (แค่เงิน)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

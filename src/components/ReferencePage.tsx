'use client';
import { useState } from 'react';
import { CLASSES, MONSTERS, DUO, BOSS, SHOP_ITEMS, DMG_EMOJI, DMG_COLORS } from '@/data/gameData';

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#111827] border border-[#1e293b] rounded-xl p-4 ${className}`}>{children}</div>
);

const Badge = ({ text, color = '#64748b' }: { text: string; color?: string }) => (
  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: color + '22', color }}>{text}</span>
);

export default function ReferencePage() {
  const [section, setSection] = useState<'classes' | 'monsters' | 'items' | 'rules'>('classes');

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'classes', label: '👤 Classes' },
          { id: 'monsters', label: '👾 Monsters' },
          { id: 'items', label: '🛒 Items' },
          { id: 'rules', label: '📜 Rules' },
        ].map(t => (
          <button key={t.id} onClick={() => setSection(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${section === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 border border-[#1e293b]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Classes */}
      {section === 'classes' && (
        <div className="space-y-4">
          {CLASSES.map(cls => (
            <Panel key={cls.name}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{cls.emoji}</span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: cls.color }}>{cls.name}</h3>
                  <p className="text-[10px] text-slate-500">HP: {cls.hp} | AC: {cls.ac} | อุปกรณ์: {cls.equipment.join(', ')}</p>
                </div>
              </div>
              <div className="space-y-2">
                {cls.skills.map(sk => (
                  <div key={sk.name} className="flex items-start gap-2 p-2 rounded-lg bg-[#0a0e1a]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sk.name}</span>
                        {sk.unlock && <Badge text="ปลดล็อค" color="#3b82f6" />}
                        {sk.singleUse && <Badge text="ใช้ครั้งเดียว" color="#ef4444" />}
                        {sk.dmgType && <Badge text={`${DMG_EMOJI[sk.dmgType] || ''} ${sk.dmgType}`} color={DMG_COLORS[sk.dmgType] || '#94a3b8'} />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{sk.description}</p>
                    </div>
                    {sk.dice.length > 0 && (
                      <span className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">
                        {sk.dice.map(d => `d${d}`).join('+')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Monsters */}
      {section === 'monsters' && (
        <div className="space-y-4">
          {['C', 'B', 'A'].map(rank => (
            <div key={rank}>
              <h3 className="text-xs font-bold text-slate-500 mb-2">RANK {rank}</h3>
              {MONSTERS.filter(m => m.rank === rank).map(m => (
                <Panel key={m.id} className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.name} <span className="text-slate-500">({m.nameTH})</span></h4>
                      <p className="text-[10px] text-slate-500">Cooldown: {m.cooldown} นาที | Loot: {m.lootLoc} LOC</p>
                    </div>
                    <Badge text={`Rank ${m.rank}`} color={m.rank === 'C' ? '#22c55e' : m.rank === 'B' ? '#3b82f6' : '#ef4444'} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-[11px]">
                    <div className="bg-[#0a0e1a] rounded p-2"><span className="text-slate-500">HP</span><br /><span className="text-red-400 font-bold text-lg">{m.hp}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-2"><span className="text-slate-500">AC</span><br /><span className="text-blue-400 font-bold text-lg">{m.ac}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-2"><span className="text-slate-500">Attack</span><br /><span className="text-amber-400 font-bold">{m.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[m.atkType]}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-2"><span className="text-slate-500">Target</span><br /><span className="text-white font-bold text-[10px]">{m.target}</span></div>
                  </div>
                  <div className="flex gap-2 flex-wrap text-[10px]">
                    {m.vulnerable.length > 0 && <span className="text-red-400">Vuln: {m.vulnerable.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                    {m.resistant.length > 0 && <span className="text-yellow-400">Resist: {m.resistant.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                    {m.immune.length > 0 && <span className="text-slate-400">Immune: {m.immune.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                  </div>
                  {m.special && <p className="text-[10px] text-purple-400 mt-2 italic">{m.special}</p>}
                  {m.aoe && <p className="text-[10px] text-orange-400 mt-1">AoE ทุก {m.aoe.every} เทิร์น: {m.aoe.dice.map(d => `d${d}`).join('+')} {DMG_EMOJI[m.aoe.type]}</p>}
                  {m.drain && <p className="text-[10px] text-purple-400 mt-1">Drain ทุก {m.drain.every} เทิร์น: {m.drain.dice.map(d => `d${d}`).join('+')}</p>}
                  {m.phase2 && <p className="text-[10px] text-red-400 mt-1">Phase 2: ฟื้น {m.phase2.hp} HP, โจมตี {m.phase2.atk.map(d => `d${d}`).join('+')}</p>}
                </Panel>
              ))}
            </div>
          ))}

          {/* Duo */}
          <h3 className="text-xs font-bold text-slate-500 mb-2">RANK S (DUO)</h3>
          <Panel>
            <h4 className="text-sm font-bold text-purple-400 mb-2">{DUO.name} <span className="text-slate-500">({DUO.nameTH})</span></h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0a0e1a] rounded-lg p-3">
                <h5 className="text-xs font-bold text-amber-400 mb-1">{DUO.queen.name}</h5>
                <p className="text-[10px] text-slate-400">HP: {DUO.queen.hp} | AC: {DUO.queen.ac} | Atk: {DUO.queen.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[DUO.queen.atkType]}</p>
                <p className="text-[10px] text-red-400">Vuln: {DUO.queen.vulnerable.join(', ')}{DUO.queen.resistant.length > 0 && ` | Resist: ${DUO.queen.resistant.join(', ')}`} | Immune: {DUO.queen.immune.join(', ')}</p>
                <p className="text-[10px] text-purple-400">Debuff ทุก {DUO.queen.debuffEvery}t | Buff King ทุก {DUO.queen.buffKingEvery}t</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-3">
                <h5 className="text-xs font-bold text-red-400 mb-1">{DUO.king.name}</h5>
                <p className="text-[10px] text-slate-400">HP: {DUO.king.hp} | AC: {DUO.king.ac} | Atk: {DUO.king.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[DUO.king.atkType]}</p>
                <p className="text-[10px] text-red-400">Vuln: {DUO.king.vulnerable.join(', ')}{DUO.king.resistant.length > 0 && ` | Resist: ${DUO.king.resistant.join(', ')}`}{DUO.king.immune.length > 0 && ` | Immune: ${DUO.king.immune.join(', ')}`}</p>
                <p className="text-[10px] text-orange-400">AoE ทุก {DUO.king.aoe.every}t: {DUO.king.aoe.dice.map(d => `d${d}`).join('+')}</p>
              </div>
            </div>
          </Panel>

          {/* Boss */}
          <h3 className="text-xs font-bold text-slate-500 mb-2 mt-4">BOSS</h3>
          <Panel>
            <h4 className="text-sm font-bold text-red-500 mb-2">👹 {BOSS.name} <span className="text-slate-500">({BOSS.nameTH})</span></h4>
            <p className="text-[11px] text-slate-400">AC: {BOSS.ac} | Atk: {BOSS.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[BOSS.atkType]} | ไม่มีวันตาย</p>
            <p className="text-[10px] text-red-400">Vuln: {BOSS.vulnerable.join(', ')} | Resist: {BOSS.resistant.join(', ')} | Immune: {BOSS.immune.join(', ')}</p>
            <p className="text-[10px] text-orange-400">AoE ทุก {BOSS.aoe.every}t | Rage ทุก {BOSS.rage.every}t: {BOSS.rage.dice.map(d => `d${d}`).join('+')}</p>
          </Panel>
        </div>
      )}

      {/* Items */}
      {section === 'items' && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 mb-2">🛒 ร้านค้า (ทุกไอเทม)</h3>
          {SHOP_ITEMS.map(item => (
            <Panel key={item.name} className="mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <Badge text={item.type} color={item.type === 'consumable' ? '#22c55e' : item.type === 'passive' ? '#3b82f6' : item.type === 'skill_unlock' ? '#a78bfa' : '#f59e0b'} />
                  {item.forClass && <Badge text={item.forClass} color={CLASSES.find(c => c.name === item.forClass)?.color || '#94a3b8'} />}
                </div>
                <span className="text-amber-400 font-bold text-sm">{item.cost} LOC</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{item.effect}</p>
            </Panel>
          ))}
        </div>
      )}

      {/* Rules */}
      {section === 'rules' && (
        <div className="space-y-3">
          <Panel>
            <h3 className="text-sm font-bold text-amber-400 mb-3">🎲 ระบบ Attack Roll (2d6)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-2 bg-[#0a0e1a] rounded"><span className="text-red-500 font-bold w-16">Roll 2</span><span className="text-slate-300">Critical Failure — miss เลย (0 damage)</span></div>
              <div className="flex items-center gap-3 p-2 bg-[#0a0e1a] rounded"><span className="text-yellow-500 font-bold w-16">{'< AC'}</span><span className="text-slate-300">Glancing Blow — damage / 2 (ปัดลง, ขั้นต่ำ 1)</span></div>
              <div className="flex items-center gap-3 p-2 bg-[#0a0e1a] rounded"><span className="text-green-500 font-bold w-16">{'>= AC'}</span><span className="text-slate-300">Normal Hit — damage เต็ม</span></div>
              <div className="flex items-center gap-3 p-2 bg-[#0a0e1a] rounded"><span className="text-purple-500 font-bold w-16">Roll 12</span><span className="text-slate-300">Critical Hit — damage × 2</span></div>
            </div>
          </Panel>
          <Panel>
            <h3 className="text-sm font-bold text-blue-400 mb-3">📊 2d6 Hit Chances vs AC</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-[10px]">
              {[
                { ac: 2, pct: '100%' }, { ac: 3, pct: '97%' }, { ac: 4, pct: '92%' }, { ac: 5, pct: '83%' },
                { ac: 6, pct: '72%' }, { ac: 7, pct: '58%' }, { ac: 8, pct: '42%' }, { ac: 9, pct: '28%' },
                { ac: 10, pct: '17%' }, { ac: 11, pct: '8%' }, { ac: 12, pct: '3%' },
              ].map(({ ac, pct }) => (
                <div key={ac} className="bg-[#0a0e1a] rounded p-2">
                  <div className="text-slate-500">AC {ac}</div>
                  <div className="text-white font-bold">{pct}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">* ไม่รวม Glancing Blow ({"<"}AC ยังโดน dmg/2) และ Crit (2.78%)</p>
          </Panel>
          <Panel>
            <h3 className="text-sm font-bold text-green-400 mb-3">📋 กฎสำคัญ</h3>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p>• ห้ามตีมอนฯ ซ้ำติดกัน (ต้องตีตัวอื่นก่อน + รอ Cooldown)</p>
              <p>• ไอเทมแชร์กันทั้งทีม ใครจะใช้ก็ได้</p>
              <p>• ใช้สกิล 1 + ไอเทม 1 ต่อเทิร์น (ก่อนหรือหลังก็ได้)</p>
              <p>• มอนฯ ต้อง Roll Attack เหมือนผู้เล่น (ทอย 2d6)</p>
              <p>• TPK = ทิ้งไอเทม 1 ชิ้น (สุ่ม) + เงินหมด | Full Heal ฟรี</p>
              <p>• หนี = ทุกตัวโดนตีคนละ 1 ครั้ง</p>
              <p>• ตาย 1 ตัว = ฟื้น 1 HP หลังไฟท์ | ฮีลได้แค่ Potion/Phoenix/ร้าน</p>
              <p>• บอส Raid ได้ไม่จำกัด Damage สะสมตลอด</p>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { CLASSES, MONSTERS, DUO, BOSS, SHOP_ITEMS, DMG_EMOJI, DMG_COLORS } from '@/data/gameData';

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#111827] border border-[#1e293b] rounded-xl p-4 ${className}`}>{children}</div>
);

const Badge = ({ text, color = '#64748b' }: { text: string; color?: string }) => (
  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: color + '22', color }}>{text}</span>
);

const MON_EMOJI: Record<string, string> = {
  goblin: '🗡️', skeleton: '💀', slime: '🟢', slime_king: '👑',
  dark_knight: '⚔️', flame_serpent: '🐍', lich: '☠️',
};

// Map item name → image filename slug
const itemSlug = (name: string) => name.toLowerCase().replace(/[:]/g, '').replace(/\s+/g, '-');

const rankColor = (r: string) => r === 'C' ? '#22c55e' : r === 'B' ? '#3b82f6' : r === 'A' ? '#ef4444' : r === 'S' ? '#a78bfa' : '#f59e0b';

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
              <div className="flex gap-4 mb-3">
                {/* Character card image */}
                <div className="w-24 shrink-0 rounded-lg overflow-hidden border border-slate-700/30" style={{ aspectRatio: '63.5/88' }}>
                  <img src={`/cards/classes/${cls.name.toLowerCase()}.png`} alt={cls.name} className="w-full h-full object-cover" />
                </div>
                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold" style={{ color: cls.color }}>{cls.emoji} {cls.name}</h3>
                  <div className="flex gap-3 mt-1">
                    <div className="bg-[#0a0e1a] rounded px-2 py-1 text-center">
                      <div className="text-[9px] text-slate-500">HP</div>
                      <div className="text-red-400 font-extrabold text-lg">{cls.hp}</div>
                    </div>
                    <div className="bg-[#0a0e1a] rounded px-2 py-1 text-center">
                      <div className="text-[9px] text-slate-500">AC</div>
                      <div className="text-blue-400 font-extrabold text-lg">{cls.ac}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{cls.equipment.join(', ')}</p>
                </div>
              </div>
              {/* Skills */}
              <div className="space-y-2">
                {cls.skills.map(sk => (
                  <div key={sk.name} className="flex items-start gap-2 p-2 rounded-lg bg-[#0a0e1a]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{sk.name}</span>
                        {sk.unlock && <Badge text="ปลดล็อค" color="#3b82f6" />}
                        {sk.singleUse && <Badge text="ใช้ครั้งเดียว" color="#ef4444" />}
                        {sk.dmgType && <Badge text={`${DMG_EMOJI[sk.dmgType] || ''} ${sk.dmgType}`} color={DMG_COLORS[sk.dmgType] || '#94a3b8'} />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{sk.description}</p>
                    </div>
                    {sk.dice.length > 0 && (
                      <span className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
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
                  <div className="flex gap-3 mb-2">
                    {/* Monster image */}
                    <div className="w-16 shrink-0 rounded-lg overflow-hidden border border-slate-700/30" style={{ aspectRatio: '63.5/88' }}>
                      <img src={`/cards/monsters/${m.id}.png`} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{m.name}</h4>
                          <p className="text-[10px] text-slate-500">{m.nameTH}</p>
                        </div>
                        <Badge text={`${m.rank}`} color={rankColor(m.rank)} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">CD: {m.cooldown}m | {m.lootLoc} LOC</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2 text-[11px]">
                    <div className="bg-[#0a0e1a] rounded p-1.5 text-center"><span className="text-[9px] text-slate-500">HP</span><br /><span className="text-red-400 font-bold">{m.hp}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-1.5 text-center"><span className="text-[9px] text-slate-500">AC</span><br /><span className="text-blue-400 font-bold">{m.ac}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-1.5 text-center"><span className="text-[9px] text-slate-500">ATK</span><br /><span className="text-amber-400 font-bold text-[10px]">{m.atk.map(d => `d${d}`).join('+')}</span></div>
                    <div className="bg-[#0a0e1a] rounded p-1.5 text-center"><span className="text-[9px] text-slate-500">DMG</span><br /><span className="font-bold text-[10px]" style={{ color: DMG_COLORS[m.atkType] }}>{DMG_EMOJI[m.atkType]}</span></div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap text-[10px]">
                    {m.vulnerable.length > 0 && <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">Vuln: {m.vulnerable.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                    {m.resistant.length > 0 && <span className="bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded">Resist: {m.resistant.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                    {m.immune.length > 0 && <span className="bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded">Immune: {m.immune.map(v => `${DMG_EMOJI[v]}${v}`).join(', ')}</span>}
                  </div>
                  {m.special && <p className="text-[10px] text-purple-400 mt-2 italic">{m.special}</p>}
                  {m.aoe && <p className="text-[10px] text-orange-400 mt-1">AoE ทุก {m.aoe.every} เทิร์น: {m.aoe.dice.map(d => `d${d}`).join('+')} {DMG_EMOJI[m.aoe.type]}</p>}
                  {m.selfHeal && <p className="text-[10px] text-green-400 mt-1">Self Heal ทุก {m.selfHeal.every} เทิร์น: {m.selfHeal.dice.map(d => `d${d}`).join('+')}</p>}
                  {m.drain && <p className="text-[10px] text-purple-400 mt-1">Drain ทุก {m.drain.every} เทิร์น: {m.drain.dice.map(d => `d${d}`).join('+')}</p>}
                  {m.phase2 && <p className="text-[10px] text-red-400 mt-1">Phase 2: ฟื้น {m.phase2.hp} HP, โจมตี {m.phase2.atk.map(d => `d${d}`).join('+')}</p>}
                </Panel>
              ))}
            </div>
          ))}

          {/* Duo */}
          <h3 className="text-xs font-bold text-slate-500 mb-2">RANK S (DUO)</h3>
          <Panel>
            <div className="flex gap-3 mb-3">
              <div className="w-16 shrink-0 rounded-lg overflow-hidden border border-slate-700/30" style={{ aspectRatio: '63.5/88' }}>
                <img src="/cards/monsters/duo.png" alt="Duo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-400">{DUO.name}</h4>
                <p className="text-[10px] text-slate-500">{DUO.nameTH}</p>
                <p className="text-[10px] text-slate-500 mt-1">CD: {DUO.cooldown}m | {DUO.lootLoc} LOC</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0a0e1a] rounded-lg p-3">
                <h5 className="text-xs font-bold text-amber-400 mb-1">{DUO.queen.name}</h5>
                <div className="flex gap-2 mb-1">
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">HP {DUO.queen.hp}</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">AC {DUO.queen.ac}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{DUO.queen.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[DUO.queen.atkType]}</span>
                </div>
                <p className="text-[10px] text-red-400">Vuln: {DUO.queen.vulnerable.join(', ')}{DUO.queen.resistant.length > 0 && ` | Resist: ${DUO.queen.resistant.join(', ')}`} | Immune: {DUO.queen.immune.join(', ')}</p>
                <p className="text-[10px] text-purple-400">Debuff ทุก {DUO.queen.debuffEvery}t | Buff King ทุก {DUO.queen.buffKingEvery}t</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-3">
                <h5 className="text-xs font-bold text-red-400 mb-1">{DUO.king.name}</h5>
                <div className="flex gap-2 mb-1">
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">HP {DUO.king.hp}</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">AC {DUO.king.ac}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{DUO.king.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[DUO.king.atkType]}</span>
                </div>
                <p className="text-[10px] text-red-400">Vuln: {DUO.king.vulnerable.join(', ')}{DUO.king.resistant.length > 0 && ` | Resist: ${DUO.king.resistant.join(', ')}`}</p>
                <p className="text-[10px] text-orange-400">AoE ทุก {DUO.king.aoe.every}t: {DUO.king.aoe.dice.map(d => `d${d}`).join('+')}</p>
              </div>
            </div>
          </Panel>

          {/* Boss */}
          <h3 className="text-xs font-bold text-slate-500 mb-2 mt-4">BOSS</h3>
          <Panel>
            <div className="flex gap-3 mb-2">
              <div className="w-16 shrink-0 rounded-lg overflow-hidden border border-slate-700/30" style={{ aspectRatio: '63.5/88' }}>
                <img src="/cards/monsters/boss.png" alt="Boss" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-500">{BOSS.name}</h4>
                <p className="text-[10px] text-slate-500">{BOSS.nameTH}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">AC {BOSS.ac}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{BOSS.atk.map(d => `d${d}`).join('+')} {DMG_EMOJI[BOSS.atkType]}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">ไม่มีวันตาย</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-red-400">Vuln: {BOSS.vulnerable.join(', ')} | Resist: {BOSS.resistant.join(', ')} | Immune: {BOSS.immune.join(', ')}</p>
            <p className="text-[10px] text-orange-400 mt-1">AoE ทุก {BOSS.aoe.every}t: {BOSS.aoe.dice.map(d => `d${d}`).join('+')} | Rage ทุก {BOSS.rage.every}t: {BOSS.rage.dice.map(d => `d${d}`).join('+')} → {BOSS.rage.target}</p>
          </Panel>
        </div>
      )}

      {/* Items */}
      {section === 'items' && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-3">🛒 ร้านค้า (ทุกไอเทม)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SHOP_ITEMS.map(item => (
              <div key={item.name} className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
                {/* Item image */}
                <div className="w-full bg-gradient-to-b from-slate-800/50 to-slate-900/80 flex items-center justify-center" style={{ aspectRatio: '63.5/88' }}>
                  <img src={`/cards/items/${itemSlug(item.name)}.png`} alt={item.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-bold text-white leading-tight">{item.name}</div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge text={item.type} color={item.type === 'consumable' ? '#22c55e' : item.type === 'passive' ? '#3b82f6' : item.type === 'skill_unlock' ? '#a78bfa' : '#f59e0b'} />
                    {item.forClass && <Badge text={item.forClass} color={CLASSES.find(c => c.name === item.forClass)?.color || '#94a3b8'} />}
                  </div>
                  <div className="text-amber-400 font-bold text-sm mt-1">{item.cost} LOC</div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">{item.effect}</p>
                </div>
              </div>
            ))}
          </div>
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

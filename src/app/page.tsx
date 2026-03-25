'use client';
import { useState } from 'react';
import ReferencePage from '@/components/ReferencePage';
import CombatTracker from '@/components/CombatTracker';
import LootRoller from '@/components/LootRoller';
import Simulator from '@/components/Simulator';

const TABS = [
  { id: 'ref', label: '📚 Reference', emoji: '📚' },
  { id: 'combat', label: '⚔️ Combat', emoji: '⚔️' },
  { id: 'loot', label: '🎲 Loot', emoji: '🎲' },
  { id: 'sim', label: '📊 Simulator', emoji: '📊' },
];

export default function Home() {
  const [tab, setTab] = useState('ref');

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-[#1e293b] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              🎲 LOC DnD <span className="text-amber-400">Staff</span>
            </h1>
            <p className="text-[10px] text-slate-500">Summer Camp 5 | DM Dashboard</p>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {tab === 'ref' && <ReferencePage />}
        {tab === 'combat' && <CombatTracker />}
        {tab === 'loot' && <LootRoller />}
        {tab === 'sim' && <Simulator />}
      </div>
    </div>
  );
}

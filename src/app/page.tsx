'use client';
import { useState } from 'react';
import ReferencePage from '@/components/ReferencePage';
import CombatTracker from '@/components/CombatTracker';
import LootRoller from '@/components/LootRoller';
import Simulator from '@/components/Simulator';
import GameMap from '@/components/GameMap';
import PartyPage from '@/components/PartyPage';

const TABS = [
  { id: 'ref', label: '📚 Reference', emoji: '📚' },
  { id: 'party', label: '❤️ Party', emoji: '❤️' },
  { id: 'combat', label: '⚔️ Combat', emoji: '⚔️' },
  { id: 'loot', label: '🎲 Loot', emoji: '🎲' },
  { id: 'sim', label: '📊 Simulator', emoji: '📊' },
];

export default function Home() {
  const [tab, setTab] = useState('ref');
  const [mapOpen, setMapOpen] = useState(false);

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
      <div className="max-w-5xl mx-auto px-4 py-4 pb-24">
        {tab === 'ref' && <ReferencePage />}
        {tab === 'party' && <PartyPage />}
        {tab === 'combat' && <CombatTracker />}
        {tab === 'loot' && <LootRoller />}
        {tab === 'sim' && <Simulator />}
      </div>

      {/* Floating Map Button */}
      <button
        onClick={() => setMapOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        🗺️
      </button>

      {/* Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0e1a]">
          {/* Modal header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-[#1e293b]">
            <h2 className="text-base font-bold text-white">🗺️ Dungeon Map</h2>
            <button
              onClick={() => setMapOpen(false)}
              className="w-9 h-9 rounded-lg bg-[#1e293b] text-slate-400 flex items-center justify-center text-lg font-bold hover:text-white hover:bg-[#334155] transition-colors"
            >
              ✕
            </button>
          </div>
          {/* Modal body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <GameMap />
          </div>
        </div>
      )}
    </div>
  );
}

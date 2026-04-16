'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AVAILABLE_PINS, loadPins, savePins, type MapPin } from '@/data/mapPins';

const PIN_SIZE = 48; // px on screen
const rankColor = (r?: string) => r === 'C' ? '#22c55e' : r === 'B' ? '#3b82f6' : r === 'A' ? '#ef4444' : r === 'S' ? '#a78bfa' : r === 'Boss' ? '#f59e0b' : '#64748b';
const typeColor = (t: string) => t === 'monster' ? '#ef4444' : t === 'boss' ? '#f59e0b' : t === 'shop' ? '#22c55e' : '#60a5fa';

export default function GameMap() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load pins on mount
  useEffect(() => { setPins(loadPins()); }, []);

  // Save whenever pins change (in edit mode)
  const save = useCallback((newPins: MapPin[]) => {
    setPins(newPins);
    savePins(newPins);
  }, []);

  // Get % coordinates from pointer event
  const getMapPercent = (e: React.PointerEvent | PointerEvent): { x: number; y: number } | null => {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Drag handling
  const handlePointerDown = (e: React.PointerEvent, pinId: string) => {
    if (mode !== 'edit') return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(pinId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || mode !== 'edit') return;
    const pos = getMapPercent(e);
    if (!pos) return;
    setPins(prev => prev.map(p => p.id === dragging ? { ...p, x: pos.x, y: pos.y } : p));
  };

  const handlePointerUp = () => {
    if (dragging) {
      save(pins);
      setDragging(null);
    }
  };

  // Add pin from palette
  const addPin = (pinDef: typeof AVAILABLE_PINS[0]) => {
    if (pins.find(p => p.id === pinDef.id)) return; // already placed
    const newPin: MapPin = { ...pinDef, x: 50, y: 50 };
    save([...pins, newPin]);
  };

  // Remove pin
  const removePin = (id: string) => {
    save(pins.filter(p => p.id !== id));
    if (selectedPin === id) setSelectedPin(null);
  };

  // Export/Import
  const exportJSON = () => JSON.stringify(pins, null, 2);
  const importJSON = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) save(parsed);
    } catch {}
  };

  const placedIds = new Set(pins.map(p => p.id));
  const unplacedPins = AVAILABLE_PINS.filter(p => !placedIds.has(p.id));

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">🗺️ Dungeon Map</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('view')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'view' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 border border-[#1e293b]'}`}>
            👁 View
          </button>
          <button onClick={() => setMode('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'edit' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 border border-[#1e293b]'}`}>
            ✏️ Edit
          </button>
        </div>
      </div>

      {/* Editor: Pin palette */}
      {mode === 'edit' && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 mb-2">แตะเพื่อวางบนแผนที่ → ลากเพื่อย้ายตำแหน่ง</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {unplacedPins.map(p => (
              <button key={p.id} onClick={() => addPin(p)}
                className="shrink-0 w-14 rounded-lg border border-[#1e293b] bg-[#111827] overflow-hidden hover:border-amber-500/50 transition-all">
                <div className="w-full aspect-square overflow-hidden">
                  <img src={p.image} alt={p.label} className="w-full h-full object-cover" />
                </div>
                <div className="px-1 py-0.5 text-[7px] text-slate-400 text-center truncate">{p.label}</div>
              </button>
            ))}
            {unplacedPins.length === 0 && (
              <span className="text-[11px] text-green-400">✅ ทุก pin ถูกวางแล้ว</span>
            )}
          </div>

          {/* Export/Import */}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setShowExport(!showExport)} className="px-2 py-1 rounded text-[10px] text-slate-500 border border-[#1e293b]">
              {showExport ? 'Hide' : '📋 Export/Import'}
            </button>
            {pins.length > 0 && (
              <button onClick={() => { save([]); setSelectedPin(null); }} className="px-2 py-1 rounded text-[10px] text-red-400 border border-red-500/20">🗑 Clear All</button>
            )}
          </div>
          {showExport && (
            <div className="mt-2 space-y-2">
              <textarea
                className="w-full h-32 rounded-lg bg-[#0a0e1a] border border-[#1e293b] text-[10px] text-slate-300 p-2 font-mono"
                defaultValue={exportJSON()}
                onBlur={(e) => importJSON(e.target.value)}
                placeholder="Paste JSON here to import, or copy to export"
              />
              <p className="text-[9px] text-slate-600">Edit JSON and click away to import. Copy to save as backup.</p>
            </div>
          )}
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} className="relative rounded-xl overflow-hidden border border-[#1e293b] bg-[#0a0e1a]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: mode === 'edit' && dragging ? 'none' : 'pan-x pan-y' }}>

        {/* Map image */}
        <img ref={imgRef} src="/UTCC_map.png" alt="UTCC Campus Map"
          className="w-fit h-fit block select-none"
          draggable={false} />

        {/* Pins overlay */}
        {pins.map(pin => {
          const isSelected = selectedPin === pin.id;
          const isDragged = dragging === pin.id;
          const border = typeColor(pin.type);

          return (
            <div key={pin.id}
              className="absolute"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: isDragged ? 50 : isSelected ? 40 : 10,
                cursor: mode === 'edit' ? 'grab' : 'pointer',
              }}
              onPointerDown={(e) => handlePointerDown(e, pin.id)}
              onClick={(e) => {
                if (mode === 'edit' || dragging) return;
                e.stopPropagation();
                setSelectedPin(isSelected ? null : pin.id);
              }}
            >
              {/* Pin body */}
              <div className={`relative transition-transform ${isDragged ? 'scale-110' : ''}`}>
                {/* Card image pin */}
                <div className="rounded-lg overflow-hidden border-2 shadow-lg shadow-black/50"
                  style={{
                    width: PIN_SIZE,
                    height: PIN_SIZE * 1.3,
                    borderColor: border,
                  }}>
                  <img src={pin.image} alt={pin.label} className="w-full h-full object-cover" draggable={false} />
                </div>

                {/* Rank badge */}
                {pin.rank && (
                  <div className="absolute -top-0 -right-0 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold border border-black/50"
                    style={{ background: rankColor(pin.rank), color: '#fff' }}>
                    {pin.rank === 'Boss' ? '!' : pin.rank}
                  </div>
                )}

                {/* Pin pointer triangle */}
                <div className="w-0 h-0 mx-auto"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${border}`,
                  }} />
              </div>

              {/* Label */}
              <div className="text-center mt-0.5">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white whitespace-nowrap">
                  {pin.label}
                </span>
              </div>

              {/* Popup on tap (view mode) */}
              {isSelected && mode === 'view' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#111827] border border-[#1e293b] rounded-xl p-3 shadow-xl z-50"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 items-start">
                    <div className="w-12 shrink-0 rounded overflow-hidden border border-slate-700/30" style={{ aspectRatio: '63.5/88' }}>
                      <img src={pin.image} alt={pin.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">{pin.label}</div>
                      {pin.rank && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: rankColor(pin.rank) + '22', color: rankColor(pin.rank) }}>Rank {pin.rank}</span>}
                      <div className="text-[9px] text-slate-500 mt-1 capitalize">{pin.type}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remove button (edit mode) */}
              {mode === 'edit' && !isDragged && (
                <button onClick={(e) => { e.stopPropagation(); removePin(pin.id); }}
                  className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center border border-black/50 hover:bg-red-500 z-50">
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Click away to deselect */}
        {selectedPin && mode === 'view' && (
          <div className="absolute inset-0 z-[5]" onClick={() => setSelectedPin(null)} />
        )}
      </div>

      {/* Pin count */}
      <div className="mt-2 text-[10px] text-slate-600 text-center">
        {pins.length} / {AVAILABLE_PINS.length} pins placed
      </div>
    </div>
  );
}

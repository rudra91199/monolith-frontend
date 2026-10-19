import { Flame, Clock, Coins, Hammer } from 'lucide-react';
import { analyzeItemUpgrade, formatCost, formatTime } from '../../utils/upgradeCalculator';

const formatCdnName = (name) => {
  if (!name) return 'unknown';
  if (name === 'L.A.S.S.I') return 'lassi';
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
};

export const getImageUrl = (category, name, level = 1) => {
  const formatted = formatCdnName(name);
  if (category === 'equipment') return `https://assets.clashk.ing/equipment/${formatted}.webp`;
  if (category === 'spells') return `https://assets.clashk.ing/spells/${formatted}.webp`;
  if (category === 'pets') return `https://assets.clashk.ing/pets/${formatted}/icon.webp`;
  if (category === 'buildings') {
    return `https://assets.clashk.ing/buildings/home-village/${formatted}/level_${Math.max(1, level)}.webp`;
  }
  return `https://assets.clashk.ing/${category}/${formatted}/icon.webp`;
};

export default function ItemCard({
  item,
  category,
  staticData,
  thLevel,
  boostConfig,
  previousLevel,
  onSelect,
}) {
  const analysis = analyzeItemUpgrade(item, category, staticData, thLevel, boostConfig);
  const { isMaxed, maxAtTh, nextUpgrade } = analysis;
  const progressPercent = maxAtTh > 0 ? Math.min(100, (item.level / maxAtTh) * 100) : 100;
  const levelGain = previousLevel !== undefined && item.level > previousLevel ? item.level - previousLevel : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(item, category, analysis)}
      className="group flex flex-col items-center p-2.5 sm:p-3 rounded-[1rem] backdrop-blur-md bg-[#0a0a0c]/60 border border-white/[0.05] hover:border-amber-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.6)] relative overflow-hidden hover:bg-[#121216]/90 transition-all min-w-0 text-left w-full cursor-pointer"
    >
      {/* Count Badge for Grouped Buildings/Walls */}
      {item.count > 1 && (
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/80 border border-white/10 text-[8px] font-mono font-bold text-neutral-300 z-10">
          x{item.count}
        </span>
      )}

      {/* Snapshot Progress Diff Badge */}
      {levelGain > 0 && (
        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[8px] font-mono font-bold text-emerald-400 z-10">
          +{levelGain}
        </span>
      )}

      {/* Active Builder Upgrading Indicator */}
      {item.timer > 0 && (
        <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse z-10">
          <Hammer className="w-2.5 h-2.5" />
        </span>
      )}

      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mb-2 relative shrink-0 flex items-center justify-center">
        <img
          src={getImageUrl(category, item.name, item.level)}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://assets.clashk.ing/buildings/home-village/town_hall/level_1.webp';
          }}
        />
        {isMaxed && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full border border-[#0a0a0c] flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-[#0a0a0c]" fill="currentColor" />
          </div>
        )}
      </div>

      <p className="text-[9px] sm:text-[10px] text-neutral-300 font-bold uppercase tracking-widest text-center truncate w-full mb-1.5 drop-shadow-md px-1">
        {item.name}
      </p>

      <div className="w-full px-1">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-[10px] sm:text-xs font-mono font-bold drop-shadow-md ${isMaxed ? 'text-amber-400' : 'text-white'}`}>
            Lv.{item.level}
          </span>
          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 drop-shadow-md">/{maxAtTh}</span>
        </div>
        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
          <div
            className={`h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ${
              isMaxed ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Next Upgrade Cost & Time Footer */}
      <div className="w-full mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between px-1 text-[8px] font-mono">
        {isMaxed ? (
          <span className="text-amber-500/80 uppercase tracking-widest font-bold mx-auto">TH Max</span>
        ) : nextUpgrade ? (
          <>
            <span className="text-neutral-300 flex items-center gap-0.5 truncate">
              <Coins className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              {formatCost(nextUpgrade.cost)}
            </span>
            <span className="text-neutral-400 flex items-center gap-0.5 shrink-0">
              <Clock className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
              {formatTime(nextUpgrade.time)}
            </span>
          </>
        ) : (
          <span className="text-neutral-500 mx-auto">Details &rarr;</span>
        )}
      </div>
    </button>
  );
}
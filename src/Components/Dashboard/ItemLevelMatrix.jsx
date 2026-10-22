import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Crown } from 'lucide-react';
import {
  formatCost,
  formatTime,
  getResourceIcon
} from '../../utils/upgradeCalculator';

export default function ItemLevelMatrix({
  analysis,
  thLevel,
  countMultiplier = 1,
  workingBuilderIcon
}) {
  const [expanded, setExpanded] = useState(false);
  const [is2xl, setIs2xl] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1536px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1536px)');
    const handler = (e) => setIs2xl(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const {
    isLocked,
    isMaxed,
    isEquipment,
    maxAtTh,
    maxTierUpgrade,
    remainingLevels,
    totalCostToMax,
    totalTimeToMax,
    totalOresToMax,
    resourceIcon,
    unlockRequirementText
  } = analysis;

  // 5 Rows Standard: 2 cols * 5 rows = 10 levels on mobile/tablet/laptop; 3 cols * 5 rows = 15 levels on 2xl desktop
  const maxVisibleLevels = is2xl ? 15 : 10;
  const hasMoreThanFiveRows = remainingLevels.length > maxVisibleLevels;
  const visibleLevels =
    hasMoreThanFiveRows && !expanded
      ? remainingLevels.slice(0, maxVisibleLevels)
      : remainingLevels;
  const hiddenCount = remainingLevels.length - maxVisibleLevels;

  if (isMaxed) {
    return (
      <div className="relative flex-1 min-w-0 flex flex-col justify-center rounded-xl bg-gradient-to-r from-[#2a1f08]/95 via-[#120d1d]/95 to-[#1f1605]/95 shadow-[inset_0_1px_2px_rgba(253,224,71,0.55),inset_0_-2px_6px_rgba(0,0,0,0.95)] px-3 py-2 overflow-hidden">
        {/* Holographic Sweeping Shimmer Beam */}
        <motion.div
          animate={{ x: ['-140%', '240%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent -skew-x-12 pointer-events-none"
        />

        {/* Ambient Floating Legendary Orbs */}
        <motion.div
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-yellow-400/20 blur-xl pointer-events-none"
        />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-yellow-200 via-amber-300 to-cyan-200 bg-clip-text text-transparent drop-shadow truncate">
              TH{thLevel} Maxed Mastery
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-400/25 to-fuchsia-500/25 shadow-[inset_0_1px_1px_rgba(253,224,71,0.5)] text-[8px] font-mono font-bold text-yellow-200 uppercase shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            MAX TIER
          </span>
        </div>

        {maxTierUpgrade && !isEquipment && (
          <div className="relative z-10 flex items-center justify-between gap-2 text-[9px] font-mono text-neutral-300 mt-1 pt-1 border-t border-yellow-400/15">
            <span className="text-yellow-200/80 font-bold">Final Lv.{maxTierUpgrade.level}</span>
            <span className="text-cyan-300 font-bold">{formatTime(maxTierUpgrade.time)}</span>
            <span className="inline-flex items-center gap-1 text-white font-bold">
              <img src={resourceIcon} alt="" className="w-3 h-3 object-contain" />
              {formatCost(maxTierUpgrade.cost)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 pl-1 bg-black/50 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]">
      {isLocked && unlockRequirementText && (
        <div className="px-2 py-0.5 rounded bg-rose-950/40 text-[8px] font-mono text-rose-300 truncate">
          {unlockRequirementText}
        </div>
      )}

      {/* 2 Columns on Mobile/Laptop, 3 Columns on 2xl Desktop (Level Left | Time Middle | Cost Right) */}
      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-1.5">
        {visibleLevels.map((lvl) => (
          <div
            key={lvl.level}
            className="px-1 py-1 rounded-lg bg-white/[0.035] flex items-center justify-between gap-1 text-[8px] lg:text-[10px] font-mono leading-tight"
          >
            {/* 1. LEFT: Fixed Level */}
            <span className="font-bold text-neutral-300 shrink-0">
              Lv.{lvl.level}
            </span>

            {isEquipment && lvl.ores ? (
              <div className="flex items-center justify-end gap-1 truncate ml-auto">
                {lvl.ores.shiny_ore > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-cyan-300 font-bold">
                    {formatCost(lvl.ores.shiny_ore)}
                    <img src={getResourceIcon('shiny_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
                  </span>
                )}
                {lvl.ores.glowy_ore > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-purple-300 font-bold">
                    {formatCost(lvl.ores.glowy_ore)}
                    <img src={getResourceIcon('glowy_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
                  </span>
                )}
                {lvl.ores.starry_ore > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-yellow-300 font-bold">
                    {formatCost(lvl.ores.starry_ore)}
                    <img src={getResourceIcon('starry_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
                  </span>
                )}
              </div>
            ) : (
              <>
                {/* 2. MIDDLE: Time */}
                <span className="text-cyan-300 font-bold text-center truncate">
                  {formatTime(lvl.time)}
                </span>

                {/* 3. RIGHT: Fixed Resource Cost */}
                <span className="inline-flex items-center justify-end gap-0.5 text-white font-bold shrink-0">
                  <span>{formatCost(lvl.cost)}</span>
                  <img src={resourceIcon} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Extend More / Collapse Button When > 5 Rows */}
      {hasMoreThanFiveRows && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1 px-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[8px] lg:text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>Extend +{hiddenCount} More Levels</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}

      {/* Total Row Under Levels (Level Target Left | Total Time Middle | Total Cost Right) */}
      <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between gap-1 text-[9px] font-mono">
        <span className="text-neutral-400 uppercase font-bold truncate shrink-0">
          Total &rarr; Lv.{maxAtTh}
          {countMultiplier > 1 ? ` (x${countMultiplier})` : ''}
        </span>

        {isEquipment ? (
          <div className="flex items-center gap-1.5 shrink-0 font-bold ml-auto">
            {totalOresToMax.shiny_ore > 0 && (
              <span className="inline-flex items-center gap-0.5 text-cyan-300">
                {formatCost(totalOresToMax.shiny_ore)}
                <img src={getResourceIcon('shiny_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
              </span>
            )}
            {totalOresToMax.glowy_ore > 0 && (
              <span className="inline-flex items-center gap-0.5 text-purple-300">
                {formatCost(totalOresToMax.glowy_ore)}
                <img src={getResourceIcon('glowy_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
              </span>
            )}
            {totalOresToMax.starry_ore > 0 && (
              <span className="inline-flex items-center gap-0.5 text-indigo-200">
                {formatCost(totalOresToMax.starry_ore)}
                <img src={getResourceIcon('starry_ore')} alt="" className="w-2.5 h-2.5 object-contain" />
              </span>
            )}
          </div>
        ) : (
          <>
            <span className="inline-flex items-center gap-0.5 text-cyan-300 font-bold truncate">
              <img src={workingBuilderIcon} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
              {formatTime(totalTimeToMax * countMultiplier)}
            </span>

            <span className="inline-flex items-center gap-0.5 text-white font-bold shrink-0">
              <span>{formatCost(totalCostToMax * countMultiplier)}</span>
              <img src={resourceIcon} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
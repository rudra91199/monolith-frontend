import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import {
  analyzeItemUpgrade,
  getHeroStandingPoses,
  useHeroPoseCycle,
  CLASH_ICONS,
  useBuilderIcon
} from '../../utils/upgradeCalculator';
import ItemLevelMatrix from './ItemLevelMatrix';

const formatCdnName = (name, preservePunctuation = false) => {
  if (!name) return 'unknown';
  if (name === 'L.A.S.S.I') return 'lassi';
  if (name === 'P.E.K.K.A') return 'pekka';
  const lower = name.toLowerCase().trim();
  if (preservePunctuation) {
    return lower.replace(/[^a-z0-9\s'-]/g, '').replace(/\s+/g, '_');
  }
  return lower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
};

export const getImageUrl = (category, name, level = 1) => {
  if (!name) return CLASH_ICONS.townHall;
  const lower = name.toLowerCase().trim();
  const safeLevel = Math.max(1, level || 1);

  if (category === 'heroes') return getHeroStandingPoses(name)[0];
  if (category === 'equipment') return `https://assets.clashk.ing/equipment/${formatCdnName(name)}.webp`;
  if (category === 'spells') return `https://assets.clashk.ing/spells/${formatCdnName(name)}.webp`;
  if (category === 'pets') return `https://assets.clashk.ing/pets/${formatCdnName(name)}/icon.webp`;

  if (category === 'buildings') {
    if (lower === 'helper hut' || lower.includes('helper')) {
      return "https://assets.clashk.ing/helpers/builder's_apprentice.webp";
    }
    if (lower.includes('b.o.b') || lower.includes("bob's hut") || lower.includes('bob control')) {
      return 'https://assets.clashk.ing/buildings/builder-base/bob_control/level_5.webp';
    }
    if (lower.includes('builder') && lower.includes('hut')) {
      return `https://assets.clashk.ing/buildings/home-village/builder's_hut/level_${safeLevel}.webp`;
    }
    if (lower.includes('multi-archer') || lower.includes('multi archer')) {
      return `https://assets.clashk.ing/buildings/home-village/multi-archer_tower/level_${safeLevel}.webp`;
    }
    if (lower.includes('multi-gear') || lower.includes('multi gear')) {
      return `https://assets.clashk.ing/buildings/home-village/multi-gear_tower/level_${safeLevel}.webp`;
    }
    if (lower === 'x-bow' || lower === 'xbow') {
      return `https://assets.clashk.ing/buildings/home-village/x-bow/level_${safeLevel}.webp`;
    }
    if (lower === 'blacksmith') {
      return `https://assets.clashk.ing/buildings/home-village/blacksmith/level_${safeLevel}.webp`;
    }
    const buildingSlug = formatCdnName(name, true);
    return `https://assets.clashk.ing/buildings/home-village/${buildingSlug}/level_${safeLevel}.webp`;
  }

  return `https://assets.clashk.ing/${category}/${formatCdnName(name)}/icon.webp`;
};

export default function ItemCard({
  item,
  category,
  staticData,
  thLevel,
  boostConfig,
  previousLevel
}) {
  const workingBuilderIcon = useBuilderIcon(true);
  const heroPoseIndex = useHeroPoseCycle(3000);

  const analysis = analyzeItemUpgrade(item, category, staticData, thLevel, boostConfig);
  const { resolvedName, isLocked, isMaxed, isEquipment, maxAtTh } = analysis;

  const isHero = category === 'heroes';
  const heroPoses = isHero ? getHeroStandingPoses(resolvedName) : null;
  const isEpicEquip = isEquipment && (item.rarity === 'Epic' || maxAtTh >= 27);

  const progressPercent = isLocked
    ? 0
    : maxAtTh > 0
    ? Math.min(100, (item.level / maxAtTh) * 100)
    : 100;

  const levelGain =
    !isLocked && previousLevel !== undefined && item.level > previousLevel
      ? item.level - previousLevel
      : 0;

  const handleImageError = (e) => {
    const level1Url = getImageUrl(category, resolvedName, 1);
    if (e.target.src !== level1Url && !e.target.dataset.triedLevel1) {
      e.target.dataset.triedLevel1 = 'true';
      e.target.src = level1Url;
    } else {
      e.target.onerror = null;
      e.target.src = category === 'buildings' ? CLASH_ICONS.structures : CLASH_ICONS.townHall;
    }
  };

  return (
    <div
      className={`flex items-stretch py-1 backdrop-blur-2xl transition-all text-left w-full relative overflow-hidden ${
        isLocked
          ? 'bg-white/[0.03] opacity-80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
          : isMaxed
          ? 'bg-gradient-to-r from-[#2b1e06]/80 via-[#120b1d]/85 to-[#090b10]/90 shadow-[inset_0_1px_2px_rgba(253,224,71,0.5),0_8px_24px_rgba(234,179,8,0.2)]'
          : 'bg-gradient-to-b from-white/[0.07] to-black/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_6px_16px_rgba(0,0,0,0.65)]'
      }`}
    >
      {/* BOX 1 (LEFT): COMPACT POD WITH LEGENDARY MAX AURA */}
      <div
        className={`w-[65px] sm:w-[100px] shrink-0 flex flex-col justify-between relative overflow-hidden ${
          isMaxed
            ? 'bg-gradient-to-b from-[#2c1f07]/90 via-[#110c1a]/95 to-black/90 shadow-[inset_0_1px_2px_rgba(253,224,71,0.45)]'
            : 'bg-black/55 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]'
        }`}
      >
        <div className="flex flex-col items-center text-center pt-1">
          <div
            className={`w-full h-8 sm:w-11 sm:h-11 relative flex items-center justify-center rounded-md bg-[#06070b] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] overflow-hidden ${
              isLocked ? 'grayscale brightness-75' : ''
            }`}
          >
            {/* LEGENDARY DUAL-VORTEX SOLAR GOLD & PRISMATIC AURA BEHIND ICON */}
            {isMaxed && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-6 bg-[conic-gradient(from_0deg,#facc15_0deg,#ec4899_90deg,#22d3ee_180deg,#facc15_270deg,#fef08a_360deg)] opacity-90 blur-[3px] pointer-events-none"
                />
                <motion.div
                  animate={{ rotate: -360, scale: [0.9, 1.35, 0.9] }}
                  transition={{
                    rotate: { duration: 5, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="absolute -inset-3 bg-[conic-gradient(from_180deg,transparent_0deg,#fef08a_120deg,transparent_240deg,#38bdf8_320deg,transparent_360deg)] blur-[2px] pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6], scale: [0.85, 1.2, 0.85] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0.5 rounded-md bg- radial from-yellow-200/70 via-amber-400/40 to-transparent pointer-events-none"
                />
              </>
            )}

            <motion.img
              animate={
                isMaxed
                  ? { y: [0, -2.5, 0], scale: [1, 1.12, 1] }
                  : undefined
              }
              transition={
                isMaxed
                  ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                  : undefined
              }
              src={
                isHero
                  ? heroPoses[heroPoseIndex]
                  : getImageUrl(category, resolvedName, Math.max(1, item.level))
              }
              alt={resolvedName}
              className={`relative z-10 w-full h-full object-contain ${
                isMaxed
                  ? 'drop-shadow-[0_0_8px_rgba(253,224,71,0.95)]'
                  : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.95)]'
              }`}
              onError={handleImageError}
            />

            {isLocked && (
              <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
                <Lock className="w-3 h-3 text-rose-400" />
              </div>
            )}
          </div>

          <p
            className={`mt-1 text-[8px] sm:text-[9px] font-bold tracking-tight leading-tight line-clamp-2 ${
              isMaxed
                ? 'bg-gradient-to-r from-yellow-200 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                : 'text-white'
            }`}
          >
            {resolvedName}
          </p>

          {(item.count > 1 || isEpicEquip || levelGain > 0) && (
            <div className="flex items-center justify-center gap-0.5 mt-0.5 flex-wrap">
              {item.count > 1 && (
                <span className="text-[7px] font-mono font-bold text-cyan-300">
                  x{item.count}
                </span>
              )}
              {isEpicEquip && (
                <span className="text-[7px] font-mono font-bold text-violet-300 uppercase">
                  Epic
                </span>
              )}
              {levelGain > 0 && (
                <span className="text-[7px] font-mono font-bold text-emerald-300">
                  +{levelGain}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-1.5 pt-1 border-t border-white/[0.05]">
          <div className="flex items-center justify-between text-[8px] font-mono mb-0.5">
            {isLocked ? (
              <span className="text-rose-400 font-bold">0/{maxAtTh}</span>
            ) : (
              <span className={isMaxed ? 'text-yellow-300 font-bold' : 'text-white font-bold'}>
                Lv.{item.level}
                <span className="text-neutral-500 font-normal">/{maxAtTh}</span>
              </span>
            )}
            {isMaxed ? (
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-1 rounded bg-gradient-to-r from-yellow-400 to-amber-500 text-[7px] font-extrabold text-black uppercase shadow-[0_0_8px_rgba(250,204,21,0.85)]"
              >
                MAX
              </motion.span>
            ) : (
              <span className="text-[7px] text-neutral-500">{Math.round(progressPercent)}%</span>
            )}
          </div>

          <div className="w-full h-1.5 bg-[#030305] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isLocked
                  ? 'bg-rose-900/50'
                  : isMaxed
                  ? 'bg-gradient-to-r from-yellow-300 via-fuchsia-400 to-cyan-300 shadow-[0_0_10px_#facc15]'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* BOX 2 (RIGHT): 3-COLUMN COMPACT UPGRADE MATRIX + TOTAL */}
      <ItemLevelMatrix
        analysis={analysis}
        thLevel={thLevel}
        countMultiplier={item.count || 1}
        workingBuilderIcon={workingBuilderIcon}
      />
    </div>
  );
}
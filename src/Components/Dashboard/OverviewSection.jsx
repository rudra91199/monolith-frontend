import ProgressBar from './ProgressBar';
import { getImageUrl } from './ItemCard';
import {
  analyzeItemUpgrade,
  getHeroStandingPoses,
  useHeroPoseCycle
} from '../../utils/upgradeCalculator';

export default function OverviewSection({
  thLevel,
  thImage,
  heroesCatalog,
  equipmentCatalog,
  rawHomeHeroes,
  progressStats,
  staticData,
  onSelectCard
}) {
  const poseIndex = useHeroPoseCycle(3000);

  const equipMap = new Map();
  equipmentCatalog.forEach((eq) => {
    equipMap.set((eq.name || '').toLowerCase().trim(), eq);
  });

  const rawHeroEquippedMap = new Map();
  (rawHomeHeroes || []).forEach((h) => {
    if (Array.isArray(h.equipment)) {
      rawHeroEquippedMap.set((h.name || '').toLowerCase().trim(), h.equipment);
    }
  });

  return (
    <div className="space-y-8">
      {/* 1. OPEN STANDING HEROES STAGE (No Card Boxes Around Each Hero) */}
      <div className="pt-2 pb-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest drop-shadow">
              Active Hero Lineup
            </h2>
            <p className="text-[10px] text-cyan-300/80 font-mono">
              Tap any Hero or Equipped Gear to inspect upgrade telemetry
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#07080c]/90 border border-cyan-400/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-[10px] font-mono text-cyan-300">
            {heroesCatalog.filter((h) => !h.isLocked).length} / {heroesCatalog.length} Active
          </span>
        </div>

        {/* Standing Heroes Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4 items-end">
          {heroesCatalog.map((hero) => {
            const heroAnalysis = analyzeItemUpgrade(hero, 'heroes', staticData, thLevel);
            const poses = getHeroStandingPoses(hero.name);
            const normHeroName = (hero.name || '').toLowerCase().trim();
            const equippedRaw = rawHeroEquippedMap.get(normHeroName) || [];

            const equippedItems =
              equippedRaw.length > 0
                ? equippedRaw.map((eq) => {
                    const full = equipMap.get((eq.name || '').toLowerCase().trim());
                    return full || eq;
                  })
                : equipmentCatalog
                    .filter((e) => e.hero === hero.name && !e.isLocked)
                    .slice(0, 2);

            return (
              <div
                key={hero.name}
                onClick={() => onSelectCard && onSelectCard(hero, 'heroes', heroAnalysis)}
                className={`group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 ${
                  hero.isLocked ? 'opacity-45 grayscale' : ''
                }`}
              >
                {/* Standing Full-Body Hero with 3-Second Fade-In / Fade-Out */}
                <div className="relative w-32 h-40 sm:w-36 sm:h-44 flex items-end justify-center">
                  {/* Subtle Pedestal Underglow */}
                  {!hero.isLocked && (
                    <div className="absolute bottom-2 w-24 h-6 bg-cyan-400/20 blur-xl rounded-full group-hover:bg-cyan-400/35 transition-colors" />
                  )}

                  <img
                    src={poses[0]}
                    alt={hero.name}
                    className={`w-full h-full object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.95)] transition-opacity duration-2000 ease-in-out ${
                      poseIndex === 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <img
                    src={poses[1]}
                    alt={hero.name}
                    className={`absolute inset-0 w-full h-full object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.95)] transition-opacity duration-2000 ease-in-out ${
                      poseIndex === 1 ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Floating Level Badge at Hero's Feet */}
                  <div className="absolute -bottom-2.5 z-20 px-3 py-0.5 rounded-full bg-gradient-to-b from-[#1e2230] to-[#090a0f] border border-cyan-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.9)]">
                    {hero.isLocked ? (
                      <span className="text-[9px] font-mono font-bold text-rose-400 uppercase">
                        Locked (TH{hero.unlockHallLevel})
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-white">
                        Lv.{hero.level}{' '}
                        <span className="text-[9px] text-cyan-300/80">/{heroAnalysis.maxAtTh}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Hero Name */}
                <p className="mt-4 text-xs font-bold text-white uppercase tracking-wider text-center drop-shadow">
                  {hero.name}
                </p>

                {/* Equipped Gear Dock Under Hero */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  {equippedItems.length > 0 ? (
                    equippedItems.map((eq) => (
                      <div
                        key={eq.name}
                        title={`${eq.name} (Lv.${eq.level})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const eqAnalysis = analyzeItemUpgrade(
                            eq,
                            'equipment',
                            staticData,
                            thLevel
                          );
                          onSelectCard && onSelectCard(eq, 'equipment', eqAnalysis);
                        }}
                        className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-[#1a1c26] to-[#08090d] border border-white/15 hover:border-cyan-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_6px_12px_rgba(0,0,0,0.85)] p-1.5 flex items-center justify-center transition-transform hover:scale-110"
                      >
                        <img
                          src={getImageUrl('equipment', eq.name)}
                          alt={eq.name}
                          className="w-full h-full object-contain drop-shadow"
                        />
                        <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded-md bg-black border border-cyan-400/30 text-[8px] font-mono font-bold text-cyan-300">
                          {eq.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-500">No Gear</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PROGRESSION MATRIX */}
      <div className="backdrop-blur-2xl bg-gradient-to-b from-[#151720]/85 to-[#090a0f]/95 border border-cyan-400/20 border-b-black/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_12px_30px_rgba(0,0,0,0.8)] rounded-3xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
          <img src={thImage} alt="" className="w-7 h-7 object-contain" />
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
            TH{thLevel} Progression Matrix
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <ProgressBar
            label="Heroes"
            stats={progressStats.heroes}
            colorClass="bg-gradient-to-r from-sky-500 to-cyan-300"
          />
          <ProgressBar
            label="Troops & Siege"
            stats={progressStats.troops}
            colorClass="bg-gradient-to-r from-rose-500 to-pink-400"
          />
          <ProgressBar
            label="Spells"
            stats={progressStats.spells}
            colorClass="bg-gradient-to-r from-indigo-500 to-blue-300"
          />
          <ProgressBar
            label="Pets"
            stats={progressStats.pets}
            colorClass="bg-gradient-to-r from-emerald-500 to-teal-300"
          />
          <ProgressBar
            label="Equipment"
            stats={progressStats.equipment}
            colorClass="bg-gradient-to-r from-violet-500 to-purple-300"
          />
          {progressStats.buildings && (
            <ProgressBar
              label="Village Structures"
              stats={progressStats.buildings}
              colorClass="bg-gradient-to-r from-cyan-500 to-teal-300"
            />
          )}
        </div>
      </div>
    </div>
  );
}
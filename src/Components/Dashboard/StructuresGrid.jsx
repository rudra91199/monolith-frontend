import { CLASH_ICONS } from '../../utils/upgradeCalculator';
import ItemCard from './ItemCard';

export default function StructuresGrid({
  buildings,
  staticData,
  thLevel,
  boostConfig,
  workingBuilderIcon,
  onSyncJson,
  onSelect
}) {
  return (
    <div className="backdrop-blur-3xl bg-gradient-to-b from-white/[0.04] to-black/35 sm:rounded-3xl p-1.5 sm:p-4 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_12px_35px_rgba(0,0,0,0.6)]">
      {buildings.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={CLASH_ICONS.structures} alt="" className="w-8 h-8 object-contain shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                  Village Structures &amp; Traps
                </h3>
                <p className="text-[9px] text-neutral-400 font-mono truncate">
                  Full level path &amp; cumulative cost per structure
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSyncJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white text-[9px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
            >
              <img src={workingBuilderIcon} alt="" className="w-4 h-4 object-contain" />
              <span>Sync JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
            {buildings.map((b, idx) => (
              <ItemCard
                key={`${b.dataId}-${b.level}-${idx}`}
                item={b}
                category="buildings"
                staticData={staticData}
                thLevel={thLevel}
                boostConfig={boostConfig}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 px-4 text-center max-w-md mx-auto">
          <img
            src={CLASH_ICONS.structures}
            alt="Structures"
            className="w-14 h-14 mx-auto mb-3 object-contain"
          />
          <h3 className="text-base font-bold text-white mb-1">No Building Snapshot Found</h3>
          <p className="text-xs text-neutral-400 mb-4">
            Upload your Clash of Clans JSON export to track structures, traps, and active builder timers.
          </p>
          <button
            type="button"
            onClick={onSyncJson}
            className="px-5 py-2.5 rounded-md bg-white text-black font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            Upload Village JSON
          </button>
        </div>
      )}
    </div>
  );
}
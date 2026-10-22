import { formatTime } from '../../utils/upgradeCalculator';
import { getImageUrl } from './ItemCard';

export default function BuildersPanel({ activeBuilders, workingIcon, freeIcon, onSyncJson }) {
  const totalSlots = Math.max(6, activeBuilders.length);
  const slots = Array.from({ length: totalSlots }, (_, idx) => activeBuilders[idx] || null);
  const freeCount = totalSlots - activeBuilders.length;
  const isAnyWorking = activeBuilders.length > 0;

  return (
    <div className="backdrop-blur-2xl bg-gradient-to-b from-[#14151b]/90 to-[#08090c]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_14px_35px_rgba(0,0,0,0.8)] rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-3.5">
          <div
            className={`relative w-12 h-12 rounded-2xl p-1.5 flex items-center justify-center shrink-0 ${
              isAnyWorking
                ? 'bg-gradient-to-b from-[#132822] to-[#07110e] shadow-[inset_0_1px_1px_rgba(52,211,153,0.3),inset_0_-2px_6px_rgba(0,0,0,0.9)]'
                : 'bg-[#060608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]'
            }`}
          >
            <img
              src={isAnyWorking ? workingIcon : freeIcon}
              alt="Builder"
              className="w-full h-full object-contain drop-shadow"
            />
            {isAnyWorking && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
                Village Builders ({activeBuilders.length}/{totalSlots} Working)
              </h3>
              {isAnyWorking && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 shadow-[inset_0_1px_1px_rgba(52,211,153,0.3)] text-[9px] font-mono font-bold text-emerald-300 uppercase">
                  Active
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
              {freeCount > 0
                ? `${freeCount} Builder${freeCount > 1 ? 's' : ''} Idle & Ready`
                : 'All Builders Occupied'}
            </p>
          </div>
        </div>

        {onSyncJson && (
          <button
            type="button"
            onClick={onSyncJson}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-white/[0.14] to-white/[0.04] hover:from-white/[0.2] hover:to-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_14px_rgba(0,0,0,0.7)] text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer transition-all"
          >
            Refresh Timers
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((b, idx) =>
          b ? (
            <div
              key={b.id}
              className="relative overflow-hidden flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-b from-[#152324]/90 to-[#090d10]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-2px_6px_rgba(0,0,0,0.9),0_8px_20px_rgba(0,0,0,0.75)] gap-2"
            >
              {/* Soft Ambient Working Glow */}
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-400/15 blur-2xl rounded-full pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl bg-black/50 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={workingIcon}
                    alt="Working"
                    className="w-full h-full object-contain drop-shadow"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] p-1 flex items-center justify-center shrink-0">
                  <img
                    src={getImageUrl(b.category || 'buildings', b.name, b.currentLevel)}
                    alt={b.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = workingIcon;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{b.name}</p>
                  <p className="text-[10px] font-mono text-emerald-300/90 mt-0.5 font-bold">
                    Working &bull; Lv.{b.currentLevel} &rarr; Lv.{b.targetLevel}
                  </p>
                </div>
              </div>

              <span className="relative z-10 px-3 py-1.5 rounded-xl bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(0,0,0,0.6)] text-xs font-mono font-bold text-emerald-300 shrink-0">
                {formatTime(b.remainingSeconds)}
              </span>
            </div>
          ) : (
            <div
              key={`free-builder-${idx}`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#07080b]/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] gap-2 opacity-75"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] p-1.5 flex items-center justify-center shrink-0">
                  <img src={freeIcon} alt="Idle" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-300 truncate">
                    Builder #{idx + 1} Free
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">
                    Idle in Hut
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-[10px] font-mono font-bold text-neutral-400 uppercase shrink-0">
                Idle
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
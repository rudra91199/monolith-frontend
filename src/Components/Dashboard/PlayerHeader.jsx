import { CLASH_ICONS, useBuilderIcon } from '../../utils/upgradeCalculator';

export default function PlayerHeader({
  playerData,
  previousData,
  thLevel,
  thImage,
  userRole,
  onSyncJson,
  isOverview = true
}) {
  const workingBuilderIcon = useBuilderIcon(true);

  const getDiff = (field) => {
    if (!previousData || previousData[field] === undefined || playerData?.[field] === undefined) {
      return 0;
    }
    return (playerData[field] || 0) - (previousData[field] || 0);
  };

  const trophyDiff = getDiff('trophies');
  const warStarDiff = getDiff('warStars');
  const capDiff = getDiff('capitalContribution');
  const donDiff = getDiff('donations');
  const recDiff = getDiff('donationsReceived');

  const capitalGold =
    playerData?.capitalContribution ?? playerData?.clanCapitalContributions ?? 0;

  return (
    <div className="backdrop-blur-2xl bg-gradient-to-b from-[#151720]/90 to-[#090a0f]/95 border border-cyan-400/20 border-b-black/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_12px_35px_rgba(0,0,0,0.8)] rounded-3xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#050608] border border-cyan-400/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-[10px] text-cyan-300 font-mono tracking-widest">
              {playerData?.playerTag}
            </span>
            {onSyncJson && (
              <button
                type="button"
                onClick={onSyncJson}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-b from-cyan-500/25 to-cyan-600/10 hover:from-cyan-400/35 hover:to-cyan-500/15 border border-cyan-400/35 border-b-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(6,182,212,0.2)] text-[10px] text-cyan-200 font-bold uppercase tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
              >
                <img src={workingBuilderIcon} alt="" className="w-4 h-4 object-contain" />
                <span>Sync JSON</span>
              </button>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-wide truncate drop-shadow-md">
            {playerData?.name || 'Chief'}
          </h1>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">
            {userRole?.replace('admin', 'Elder').replace('coLeader', 'Co-Leader')} &bull; XP{' '}
            {playerData?.expLevel || '--'}
          </p>
        </div>

        <div className="relative shrink-0 w-16 h-16 sm:w-22 sm:h-22">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[24px] rounded-full" />
          <img
            src={thImage}
            alt={`TH${thLevel}`}
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.9)]"
          />
          <div className="absolute -bottom-1 right-0 px-2.5 py-0.5 bg-gradient-to-b from-[#1e2230] to-[#0a0c12] border border-cyan-400/40 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.85)] z-20">
            <span className="text-[9px] text-cyan-200 font-mono font-bold tracking-wider">
              TH{thLevel}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Card Telemetry Row (Shown on Overview) */}
      {isOverview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full mt-4 pt-4 border-t border-white/[0.07]">
          {/* 1. Trophies & Best Trophies */}
          <div className="flex items-center gap-2.5 bg-[#06070a]/90 border border-sky-400/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-2.5 min-w-0">
            <img
              src={CLASH_ICONS.trophy}
              alt="Trophies"
              className="w-7 h-7 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-sky-400 font-bold truncate">
                Trophies (Best: {playerData?.bestTrophies || 0})
              </p>
              <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                {(playerData?.trophies || 0).toLocaleString()}
                {trophyDiff > 0 && (
                  <span className="text-[10px] text-emerald-400 ml-1">+{trophyDiff}</span>
                )}
              </p>
            </div>
          </div>

          {/* 2. War Stars */}
          <div className="flex items-center gap-2.5 bg-[#06070a]/90 border border-indigo-400/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-2.5 min-w-0">
            <img
              src={CLASH_ICONS.stars}
              alt="War Stars"
              className="w-7 h-7 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-indigo-300 font-bold truncate">
                War Stars
              </p>
              <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                {(playerData?.warStars || 0).toLocaleString()}
                {warStarDiff > 0 && (
                  <span className="text-[10px] text-emerald-400 ml-1">+{warStarDiff}</span>
                )}
              </p>
            </div>
          </div>

          {/* 3. Capital Gold Contributions */}
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 bg-violet-950/20 border border-violet-400/25 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-2.5 min-w-0">
            <img
              src={CLASH_ICONS.capitalGold}
              alt="Capital Gold"
              className="w-7 h-7 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-violet-300 font-bold truncate">
                Capital Gold
              </p>
              <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                {capitalGold.toLocaleString()}
                {capDiff > 0 && (
                  <span className="text-[10px] text-emerald-400 ml-1">+{capDiff.toLocaleString()}</span>
                )}
              </p>
            </div>
          </div>

          {/* 4. Donated */}
          <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-400/25 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-2.5 min-w-0">
            <img
              src={CLASH_ICONS.clanCastle}
              alt="Donated"
              className="w-7 h-7 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold truncate">
                Donated
              </p>
              <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                {(playerData?.donations || 0).toLocaleString()}
                {donDiff > 0 && (
                  <span className="text-[10px] text-emerald-400 ml-1">+{donDiff}</span>
                )}
              </p>
            </div>
          </div>

          {/* 5. Received */}
          <div className="flex items-center gap-2.5 bg-rose-950/20 border border-rose-400/25 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-2.5 min-w-0">
            <img
              src={CLASH_ICONS.clanCake}
              alt="Received"
              className="w-7 h-7 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-rose-300 font-bold truncate">
                Received
              </p>
              <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                {(playerData?.donationsReceived || 0).toLocaleString()}
                {recDiff > 0 && (
                  <span className="text-[10px] text-rose-400 ml-1">+{recDiff}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
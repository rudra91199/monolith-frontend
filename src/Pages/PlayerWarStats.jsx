import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useVillage } from '../Context/VillageContext';
import { CLASH_ICONS } from '../utils/upgradeCalculator';
import WarStars, { SingleStar } from '../Components/Common/WarStars';

export default function PlayerWarStats() {
  const { activeVillage, loadingProfile } = useVillage();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  const playerTag = activeVillage?.tag || null;
  const warIcon = CLASH_ICONS.war || CLASH_ICONS.cwl;
  const starIcon = CLASH_ICONS.star || CLASH_ICONS.stars || warIcon;

  useEffect(() => {
    if (loadingProfile) return;
    if (!playerTag) {
      setStatsData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/api/war/player/${encodeURIComponent(playerTag)}`)
      .then((res) => setStatsData(res.data?.data || null))
      .catch(() => setStatsData(null))
      .finally(() => setLoading(false));
  }, [playerTag, loadingProfile]);

  const recentWars = statsData?.recentWars || [];

  const careerMetrics = useMemo(() => {
    let totalStars = 0;
    let totalDestruction = 0;
    let totalHitsExecuted = 0;
    let threeStarTriples = 0;
    let endedWarsMissed = 0;

    recentWars.forEach((w) => {
      const perf = w.playerPerformance || {};
      const hits = perf.attacks || [];
      totalHitsExecuted += hits.length;
      totalStars += perf.totalStars || 0;
      totalDestruction += perf.totalDestruction || 0;

      hits.forEach((h) => {
        if (h.stars === 3) threeStarTriples += 1;
      });

      if (w.state === 'warEnded') {
        const allowed = perf.attacksAllowed || (w.warType === 'cwl' ? 1 : 2);
        endedWarsMissed += Math.max(0, allowed - hits.length);
      }
    });

    return {
      warsCount: recentWars.length,
      totalStars,
      avgStars: totalHitsExecuted > 0 ? (totalStars / totalHitsExecuted).toFixed(2) : '0.00',
      avgDestruction:
        totalHitsExecuted > 0 ? (totalDestruction / totalHitsExecuted).toFixed(1) : '0.0',
      threeStarTriples,
      totalHitsExecuted,
      endedWarsMissed
    };
  }, [recentWars]);

  if (loadingProfile || loading) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center px-4">
        <img
          src={warIcon}
          alt="War Stats"
          className="w-16 h-16 object-contain animate-bounce mb-4"
        />
        <p className="text-[11px] text-neutral-300 tracking-[0.3em] uppercase font-bold animate-pulse">
          Loading Chief War Dossier...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1640px] mx-auto px-1 sm:px-4 lg:px-6 pt-2 sm:pt-5 space-y-3">
      <div className="backdrop-blur-2xl bg-gradient-to-b from-[#161822]/90 to-[#08090d]/95 rounded-3xl p-5 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_15px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <img
              src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${
                activeVillage?.townHallLevel || 1
              }.webp`}
              alt=""
              className="w-12 h-12 object-contain drop-shadow"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white uppercase tracking-wide">
                {activeVillage?.name} &mdash; War Combat Log
              </h1>
              <p className="text-[10px] font-mono text-neutral-400">
                {playerTag} &bull; Aggregated Classic War &amp; CWL Performance
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#050608] text-[10px] font-mono font-bold text-cyan-300">
            {careerMetrics.warsCount} Wars Logged
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#050608]/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center gap-3">
            <img src={starIcon} alt="" className="w-8 h-8 object-contain shrink-0 drop-shadow" />
            <div>
              <p className="text-[9px] font-mono uppercase text-neutral-400">Total War Stars</p>
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-white">
                <span>{careerMetrics.totalStars}</span>
                <SingleStar className="w-4 h-4" />
                <span className="text-[10px] text-cyan-300">({careerMetrics.avgStars} Avg)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050608]/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center gap-3">
            <img src={warIcon} alt="" className="w-8 h-8 object-contain shrink-0 drop-shadow" />
            <div>
              <p className="text-[9px] font-mono uppercase text-neutral-400">Avg Destruction</p>
              <p className="text-sm sm:text-base font-mono font-bold text-emerald-300">
                {careerMetrics.avgDestruction}%
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050608]/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center gap-3">
            <WarStars count={3} size="w-4 h-4" />
            <div>
              <p className="text-[9px] font-mono uppercase text-neutral-400">3-Star Triples</p>
              <p className="text-sm sm:text-base font-mono font-bold text-white">
                {careerMetrics.threeStarTriples} Triples
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050608]/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center gap-3">
            <img
              src={CLASH_ICONS.leagueMedals}
              alt=""
              className="w-8 h-8 object-contain shrink-0 drop-shadow"
            />
            <div>
              <p className="text-[9px] font-mono uppercase text-neutral-400">Total Hits Logged</p>
              <p className="text-sm sm:text-base font-mono font-bold text-white">
                {careerMetrics.totalHitsExecuted} Hits{' '}
                {careerMetrics.endedWarsMissed > 0 && (
                  <span className="text-[10px] text-rose-400">
                    ({careerMetrics.endedWarsMissed} Missed)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {recentWars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recentWars.map((w) => {
            const perf = w.playerPerformance || {};
            const hits = perf.attacks || [];
            const allowed = perf.attacksAllowed || (w.warType === 'cwl' ? 1 : 2);
            const remaining = Math.max(0, allowed - hits.length);
            const isEnded = w.state === 'warEnded';

            return (
              <div
                key={w.warId}
                className="p-4 rounded-2xl bg-gradient-to-b from-[#151720]/90 to-[#08090d]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.75)] space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={w.enemyClan?.badgeUrl || warIcon}
                      alt=""
                      className="w-9 h-9 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        vs {w.enemyClan?.name || 'Opponent'}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-400 uppercase">
                        {w.warType === 'cwl' ? `CWL R${w.cwlRound || ''}` : 'Classic War'} &bull;{' '}
                        {isEnded ? w.result.toUpperCase() : 'Battle Day Live'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#050608] inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-300 shrink-0">
                    <span>Pos #{perf.mapPosition || '-'} &bull;</span>
                    <SingleStar className="w-3.5 h-3.5" />
                    <span>{perf.totalStars || 0}</span>
                  </span>
                </div>

                <div className="rounded-xl bg-[#050609]/95 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] divide-y divide-white/[0.04] px-3 py-1">
                  {hits.length > 0 ? (
                    hits.map((att, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono"
                      >
                        <span className="text-white font-bold truncate">
                          Hit {idx + 1} &rarr; #{att.defenderMapPosition || '?'} {att.defenderName} (TH
                          {att.defenderTownHall})
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <WarStars count={att.stars} size="w-4 h-4" />
                          <span className="text-cyan-300 font-bold min-w-[36px] text-right">
                            {Number(att.destructionPercentage || 0).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-neutral-400">
                        {isEnded ? 'No attacks used in war' : 'War in progress'}
                      </span>
                      <span className={isEnded ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
                        {isEnded
                          ? `${remaining} Attack${remaining > 1 ? 's' : ''} Missed`
                          : `${remaining} Attack${remaining > 1 ? 's' : ''} Remaining`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-[#090a0f]/80 text-center space-y-2">
          <img src={warIcon} alt="" className="w-10 h-10 object-contain mx-auto opacity-60" />
          <p className="text-xs font-bold uppercase tracking-widest text-white">
            No War Attacks Archived For {activeVillage?.name} Yet
          </p>
        </div>
      )}
    </div>
  );
}
import { useMemo } from 'react';
import { CLASH_ICONS } from '../../utils/upgradeCalculator';
import { SingleStar } from '../Common/WarStars';

const getThBreakdown = (members = []) => {
  const counts = {};
  members.forEach((m) => {
    const th = Number(m.townHallLevel || m.townhallLevel || 1);
    counts[th] = (counts[th] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([th, count]) => ({ th: Number(th), count }))
    .sort((a, b) => b.th - a.th);
};

export default function WarScoreboard({ war }) {
  if (!war) return null;

  const our = war.ourClan || {};
  const enemy = war.enemyClan || {};
  const maxStars = (war.teamSize || 15) * 3;
  const maxAttacks = (war.teamSize || 15) * (war.attacksPerMember || 2);

  const ourActualHits =
    our.attacks ||
    (war.participants || []).reduce((sum, p) => sum + (p.attacks?.length || p.attacksUsed || 0), 0);

  const enemyActualHits =
    enemy.attacks ||
    (enemy.members || []).reduce((sum, m) => sum + (m.attacks?.length || 0), 0);

  const ourThList = useMemo(
    () => getThBreakdown(war.participants?.length ? war.participants : our.members || []),
    [war.participants, our.members]
  );

  const enemyThList = useMemo(
    () => getThBreakdown(enemy.members || []),
    [enemy.members]
  );

  const stateBadge =
    war.state === 'inWar'
      ? { label: 'Battle Day Live', color: 'bg-emerald-500/20 text-emerald-300' }
      : war.state === 'preparation'
      ? { label: 'Preparation Day', color: 'bg-sky-500/20 text-sky-300' }
      : {
          label: `War Ended • ${(war.result || 'done').toUpperCase()}`,
          color:
            war.result === 'win'
              ? 'bg-emerald-500/20 text-emerald-300'
              : war.result === 'lose'
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-white/10 text-neutral-300'
        };

  return (
    <div className="backdrop-blur-2xl bg-gradient-to-b from-[#161822]/90 to-[#08090d]/95 rounded-3xl p-4 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_15px_40px_rgba(0,0,0,0.85)]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#050608] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-[10px] font-mono font-bold text-cyan-300 uppercase">
            {war.warType === 'cwl' ? `CWL Round ${war.cwlRound || ''}` : 'Classic War'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-[10px] font-mono text-neutral-300">
            {war.teamSize} vs {war.teamSize}
          </span>
        </div>

        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${stateBadge.color}`}>
          {stateBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-stretch pt-4">
        {/* Our Clan Box */}
        <div className="md:col-span-5 flex flex-col justify-between bg-[#050609]/90 rounded-2xl p-3.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={our.badgeUrl || CLASH_ICONS.clanCastle}
                alt={our.name}
                className="w-12 h-12 object-contain shrink-0 drop-shadow"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{our.name}</p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {our.tag} &bull; {ourActualHits}/{maxAttacks} Hits
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 text-base sm:text-lg font-mono font-bold text-cyan-300">
                <SingleStar className="w-5 h-5" />
                <span>{our.stars || 0}</span>
                <span className="text-[10px] text-neutral-500">/{maxStars}</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-300 font-bold">
                {Number(our.destructionPercentage || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Our Town Hall Lineup Counts */}
          {ourThList.length > 0 && (
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-1.5 flex-wrap">
              {ourThList.map(({ th, count }) => (
                <div
                  key={th}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] text-[10px] font-mono"
                >
                  <img
                    src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${th}.webp`}
                    alt={`TH${th}`}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-white font-bold">x{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VS Icon */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] p-2 flex items-center justify-center">
            <img src={CLASH_ICONS.war || CLASH_ICONS.cwl} alt="VS" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Enemy Clan Box (With Opponent Town Hall Images & Counts) */}
        <div className="md:col-span-5 flex flex-col justify-between bg-[#050609]/90 rounded-2xl p-3.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={enemy.badgeUrl || CLASH_ICONS.war || CLASH_ICONS.cwl}
                alt={enemy.name}
                className="w-12 h-12 object-contain shrink-0 drop-shadow"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{enemy.name}</p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {enemy.tag} &bull; {enemyActualHits}/{maxAttacks} Hits
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 text-base sm:text-lg font-mono font-bold text-rose-300">
                <SingleStar className="w-5 h-5" />
                <span>{enemy.stars || 0}</span>
                <span className="text-[10px] text-neutral-500">/{maxStars}</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-300 font-bold">
                {Number(enemy.destructionPercentage || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Opponent Town Hall Lineup Images & Counts */}
          {enemyThList.length > 0 && (
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-1.5 flex-wrap">
              {enemyThList.map(({ th, count }) => (
                <div
                  key={th}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] text-[10px] font-mono"
                >
                  <img
                    src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${th}.webp`}
                    alt={`TH${th}`}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-rose-200 font-bold">x{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
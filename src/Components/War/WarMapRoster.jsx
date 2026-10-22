import { useState, useMemo } from 'react';
import { CLASH_ICONS } from '../../utils/upgradeCalculator';
import WarStars, { SingleStar } from '../Common/WarStars';

export default function WarMapRoster({ war }) {
  const [rosterTab, setRosterTab] = useState('ours');

  const ourMembers = war?.participants || [];
  const rawEnemyMembers = war?.enemyClan?.members || [];
  const attacksAllowed = war?.attacksPerMember || (war?.warType === 'cwl' ? 1 : 2);
  const isWarEnded = war?.state === 'warEnded';

  const ourMemberMap = useMemo(() => {
    const map = new Map();
    ourMembers.forEach((m) => map.set(m.tag, m));
    (war?.ourClan?.members || []).forEach((m) => {
      if (!map.has(m.tag)) map.set(m.tag, m);
    });
    return map;
  }, [ourMembers, war]);

  const enemyParticipants = useMemo(() => {
    return [...rawEnemyMembers]
      .sort((a, b) => (a.mapPosition || 99) - (b.mapPosition || 99))
      .map((em) => {
        const rawHits = Array.isArray(em.attacks) ? em.attacks : [];
        const mappedHits = rawHits.map((att) => {
          const ourDef = ourMemberMap.get(att.defenderTag);
          return {
            order: att.order || 0,
            defenderTag: att.defenderTag,
            defenderName: ourDef?.name || 'Our Base',
            defenderTownHall: ourDef?.townHallLevel || ourDef?.townhallLevel || 1,
            defenderMapPosition: ourDef?.mapPosition || '?',
            stars: Number(att.stars || 0),
            destructionPercentage: Number(
              att.destructionPercentage ?? att.destruction ?? 0
            )
          };
        });

        const totalStars = mappedHits.reduce((s, a) => s + a.stars, 0);
        return {
          tag: em.tag,
          name: em.name,
          townHallLevel: em.townhallLevel || em.townHallLevel || 1,
          mapPosition: em.mapPosition || 0,
          attacksAllowed,
          attacksUsed: mappedHits.length,
          totalStars,
          attacks: mappedHits
        };
      });
  }, [rawEnemyMembers, ourMemberMap, attacksAllowed]);

  const activeList = rosterTab === 'ours' ? ourMembers : enemyParticipants;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#06070a]/95 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)]">
        <button
          type="button"
          onClick={() => setRosterTab('ours')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
            rosterTab === 'ours'
              ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.7)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <img
            src={war?.ourClan?.badgeUrl || CLASH_ICONS.clanCastle}
            alt=""
            className="w-5 h-5 object-contain"
          />
          <span className="truncate">{war?.ourClan?.name || 'Our Clan'} Attacks</span>
        </button>

        <button
          type="button"
          onClick={() => setRosterTab('opponent')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
            rosterTab === 'opponent'
              ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.7)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <img
            src={war?.enemyClan?.badgeUrl || CLASH_ICONS.war || CLASH_ICONS.cwl}
            alt=""
            className="w-5 h-5 object-contain"
          />
          <span className="truncate">{war?.enemyClan?.name || 'Opponent'} Attacks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeList.map((p) => {
          const attacks = p.attacks || [];
          const remainingHits = Math.max(0, (p.attacksAllowed || attacksAllowed) - attacks.length);

          return (
            <div
              key={p.tag}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-[#151720]/90 to-[#08090d]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.75)] flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#050608] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300 shrink-0">
                    #{p.mapPosition || '-'}
                  </span>
                  <img
                    src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${
                      p.townHallLevel || 1
                    }.webp`}
                    alt={`TH${p.townHallLevel}`}
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[9px] font-mono text-neutral-400">{p.tag}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-[#050608] inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-white shrink-0">
                  <span>{attacks.length}/{p.attacksAllowed || attacksAllowed} Hits &bull;</span>
                  <SingleStar className="w-3.5 h-3.5" />
                  <span>{p.totalStars || 0}</span>
                </span>
              </div>

              <div className="rounded-xl bg-[#050609]/95 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] divide-y divide-white/[0.04] px-3 py-1">
                {attacks.length > 0 ? (
                  attacks.map((att, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono"
                    >
                      <div className="min-w-0 truncate">
                        <span className="text-neutral-400 mr-1">Hit {idx + 1} &rarr;</span>
                        <span className="text-white font-bold">
                          #{att.defenderMapPosition || '?'} {att.defenderName}
                        </span>
                        <span className="text-neutral-500 ml-1">(TH{att.defenderTownHall})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <WarStars count={att.stars} size="w-4 h-4" />
                        <span className="text-neutral-300 font-bold min-w-[36px] text-right">
                          {Number(att.destructionPercentage || 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">No attacks launched yet</span>
                    <span className={isWarEnded ? 'text-rose-400 font-bold' : 'text-cyan-300/80'}>
                      {isWarEnded ? `${remainingHits} Missed` : `${remainingHits} Left`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
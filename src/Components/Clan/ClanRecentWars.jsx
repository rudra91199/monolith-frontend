import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../../utils/api';
import { CLASH_ICONS } from '../../utils/upgradeCalculator';
import { SingleStar } from '../Common/WarStars';

export default function ClanRecentWars({ clanTag }) {
  const [wars, setWars] = useState([]);
  const [loading, setLoading] = useState(true);
  const warIcon = CLASH_ICONS.war || CLASH_ICONS.cwl;

  useEffect(() => {
    if (!clanTag) return;
    setLoading(true);
    api
      .get(`/api/war/clan/${encodeURIComponent(clanTag)}`)
      .then((res) => {
        setWars((res.data?.data?.allArchivedWars || []).slice(0, 4));
      })
      .catch(() => setWars([]))
      .finally(() => setLoading(false));
  }, [clanTag]);

  return (
    <div className="backdrop-blur-xl bg-[#070709]/80 rounded-3xl p-5 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <img src={warIcon} alt="" className="w-6 h-6 object-contain" />
          <h3 className="text-xs sm:text-sm font-serif text-white uppercase tracking-widest">
            Recent War Stats
          </h3>
        </div>
        <Link
          to="/dashboard/wars"
          className="text-[10px] text-cyan-300 hover:underline uppercase tracking-widest font-bold"
        >
          Open War Log &rarr;
        </Link>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-neutral-400 py-4">Syncing recent wars...</p>
      ) : wars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wars.map((w) => {
            const isLive = w.state === 'inWar' || w.state === 'preparation';
            return (
              <Link
                key={w.warId}
                to="/dashboard/wars"
                className="p-3.5 rounded-2xl bg-[#050608]/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center justify-between gap-2 hover:bg-white/[0.03] transition-colors"
              >
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
                      {w.teamSize}v{w.teamSize} &bull;{' '}
                      {isLive ? 'Battle Live' : (w.result || 'Ended').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
                    <span>{w.ourClan?.stars || 0}</span>
                    <SingleStar className="w-3.5 h-3.5" />
                    <span className="text-neutral-500">-</span>
                    <span>{w.enemyClan?.stars || 0}</span>
                    <SingleStar className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {Number(w.ourClan?.destructionPercentage || 0).toFixed(1)}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-xs font-mono text-neutral-500 py-2">
          No archived wars yet. Visit Clan Wars to sync live war telemetry.
        </p>
      )}
    </div>
  );
}
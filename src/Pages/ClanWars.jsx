import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useVillage } from '../Context/VillageContext';
import { CLASH_ICONS } from '../utils/upgradeCalculator';
import WarScoreboard from '../Components/War/WarScoreboard';
import WarMapRoster from '../Components/War/WarMapRoster';

export default function ClanWars() {
  const { activeVillage, loadingProfile } = useVillage();
  const [loading, setLoading] = useState(true);
  const [warPayload, setWarPayload] = useState(null);
  const [selectedWarId, setSelectedWarId] = useState(null);

  const clanTag = activeVillage?.clanTag || null;
  const warIcon = CLASH_ICONS.war || CLASH_ICONS.cwl;

  useEffect(() => {
    if (loadingProfile) return;
    if (!clanTag) {
      setWarPayload(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/api/war/clan/${encodeURIComponent(clanTag)}`)
      .then((res) => {
        const data = res.data?.data || null;
        setWarPayload(data);
        if (data?.activeWar?.warId) {
          setSelectedWarId(data.activeWar.warId);
        } else if (data?.allArchivedWars?.[0]?.warId) {
          setSelectedWarId(data.allArchivedWars[0].warId);
        }
      })
      .catch(() => setWarPayload(null))
      .finally(() => setLoading(false));
  }, [clanTag, loadingProfile]);

  if (loadingProfile || loading) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center px-4">
        <img
          src={warIcon}
          alt="Clan Wars"
          className="w-16 h-16 object-contain animate-bounce mb-4"
        />
        <p className="text-[11px] text-neutral-300 tracking-[0.3em] uppercase font-bold animate-pulse">
          Intercepting Clan War Telemetry...
        </p>
      </div>
    );
  }

  if (!clanTag) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center p-6">
        <img src={warIcon} alt="" className="w-14 h-14 object-contain mb-3 opacity-60" />
        <h2 className="text-xl font-bold text-white mb-1">No Clan Affiliated</h2>
        <p className="text-xs text-neutral-400 max-w-md">
          Switch to a village in a clan to inspect live Clan Wars and archived war logs.
        </p>
      </div>
    );
  }

  const archivedWars = warPayload?.allArchivedWars || [];
  const currentWar =
    archivedWars.find((w) => w.warId === selectedWarId) ||
    warPayload?.activeWar ||
    archivedWars[0] ||
    null;

  return (
    <div className="w-full max-w-[1640px] mx-auto px-1 sm:px-4 lg:px-6 pt-2 sm:pt-5 space-y-3">
      {/* ALWAYS VISIBLE CURRENT & PREVIOUS WARS SELECTOR BAR */}
      <div className="backdrop-blur-2xl bg-gradient-to-b from-[#151720]/90 to-[#08090d]/95 rounded-2xl p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_8px_20px_rgba(0,0,0,0.75)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img src={warIcon} alt="" className="w-5 h-5 object-contain" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Current &amp; Previous Wars ({archivedWars.length} Archived)
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Select any war to inspect attacks
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {archivedWars.map((w, idx) => {
            const active = currentWar?.warId === w.warId;
            const isLive = w.state === 'inWar' || w.state === 'preparation';
            return (
              <button
                key={w.warId}
                type="button"
                onClick={() => setSelectedWarId(w.warId)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold uppercase whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                  active
                    ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.7)]'
                    : 'bg-[#050608] text-neutral-400 hover:text-white'
                }`}
              >
                {isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span>
                  {isLive ? 'LIVE:' : `#${idx + 1}`} vs {w.enemyClan?.name || 'Opponent'} (
                  {w.ourClan?.stars || 0}★ - {w.enemyClan?.stars || 0}★)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentWar ? (
        <>
          <WarScoreboard war={currentWar} />
          <WarMapRoster war={currentWar} />
        </>
      ) : (
        <div className="p-12 rounded-3xl bg-[#090a0f]/85 text-center space-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
          <img src={warIcon} alt="" className="w-12 h-12 object-contain mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold uppercase tracking-widest text-white">
            No Active or Archived Wars Found
          </h3>
          <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
            Start a Clan War so Monolith can automatically archive war telemetry.
          </p>
        </div>
      )}
    </div>
  );
}
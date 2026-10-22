import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Clock, Gift, Users } from 'lucide-react';
import api from '../utils/api';
import { useVillage } from '../Context/VillageContext';
import { CLASH_ICONS, formatTime } from '../utils/upgradeCalculator';
import ClanGamesRewards from '../Components/ClanGames/ClanGamesRewards';

const BONUS_THRESHOLD = 4000;
const PLAYER_MAX_POINTS = 10000;
const CLAN_MAX_POINTS = 50000;

export default function ClanGames() {
  const { activeVillage, loadingProfile } = useVillage();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [gamesData, setGamesData] = useState(null);
  const [activeView, setActiveView] = useState('scores'); // 'scores' | 'rewards'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('earned');
  const [nowMs, setNowMs] = useState(Date.now());

  const clanTag = activeVillage?.clanTag || null;
  const userRole = (activeVillage?.role || 'member').toLowerCase();
  const isLeaderOrCo = ['leader', 'coleader'].includes(userRole);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchGamesTelemetry = async (resetBaseline = false) => {
    if (!clanTag) {
      setGamesData(null);
      setLoading(false);
      return;
    }
    try {
      if (resetBaseline) setSyncing(true);
      else setLoading(true);

      const url = `/api/clan-games/${encodeURIComponent(clanTag)}${
        resetBaseline ? '?reset=true' : ''
      }`;
      const res = await api.get(url);
      setGamesData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch Clan Games:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (loadingProfile) return;
    fetchGamesTelemetry(false);
  }, [clanTag, loadingProfile]);

  const scheduleInfo = useMemo(() => {
    const now = new Date(nowMs);
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const startMs = Date.UTC(year, month, 22, 8, 0, 0);
    const endMs = Date.UTC(year, month, 28, 8, 0, 0);

    if (nowMs < startMs) {
      return {
        status: 'UPCOMING',
        label: 'Starts In',
        secondsLeft: Math.max(0, Math.floor((startMs - nowMs) / 1000))
      };
    }
    if (nowMs >= startMs && nowMs <= endMs) {
      return {
        status: 'ACTIVE',
        label: 'Ends In',
        secondsLeft: Math.max(0, Math.floor((endMs - nowMs) / 1000))
      };
    }
    return { status: 'ENDED', label: 'Season Complete', secondsLeft: 0 };
  }, [nowMs]);

  const filteredMembers = useMemo(() => {
    const list = gamesData?.members || [];
    const q = searchQuery.toLowerCase().trim();
    const matched = list.filter(
      (m) => m.name?.toLowerCase().includes(q) || m.tag?.toLowerCase().includes(q)
    );

    return [...matched].sort((a, b) => {
      if (sortBy === 'lifetime') return (b.currentPoints || 0) - (a.currentPoints || 0);
      if (sortBy === 'th') return (b.townHallLevel || 0) - (a.townHallLevel || 0);
      return (
        (b.pointsEarned || 0) - (a.pointsEarned || 0) ||
        (b.currentPoints || 0) - (a.currentPoints || 0)
      );
    });
  }, [gamesData, searchQuery, sortBy]);

  if (loadingProfile || loading) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center px-4">
        <img
          src={CLASH_ICONS.clanGames}
          alt="Clan Games"
          className="w-20 h-20 object-contain animate-bounce mb-4 drop-shadow"
        />
        <p className="text-[11px] text-neutral-300 tracking-[0.3em] uppercase font-bold animate-pulse">
          Syncing Clan Games Caravan...
        </p>
      </div>
    );
  }

  if (!clanTag) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center p-6">
        <img src={CLASH_ICONS.clanGames} alt="" className="w-20 h-20 object-contain mb-4 opacity-60" />
        <h2 className="text-2xl font-serif text-white mb-2">No Clan Affiliated</h2>
      </div>
    );
  }

  const totalPoints = gamesData?.totalPoints || 0;
  const clanProgressPct = Math.min(100, (totalPoints / CLAN_MAX_POINTS) * 100);
  const bonusUnlockedCount = (gamesData?.members || []).filter(
    (m) => (m.pointsEarned || 0) >= BONUS_THRESHOLD
  ).length;
  const activeCount = (gamesData?.members || []).filter((m) => (m.pointsEarned || 0) > 0).length;

  return (
    <div className="relative w-full min-h-screen pb-28 lg:pb-16 overflow-x-hidden">
      <div className="w-full max-w-[1640px] mx-auto px-2 sm:px-5 lg:px-7 pt-3 sm:pt-5 space-y-4">
        {/* 1. COMPACT HEADER + PROGRESS BAR + VIEW SWITCHER TABS */}
        <div className="backdrop-blur-2xl bg-gradient-to-b from-[#161822]/90 to-[#08090d]/95 rounded-3xl p-4 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_15px_40px_rgba(0,0,0,0.85)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#050608] shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] p-1.5 flex items-center justify-center shrink-0">
                <img src={CLASH_ICONS.clanGames} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#050608] text-[9px] font-mono text-cyan-300 uppercase">
                    Season {gamesData?.season || 'Current'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[9px] font-mono font-bold text-emerald-300 uppercase">
                    {scheduleInfo.status}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-white uppercase tracking-wide">
                  Clan Games Telemetry
                </h1>
                <p className="text-[10px] font-mono text-neutral-400">
                  4,000 Pts = Bonus Reward &bull; 10,000 Pts = Personal Cap
                </p>
              </div>
            </div>

            {/* Compact KPI Pills & Countdown */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-300 shrink-0" />
                <div>
                  <p className="text-[8px] font-mono uppercase text-neutral-400">{scheduleInfo.label}</p>
                  <p className="text-xs font-mono font-bold text-white">
                    {scheduleInfo.secondsLeft > 0 ? formatTime(scheduleInfo.secondsLeft) : '22nd–28th'}
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)]">
                <p className="text-[8px] font-mono uppercase text-neutral-400">Active Chiefs</p>
                <p className="text-xs font-mono font-bold text-white">
                  {activeCount}/{(gamesData?.members || []).length}
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)]">
                <p className="text-[8px] font-mono uppercase text-neutral-400">4K+ Bonus</p>
                <p className="text-xs font-mono font-bold text-emerald-300">
                  {bonusUnlockedCount} Chiefs
                </p>
              </div>

              {isLeaderOrCo && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset Clan Games baseline points for all members?')) {
                      fetchGamesTelemetry(true);
                    }
                  }}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Reset Baseline</span>
                </button>
              )}
            </div>
          </div>

          {/* Slim Clan Total Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                Clan Total Progress (Tier VI Goal: 50,000 Pts)
              </span>
              <span className="font-bold text-white">
                {totalPoints.toLocaleString()} <span className="text-neutral-400">/ 50,000 Pts</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#040507] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clanProgressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400"
              />
            </div>
          </div>

          {/* 2-Tab Switcher: 1. Member Scoreboard (First) | 2. Reward Tiers */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#050609] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)]">
            <button
              type="button"
              onClick={() => setActiveView('scores')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeView === 'scores'
                  ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-300" />
              <span>Member Scoreboard ({filteredMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('rewards')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeView === 'rewards'
                  ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4 text-emerald-300" />
              <span>Reward Tiers (I &ndash; VI)</span>
            </button>
          </div>
        </div>

        {/* 2. TAB CONTENT: SCOREBOARD FIRST OR REWARD TIERS */}
        {activeView === 'rewards' ? (
          <ClanGamesRewards totalPoints={totalPoints} />
        ) : (
          <div className="backdrop-blur-2xl bg-gradient-to-b from-[#14161f]/90 to-[#08090d]/95 rounded-3xl p-4 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_15px_35px_rgba(0,0,0,0.85)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search member by name or #tag..."
                  className="w-full bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'earned', label: 'Season Points' },
                  { id: 'lifetime', label: 'Lifetime Score' },
                  { id: 'th', label: 'Town Hall' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortBy(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      sortBy === tab.id
                        ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                        : 'bg-[#050608] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Member Cards Grid on Wide Screens (No Lifetime Overlap) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
         {filteredMembers.map((m, idx) => {
                const earned = m.pointsEarned || 0;
                const isMaxed10k = earned >= PLAYER_MAX_POINTS;
                const hasBonus4k = earned >= BONUS_THRESHOLD;
                const pct = Math.min(100, (earned / PLAYER_MAX_POINTS) * 100);

                return (
                  <div
                    key={m.tag}
                    className={`relative overflow-hidden p-3.5 rounded-2xl flex flex-col justify-between gap-2.5 transition-all ${
                      isMaxed10k
                        ? 'bg-gradient-to-r from-[#2c1f06]/90 via-[#150d24]/95 to-[#1f1505]/95 shadow-[inset_0_1px_2px_rgba(253,224,71,0.6),0_10px_28px_rgba(234,179,8,0.25)]'
                        : hasBonus4k
                        ? 'bg-gradient-to-b from-emerald-950/35 to-[#06070a]/95 shadow-[inset_0_1px_1px_rgba(52,211,153,0.35),0_8px_18px_rgba(0,0,0,0.7)]'
                        : 'bg-[#06070a]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_18px_rgba(0,0,0,0.7)]'
                    }`}
                  >
                    {/* Holographic Light Sweep for 10,000 MAX Chiefs */}
                    {isMaxed10k && (
                      <motion.div
                        animate={{ x: ['-140%', '240%'] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent -skew-x-12 pointer-events-none"
                      />
                    )}

                    {/* Top Row: Avatar + Name vs Score Status Badge */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative w-11 h-11 rounded-xl bg-[#040507] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {(isMaxed10k || hasBonus4k) && (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                                className={`absolute -inset-4 blur-[2px] pointer-events-none ${
                                  isMaxed10k
                                    ? 'bg-[conic-gradient(from_0deg,#facc15_0deg,#ec4899_90deg,#22d3ee_180deg,#facc15_270deg,#fef08a_360deg)]'
                                    : 'bg-[conic-gradient(from_0deg,transparent_0deg,#10b981_120deg,#22d3ee_240deg,transparent_360deg)]'
                                }`}
                              />
                              <motion.div
                                animate={{ scale: [0.85, 1.35, 0.85], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                className={`absolute inset-0.5 rounded-lg blur-[2px] pointer-events-none ${
                                  isMaxed10k ? 'bg-yellow-300/45' : 'bg-emerald-400/35'
                                }`}
                              />
                            </>
                          )}
                          <motion.img
                            animate={isMaxed10k ? { y: [0, -2, 0], scale: [1, 1.1, 1] } : undefined}
                            transition={isMaxed10k ? { duration: 1.8, repeat: Infinity } : undefined}
                            src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${
                              m.townHallLevel || 1
                            }.webp`}
                            alt={`TH${m.townHallLevel}`}
                            className={`relative z-10 w-full h-full object-contain ${
                              isMaxed10k ? 'drop-shadow-[0_0_8px_rgba(253,224,71,0.95)]' : 'drop-shadow'
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-neutral-400 font-bold shrink-0">
                              #{idx + 1}
                            </span>
                            <p
                              className={`text-xs sm:text-sm font-bold truncate ${
                                isMaxed10k
                                  ? 'bg-gradient-to-r from-yellow-200 via-white to-amber-300 bg-clip-text text-transparent'
                                  : 'text-white'
                              }`}
                            >
                              {m.name}
                            </p>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400 truncate">
                            {m.tag}
                          </p>
                        </div>
                      </div>

                      {/* Right Score Pill */}
                      <div className="shrink-0 text-right">
                        {isMaxed10k ? (
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 text-black text-[10px] font-mono font-extrabold uppercase shadow-[0_0_14px_rgba(250,204,21,0.8)]"
                          >
                            ★ 10,000 MAX
                          </motion.span>
                        ) : hasBonus4k ? (
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/25 text-[8px] font-mono font-bold text-emerald-300 uppercase block shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                              4K+ Bonus
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              {earned.toLocaleString()}{' '}
                              <span className="text-[9px] text-neutral-400">/ 10K</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm font-mono font-bold text-white">
                            {earned.toLocaleString()}{' '}
                            <span className="text-[10px] text-neutral-500">/ 10K</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dedicated Lifetime Score Row */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-mono px-0.5">
                      <span className="text-neutral-400">
                        Lifetime:{' '}
                        <span className="text-neutral-200 font-bold">
                          {(m.currentPoints || 0).toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={
                          isMaxed10k
                            ? 'text-yellow-300 font-bold'
                            : hasBonus4k
                            ? 'text-emerald-300 font-bold'
                            : 'text-neutral-500'
                        }
                      >
                        {isMaxed10k
                          ? '★ Legendary 10K Champion'
                          : hasBonus4k
                          ? '✓ Extra Reward Unlocked'
                          : `${Math.max(0, 4000 - earned).toLocaleString()} to 4K Bonus`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative z-10 w-full h-2 bg-[#040406] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)]">
                      <div
                        className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-white/40 z-10"
                        title="4,000 Pt Bonus Threshold"
                      />
                      <div
                        className={`h-full rounded-full ${
                          isMaxed10k
                            ? 'bg-gradient-to-r from-yellow-300 via-fuchsia-400 to-cyan-300 shadow-[0_0_12px_#facc15]'
                            : hasBonus4k
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-[0_0_8px_#34d399]'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
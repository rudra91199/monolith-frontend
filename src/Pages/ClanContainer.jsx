import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useVillage } from "../Context/VillageContext";
import { CLASH_ICONS, getLeagueBadgeUrl } from "../utils/upgradeCalculator";
import ClanRecentWars from "../Components/Clan/ClanRecentWars";

const clanAmbientAssets = [
  CLASH_ICONS.leagueMedals,
  CLASH_ICONS.raidMedals,
  CLASH_ICONS.cwl,
  CLASH_ICONS.shield,
  CLASH_ICONS.capitalGold,
  CLASH_ICONS.clanCake,
];

export default function Clan() {
  const { activeVillage, loadingProfile } = useVillage();

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [clanData, setClanData] = useState(null);

  // Stable Dropdown States
  const [clanTab, setClanTab] = useState("overview");
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");

  const tabMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  const userRole = activeVillage?.role || "member";
  const clanTag = activeVillage?.clanTag || null;

  useEffect(() => {
    const closeMenus = (e) => {
      if (tabMenuRef.current && !tabMenuRef.current.contains(e.target))
        setTabDropdownOpen(false);
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target))
        setSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  useEffect(() => {
    if (loadingProfile) return;
    if (!clanTag) {
      setClanData(null);
      setIsRegistered(false);
      setLoading(false);
      return;
    }

    const checkClanStatus = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/api/clan/${encodeURIComponent(clanTag)}`,
        );
        const fetchedData = response.data?.data || response.data;

        if (response.data?.isRegistered && fetchedData?.name) {
          setClanData(fetchedData);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch {
        setIsRegistered(false);
      } finally {
        setLoading(false);
      }
    };
    checkClanStatus();
  }, [clanTag, loadingProfile]);

  const handleRegisterClan = async () => {
    if (!clanTag) return;
    setRegistering(true);
    try {
      await api.post("/api/clan/register", { clanTag });
      const getResponse = await api.get(
        `/api/clan/${encodeURIComponent(clanTag)}`,
      );
      const fetchedData = getResponse.data?.data || getResponse.data;

      if (fetchedData && fetchedData.name) {
        setClanData(fetchedData);
        setIsRegistered(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const membersArray = useMemo(
    () => clanData?.members || clanData?.memberList || [],
    [clanData],
  );

  const clanStats = useMemo(() => {
    let totalDonations = 0;
    let totalReceived = 0;
    const thCounts = {};

    membersArray.forEach((m) => {
      const don = m.donations || 0;
      const rec = m.received ?? m.donationsReceived ?? 0;
      totalDonations += don;
      totalReceived += rec;
      const th = m.townHallLevel || 1;
      thCounts[th] = (thCounts[th] || 0) + 1;
    });

    const topDonors = [...membersArray]
      .sort((a, b) => (b.donations || 0) - (a.donations || 0))
      .slice(0, 3);

    const thDistribution = Object.entries(thCounts)
      .map(([th, count]) => ({ th: Number(th), count }))
      .sort((a, b) => b.th - a.th);

    const wins = clanData?.warWins || 0;
    const losses = clanData?.warLosses || 0;
    const ties = clanData?.warTies || 0;
    const totalWars = wins + losses + ties;
    const winRate =
      totalWars > 0 ? ((wins / totalWars) * 100).toFixed(1) : "0.0";

    return {
      totalDonations,
      totalReceived,
      topDonors,
      thDistribution,
      winRate,
      totalWars,
    };
  }, [membersArray, clanData]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = membersArray.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) || m.tag?.toLowerCase().includes(q),
    );

    return list.sort((a, b) => {
      if (sortBy === "donations")
        return (b.donations || 0) - (a.donations || 0);
      if (sortBy === "th")
        return (b.townHallLevel || 0) - (a.townHallLevel || 0);
      if (sortBy === "bb")
        return (b.builderBaseTrophies || 0) - (a.builderBaseTrophies || 0);
      return (a.clanRank || 99) - (b.clanRank || 99);
    });
  }, [membersArray, searchQuery, sortBy]);

  const normalizedRole = userRole.toLowerCase();
  const hasClearance = ["leader", "coleader"].includes(normalizedRole);

  if (loadingProfile || loading) {
    return (
      <div className="w-full h-full min-h-[65vh] flex flex-col items-center justify-center px-4">
        <img
          src={CLASH_ICONS.clanCastle}
          alt="Loading"
          className="w-16 h-16 object-contain animate-bounce mb-4"
        />
        <p className="text-[11px] text-amber-400 tracking-[0.3em] uppercase font-bold animate-pulse">
          Scouting Clan Fortress...
        </p>
      </div>
    );
  }

  if (!clanTag) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center p-6">
        <img
          src={CLASH_ICONS.clanCastle}
          alt=""
          className="w-16 h-16 object-contain mb-4 opacity-50"
        />
        <h2 className="text-2xl font-serif text-white mb-2">
          No Clan Affiliated
        </h2>
        <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
          {activeVillage?.name || "Your selected village"} is not currently in a
          clan. Switch villages in the top menu or join a clan in-game.
        </p>
      </div>
    );
  }

  const memberCount = clanData?.memberCount || membersArray.length;
  const badgeUrl =
    clanData?.badgeUrls?.url ||
    clanData?.badgeUrls?.large ||
    clanData?.badge?.url ||
    CLASH_ICONS.clanCastle;
  const districts = clanData?.clanCapital?.districts || [];

  // Dynamic War League (e.g. Crystal League I) & Capital League Badges
  const warLeagueBadge = getLeagueBadgeUrl(clanData?.warLeague?.name);
  const capitalLeagueBadge = getLeagueBadgeUrl(clanData?.capitalLeague?.name);

  const CLAN_SECTIONS = [
    { id: "overview", label: "Command Overview", icon: CLASH_ICONS.clanCastle },
    {
      id: "roster",
      label: `Active Roster (${memberCount}/50)`,
      icon: CLASH_ICONS.shield,
    },
    {
      id: "districts",
      label: `Capital Districts (${districts.length})`,
      icon: CLASH_ICONS.capitalGold,
    },
  ];
  const activeSectionObj =
    CLAN_SECTIONS.find((s) => s.id === clanTab) || CLAN_SECTIONS[0];

  const formatRole = (r) => {
    if (!r) return "Member";
    if (r === "admin" || r === "elder") return "Elder";
    if (r === "coLeader") return "Co-Leader";
    if (r === "leader") return "Leader";
    return "Member";
  };

  return (
    <div className="relative w-full min-h-screen pb-16 overflow-x-hidden">

      {/* Floating Ambient Assets */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => {
          const asset = clanAmbientAssets[i % clanAmbientAssets.length];
          const size = 38 + (i % 3) * 12;
          return (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                rotate: [0, i % 2 === 0 ? -360 : 360],
              }}
              transition={{
                duration: 28 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute opacity-15"
              style={{
                left: `${12 + i * 18}%`,
                top: `${45 + (i % 3) * 15}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <img
                src={asset}
                alt=""
                className="w-full h-full object-contain"
              />
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-[1640px] mx-auto px-1 sm:px-4 lg:px-6 pt-2 sm:pt-5 space-y-3">
        {!isRegistered && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md backdrop-blur-[40px] bg-[#08080a]/85 border border-neutral-800/60 rounded-[2rem] p-6 sm:p-8 shadow-2xl text-center">
              <img
                src={CLASH_ICONS.clanCastle}
                alt="Clan Castle"
                className="w-24 h-24 mx-auto mb-5 object-contain drop-shadow-lg"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-serif mb-3">
                {hasClearance ? "Clan Castle Unlinked" : "Clearance Too Low"}
              </h2>
              <div className="inline-block px-4 py-1.5 mb-5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[11px] text-neutral-400 font-mono tracking-wider">
                  {clanTag}
                </p>
              </div>
              {hasClearance ? (
                <>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                    Your clan's fortress has not been established on the
                    Monolith servers. Construct the link to archive daily
                    snapshots.
                  </p>
                  <button
                    onClick={handleRegisterClan}
                    disabled={registering}
                    className="w-full h-13 rounded-xl bg-amber-400 text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-300 transition-all"
                  >
                    {registering
                      ? "Linking Fortress..."
                      : "Establish Clan Link"}
                  </button>
                </>
              ) : (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-neutral-300">
                  Ask your Leader or Co-Leader to log in and register this clan.
                </div>
              )}
            </div>
          </div>
        )}

        {isRegistered && clanData && (
          <>
            {/* 1. CLAN TOP HERO BANNER */}
            <div className="backdrop-blur-2xl bg-[#0a0a0c]/70 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.65)] rounded-3xl sm:rounded-[2rem] p-4 sm:p-8">
              <div className="flex justify-between items-start gap-4 mb-5 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.06] text-[10px] text-neutral-300 font-mono tracking-widest">
                      {clanData.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-bold uppercase tracking-widest">
                      Lv.{clanData.level || clanData.clanLevel || 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                      {clanData.type === "inviteOnly"
                        ? "Invite Only"
                        : clanData.type === "closed"
                          ? "Closed"
                          : "Open"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[10px] text-purple-300 font-bold uppercase tracking-widest">
                      {formatRole(userRole)}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-bold text-white font-serif tracking-wide truncate drop-shadow-md">
                    {clanData.name}
                  </h1>

                  {/* Clan Labels */}
                  {clanData.labels && clanData.labels.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {clanData.labels.map((label) => (
                        <div
                          key={label.id}
                          className="inline-flex items-center gap-1.5 bg-black/60 border border-white/[0.06] rounded-lg px-2.5 py-1"
                        >
                          {(label.iconUrls?.small || label.icon?.url) && (
                            <img
                              src={label.iconUrls?.small || label.icon?.url}
                              alt={label.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span className="text-[10px] text-neutral-200 font-bold tracking-wide">
                            {label.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clan Crest */}
                <div className="relative shrink-0 w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[28px] rounded-full" />
                  <img
                    src={badgeUrl}
                    alt={clanData.name}
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.85)]"
                  />
                  <div className="absolute -bottom-1 right-0 px-2.5 py-0.5 bg-black border border-amber-500/40 rounded-full shadow-lg z-20">
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {memberCount}/50
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Metric Banner Grid with Dynamic Crystal League I Badge */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
                <div className="flex items-center gap-2.5 bg-black/55 border border-white/[0.06] rounded-2xl p-3 min-w-0">
                  <img
                    src={warLeagueBadge}
                    alt={clanData.warLeague?.name || "War League"}
                    className="w-8 h-8 object-contain shrink-0 drop-shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CLASH_ICONS.cwl;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-amber-400/80 font-bold truncate">
                      War League
                    </p>
                    <p className="text-xs sm:text-sm text-white font-bold truncate">
                      {clanData.warLeague?.name || "Unranked"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-black/55 border border-white/[0.06] rounded-2xl p-3 min-w-0">
                  <img
                    src={CLASH_ICONS.war || CLASH_ICONS.cwl}
                    alt="War Record"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
                      War Win Rate
                    </p>
                    <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                      {clanStats.winRate}%{" "}
                      <span className="text-[10px] text-emerald-400">
                        ({clanData.warWins || 0}W)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-emerald-950/25 border border-emerald-800/30 rounded-2xl p-3 min-w-0">
                  <img
                    src={CLASH_ICONS.clanCake}
                    alt="Donations"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold truncate">
                      Season Donated
                    </p>
                    <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                      {clanStats.totalDonations.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-cyan-950/25 border border-cyan-800/30 rounded-2xl p-3 min-w-0">
                  <img
                    src={CLASH_ICONS.capitalGold}
                    alt="Capital"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/80 font-bold truncate">
                      Capital Hall {clanData.clanCapital?.capitalHallLevel || 1}
                    </p>
                    <p className="text-xs sm:text-sm text-white font-mono font-bold truncate">
                      {(clanData.capitalPoints || 0).toLocaleString()}{" "}
                      <span className="text-[10px] text-cyan-300">Pts</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STABLE DROPDOWN FOR CLAN SUB-NAVIGATION (No Swipe Bars) */}
            <div ref={tabMenuRef} className="relative z-30 w-full sm:w-80">
              <button
                type="button"
                onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0a0a0c]/90 border border-amber-500/30 hover:border-amber-500/60 shadow-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeSectionObj.icon}
                    alt=""
                    className="w-7 h-7 object-contain shrink-0"
                  />
                  <div className="text-left min-w-0">
                    <p className="text-[9px] text-amber-400 font-mono uppercase tracking-widest font-bold">
                      Clan Section
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                      {activeSectionObj.label}
                    </p>
                  </div>
                </div>
                <span className="ml-3 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-mono text-neutral-300">
                  {tabDropdownOpen ? "Close ▲" : "Switch ▼"}
                </span>
              </button>

              {tabDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/[0.04]">
                  {CLAN_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        setClanTab(sec.id);
                        setTabDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                        clanTab === sec.id
                          ? "bg-amber-500/15 text-amber-300"
                          : "text-neutral-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <img
                        src={sec.icon}
                        alt=""
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. CLAN TAB CONTENT */}
            {clanTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  {/* Town Hall Composition */}
                  <div className="backdrop-blur-xl bg-[#070709]/80 border border-neutral-800/60 rounded-3xl p-5 sm:p-7 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={CLASH_ICONS.townHall}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                        <h3 className="text-xs sm:text-sm font-serif text-white uppercase tracking-widest">
                          Town Hall Distribution
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {memberCount} Chiefs
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {clanStats.thDistribution.map(({ th, count }) => {
                        const pct = Math.round((count / memberCount) * 100);
                        return (
                          <div
                            key={th}
                            className="p-3.5 rounded-2xl bg-black/55 border border-white/[0.06] flex items-center gap-3"
                          >
                            <img
                              src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${th}.webp`}
                              alt={`TH${th}`}
                              className="w-11 h-11 object-contain shrink-0 drop-shadow-md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between">
                                <span className="text-xs font-mono font-bold text-white">
                                  TH{th}
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  x{count}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Recent War Stats (Replaces Clan Charter) */}
                  <ClanRecentWars clanTag={clanTag} />

                  {/* Top 3 Season Donors */}
                  <div className="backdrop-blur-xl bg-[#070709]/80 border border-neutral-800/60 rounded-3xl p-5 sm:p-7 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={CLASH_ICONS.leagueMedals}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                        <h3 className="text-xs sm:text-sm font-serif text-white uppercase tracking-widest">
                          Top Season Benefactors
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setSortBy("donations");
                          setClanTab("roster");
                        }}
                        className="text-[10px] text-amber-400 hover:underline uppercase tracking-widest font-bold"
                      >
                        Full Roster &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {clanStats.topDonors.map((m, idx) => (
                        <div
                          key={m.tag}
                          className="p-4 rounded-2xl bg-black/55 border border-white/[0.06] flex items-center justify-between sm:flex-col sm:items-start gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${m.townHallLevel || 1}.webp`}
                              alt=""
                              className="w-9 h-9 object-contain shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                #{idx + 1} {m.name}
                              </p>
                              <p className="text-[10px] font-mono text-neutral-400">
                                TH{m.townHallLevel}
                              </p>
                            </div>
                          </div>
                          <div className="sm:w-full sm:pt-2 sm:border-t sm:border-white/[0.05] flex items-center justify-between">
                            <span className="hidden sm:inline text-[9px] text-neutral-500 uppercase font-bold">
                              Donated
                            </span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                              {(m.donations || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: War League & Capital Standing */}
                <div className="space-y-5">
                  <div className="backdrop-blur-xl bg-[#070709]/80 border border-neutral-800/60 rounded-3xl p-5 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <img
                        src={warLeagueBadge}
                        alt={clanData.warLeague?.name}
                        className="w-10 h-10 object-contain drop-shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = CLASH_ICONS.cwl;
                        }}
                      />
                      <div>
                        <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">
                          Current Standing
                        </p>
                        <h3 className="text-white font-serif tracking-wide uppercase text-sm">
                          {clanData.warLeague?.name || "Unranked"}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-800/30">
                        <p className="text-[9px] text-emerald-400 uppercase font-bold">
                          Wins
                        </p>
                        <p className="text-base font-mono font-bold text-white mt-0.5">
                          {clanData.warWins || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-red-950/25 border border-red-800/30">
                        <p className="text-[9px] text-red-400 uppercase font-bold">
                          Losses
                        </p>
                        <p className="text-base font-mono font-bold text-white mt-0.5">
                          {clanData.warLosses || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/[0.06]">
                        <p className="text-[9px] text-neutral-400 uppercase font-bold">
                          Ties
                        </p>
                        <p className="text-base font-mono font-bold text-white mt-0.5">
                          {clanData.warTies || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-neutral-800/60 text-xs font-mono">
                      <span className="text-neutral-400">
                        Home / Builder Points
                      </span>
                      <span className="text-amber-300 font-bold">
                        {(clanData.points || 0).toLocaleString()} /{" "}
                        {(clanData.builderBasePoints || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Clan Capital Standing */}
                  <div className="backdrop-blur-xl bg-[#070709]/80 border border-neutral-800/60 rounded-3xl p-5 sm:p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={capitalLeagueBadge}
                          alt={clanData.capitalLeague?.name}
                          className="w-10 h-10 object-contain drop-shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = CLASH_ICONS.raidMedals;
                          }}
                        />
                        <div>
                          <p className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                            Capital Standing
                          </p>
                          <h3 className="text-white font-serif tracking-wide uppercase text-sm">
                            {clanData.capitalLeague?.name || "Unranked"}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => setClanTab("districts")}
                        className="text-[10px] text-cyan-400 hover:underline uppercase font-bold"
                      >
                        Districts &rarr;
                      </button>
                    </div>

                    <div className="flex justify-between items-end border-t border-neutral-800/60 pt-4">
                      <div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">
                          Capital Peak
                        </p>
                        <p className="font-mono text-lg font-bold text-white">
                          Level {clanData.clanCapital?.capitalHallLevel || 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">
                          Capital Points
                        </p>
                        <p className="text-lg font-mono font-bold text-cyan-400">
                          {(clanData.capitalPoints || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVE ROSTER */}
            {clanTab === "roster" && (
              <div className="backdrop-blur-xl bg-[#070709]/85 border border-neutral-800/70 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-6 border-b border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chief by name or #tag..."
                    className="w-full sm:max-w-md bg-black/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/40"
                  />

                  {/* Stable Sort Dropdown */}
                  <div ref={sortMenuRef} className="relative w-full sm:w-52">
                    <button
                      type="button"
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-amber-300 font-bold uppercase tracking-wider"
                    >
                      <span>Sort: {sortBy.toUpperCase()}</span>
                      <span>{sortDropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {sortDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-[#0a0a0c] border border-neutral-800 rounded-xl overflow-hidden shadow-xl divide-y divide-white/[0.04]">
                        {[
                          { id: "rank", label: "Clan Rank" },
                          { id: "donations", label: "Top Donated" },
                          { id: "th", label: "Town Hall Level" },
                          { id: "bb", label: "Builder Base Trophies" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSortBy(s.id);
                              setSortDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs text-neutral-200 hover:bg-white/[0.05]"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacious Member Cards Grid (1 col mobile, 2 col md, 3 col xl) */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMembers.map((member) => {
                    const receivedCount =
                      member.received ?? member.donationsReceived ?? 0;
                    const rankDelta =
                      member.previousClanRank && member.clanRank
                        ? member.previousClanRank - member.clanRank
                        : 0;
                    const leagueIcon =
                      member.leagueTier?.icon?.url ||
                      member.league?.iconUrls?.small ||
                      CLASH_ICONS.shield;

                    return (
                      <div
                        key={member.tag}
                        className="p-4 rounded-2xl bg-black/55 border border-white/[0.06] flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${member.townHallLevel || 1}.webp`}
                              alt={`TH${member.townHallLevel}`}
                              className="w-12 h-12 object-contain shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono text-amber-400 font-bold">
                                  #{member.clanRank}
                                </span>
                                <p className="text-sm font-bold text-white truncate">
                                  {member.name}
                                </p>
                              </div>
                              <p className="text-[10px] font-mono text-neutral-400">
                                {member.tag} &bull; {formatRole(member.role)}{" "}
                                &bull; XP {member.expLevel || "--"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <img
                              src={leagueIcon}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                            {rankDelta !== 0 && (
                              <span
                                className={`text-[9px] font-mono font-bold ${
                                  rankDelta > 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {rankDelta > 0
                                  ? `▲ +${rankDelta}`
                                  : `▼ ${rankDelta}`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/[0.05] text-[10px] font-mono">
                          <div className="bg-black/50 rounded-xl px-2.5 py-2">
                            <span className="text-neutral-500 block text-[8px] uppercase">
                              Donated
                            </span>
                            <span className="text-emerald-400 font-bold text-xs">
                              {(member.donations || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-black/50 rounded-xl px-2.5 py-2">
                            <span className="text-neutral-500 block text-[8px] uppercase">
                              Received
                            </span>
                            <span className="text-amber-300 font-bold text-xs">
                              {receivedCount.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-black/50 rounded-xl px-2.5 py-2">
                            <span className="text-neutral-500 block text-[8px] uppercase">
                              Builder Base
                            </span>
                            <span className="text-cyan-300 font-bold text-xs">
                              {member.builderBaseTrophies || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CLAN CAPITAL DISTRICTS */}
            {clanTab === "districts" && (
              <div className="backdrop-blur-xl bg-[#070709]/80 border border-neutral-800/60 rounded-3xl p-5 sm:p-7 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={CLASH_ICONS.capitalGold}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-serif text-white uppercase tracking-widest">
                      Clan Capital Districts
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {clanData.capitalLeague?.name || "Unranked"} &bull;{" "}
                      {(clanData.capitalPoints || 0).toLocaleString()} Capital
                      Points
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districts.map((d) => {
                    const maxLevel = d.name === "Capital Peak" ? 10 : 5;
                    const pct = Math.min(
                      100,
                      Math.round(((d.districtHallLevel || 1) / maxLevel) * 100),
                    );
                    return (
                      <div
                        key={d.id}
                        className="p-4 rounded-2xl bg-black/55 border border-white/[0.06] flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={CLASH_ICONS.capitalGold}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">
                                {d.name}
                              </h4>
                              <p className="text-[10px] font-mono text-neutral-400">
                                District Hall
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 font-mono text-xs font-bold text-cyan-300">
                            Lv.{d.districtHallLevel}/{maxLevel}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useVillage } from "../Context/VillageContext";
import { CLASH_ICONS } from "../utils/upgradeCalculator";
import BrandLogo from "../Components/Common/BrandLogo";
import RouteLandscape from "../Components/Common/RouteLandscape";

const NAV_MODULES = [
  // Player Group
  {
    name: "Terminal",
    path: "/dashboard",
    icon: CLASH_ICONS.townHall,
    group: "Player",
  },
  {
    name: "War Stats",
    path: "/dashboard/war-stats",
    icon: CLASH_ICONS.war || CLASH_ICONS.shield,
    group: "Player",
  },

  // Clan Group
  {
    name: "Overview",
    path: "/dashboard/clan",
    icon: CLASH_ICONS.clanCastle,
    group: "Clan",
  },
  {
    name: "Clan Wars",
    path: "/dashboard/wars",
    icon: CLASH_ICONS.war || CLASH_ICONS.cwl,
    group: "Clan",
  },
  // { name: 'War League (CWL)', path: '/dashboard/cwl', icon: CLASH_ICONS.cwl, group: 'Clan' },
  {
    name: "Clan Games",
    path: "/dashboard/games",
    icon: CLASH_ICONS.clanGames,
    group: "Clan",
  },
  // { name: 'Clan Capital', path: '/dashboard/capital', icon: CLASH_ICONS.capitalGold, group: 'Clan' }
];

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    linkedVillages,
    activeVillage,
    setActiveVillage,
    openLinkModal,
    unlinkVillage,
  } = useVillage();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  // 'player' | 'clan' | 'village' | null
  const [mobileMenu, setMobileMenu] = useState(null);

  const mobileBarRef = useRef(null);
  const desktopSwitcherRef = useRef(null);

  useEffect(() => {
    setMobileMenu(null);
    setSwitcherOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (mobileBarRef.current && !mobileBarRef.current.contains(e.target)) {
        setMobileMenu(null);
      }
      if (
        desktopSwitcherRef.current &&
        !desktopSwitcherRef.current.contains(e.target)
      ) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("coc_token");
    localStorage.removeItem("coc_active_village");
    navigate("/");
  };

  const playerModules = NAV_MODULES.filter((m) => m.group === "Player");
  const clanModules = NAV_MODULES.filter((m) => m.group === "Clan");
  const activePlayerMod = playerModules.find(
    (m) => m.path === location.pathname,
  );
  const activeClanMod = clanModules.find((m) => m.path === location.pathname);

  return (
    <div className="min-h-[100dvh] bg-[#030304] flex flex-col lg:flex-row selection:bg-neutral-600/40 font-sans overflow-x-hidden">
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-size-[120%] bg-center"
          style={{
            backgroundImage: `url('https://assets.clashk.ing/sceneries/dark_days_scenery/thumbnail.webp')`,
          }}
        />
        <div className="absolute inset-0 bg-[#030304]/85" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[290px] fixed inset-y-0 left-0 z-40 backdrop-blur-[40px] bg-gradient-to-b from-[#111116]/85 to-[#070709]/95 border-r border-white/[0.08] shadow-[30px_0_70px_rgba(0,0,0,0.75)]">
        {/* ClashLab Branding & Motto */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <BrandLogo variant="desktop" showMotto={true} />
        </div>

        {/* Desktop Village Switcher */}
        <div ref={desktopSwitcherRef} className="px-4 pt-4 relative z-30">
          <div className="bg-[#060608]/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl p-3 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] font-bold">
                Active Village
              </span>
              <button
                type="button"
                onClick={() => openLinkModal("link")}
                className="px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-[9px] text-white uppercase tracking-wider font-bold cursor-pointer"
              >
                + Add ID
              </button>
            </div>

            {activeVillage ? (
              <button
                type="button"
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-b from-[#1c1c24] to-[#0d0d12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.65)] text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <img
                    src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${activeVillage.townHallLevel || 1}.webp`}
                    alt=""
                    className="w-8 h-8 object-contain shrink-0 drop-shadow"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {activeVillage.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono truncate">
                      TH{activeVillage.townHallLevel} &bull;{" "}
                      {activeVillage.clanName || "No Clan"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  {switcherOpen ? "▲" : "▼"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openLinkModal("link")}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.1] text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                + Link First Village
              </button>
            )}

            <AnimatePresence>
              {switcherOpen && linkedVillages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0c0c10]/95 backdrop-blur-2xl rounded-2xl p-2 space-y-1 max-h-56 overflow-y-auto custom-scrollbar shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
                >
                  {linkedVillages.map((v) => {
                    const isSelected = activeVillage?.tag === v.tag;
                    return (
                      <div
                        key={v.tag}
                        className={`flex items-center justify-between p-2 rounded-xl ${
                          isSelected
                            ? "bg-white/[0.12]"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVillage(v);
                            setSwitcherOpen(false);
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <img
                            src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${v.townHallLevel || 1}.webp`}
                            alt=""
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {v.name}
                            </p>
                            <p className="text-[9px] font-mono text-neutral-500 truncate">
                              {v.tag}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => unlinkVillage(v.tag)}
                          className="text-[10px] font-mono text-neutral-500 hover:text-rose-400 px-1.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Module Links Grouped by Player & Clan */}
        <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
          {["Player", "Clan"].map((groupName) => (
            <div key={groupName} className="space-y-1.5">
              <p className="px-3 text-[9px] text-neutral-500 font-bold uppercase tracking-[0.25em] mb-1.5">
                {groupName}
              </p>
              {NAV_MODULES.filter((m) => m.group === groupName).map((mod) => {
                const isActive = location.pathname === mod.path;
                return (
                  <Link
                    key={mod.path}
                    to={mod.path}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all ${
                      isActive
                        ? "bg-gradient-to-b from-[#1f1f27] to-[#101015] text-white font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_6px_16px_rgba(0,0,0,0.65)]"
                        : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                    }`}
                  >
                    <img
                      src={mod.icon}
                      alt=""
                      className="w-6 h-6 object-contain shrink-0 drop-shadow"
                    />
                    <span className="text-xs uppercase tracking-widest">
                      {mod.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#060608]/80 hover:bg-rose-950/30 text-neutral-400 hover:text-rose-300 transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <span>Disconnect</span>
            <span className="font-mono text-[10px]">EXIT</span>
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT AREA WITH STICKY ROUTE LANDSCAPE */}
      <main className="flex-1 lg:ml-[290px] min-h-screen relative z-10">
        <RouteLandscape />
        {/* MOBILE TOP BRANDING BAR (Shows Monogram + CLText on Mobile) */}
        <div className="lg:hidden relative z-20 px-3 pt-2.5 pb-1">
          <div className="backdrop-blur-2xl bg-[#08090e]/70 rounded-2xl px-3.5 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.65)]">
            <BrandLogo variant="mobile-bar" showMotto={true} />
          </div>
        </div>
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      {/* MOBILE 3-PART BOTTOM COMMAND BAR: PLAYER | CLAN | VILLAGE SWITCHER */}
      <nav
        ref={mobileBarRef}
        className="lg:hidden fixed bottom-3 left-2.5 right-2.5 z-50 backdrop-blur-2xl bg-gradient-to-b from-[#16161d]/95 to-[#09090c]/98 rounded-2xl p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_45px_rgba(0,0,0,0.95)]"
      >
        <AnimatePresence>
          {(mobileMenu === "player" || mobileMenu === "clan") && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.16 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-[#0c0c10]/95 backdrop-blur-2xl rounded-2xl p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_-20px_50px_rgba(0,0,0,0.95)] space-y-1"
            >
              <p className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                {mobileMenu === "player" ? "Player Modules" : "Clan Modules"}
              </p>
              {(mobileMenu === "player" ? playerModules : clanModules).map(
                (mod) => {
                  const isActive = location.pathname === mod.path;
                  return (
                    <Link
                      key={mod.path}
                      to={mod.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-gradient-to-r from-white/[0.16] to-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                          : "text-neutral-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={mod.icon}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                        <span>{mod.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {mod.group}
                      </span>
                    </Link>
                  );
                },
              )}
            </motion.div>
          )}

          {mobileMenu === "village" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.16 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-[#0c0c10]/95 backdrop-blur-2xl rounded-2xl p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_-20px_50px_rgba(0,0,0,0.95)] space-y-1.5 max-h-64 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                  Switch Village
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenu(null);
                      openLinkModal("link");
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase text-white"
                  >
                    + Add ID
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2 py-0.5 rounded-md bg-rose-950/50 text-[10px] font-bold uppercase text-rose-300"
                  >
                    Exit
                  </button>
                </div>
              </div>
              {linkedVillages.map((v) => {
                const isSelected = activeVillage?.tag === v.tag;
                return (
                  <div
                    key={v.tag}
                    className={`flex items-center justify-between p-2.5 rounded-xl ${
                      isSelected ? "bg-white/[0.14]" : "bg-[#060608]/80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVillage(v);
                        setMobileMenu(null);
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    >
                      <img
                        src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${v.townHallLevel || 1}.webp`}
                        alt=""
                        className="w-7 h-7 object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {v.name}
                        </p>
                        <p className="text-[9px] font-mono text-neutral-400 truncate">
                          TH{v.townHallLevel} &bull; {v.clanName || "No Clan"}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => unlinkVillage(v.tag)}
                      className="px-2 py-1 text-[10px] font-mono text-neutral-500 hover:text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Equal Mobile Bar Triggers: 1. Player | 2. Clan | 3. Village */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* 1. Player */}
          <button
            type="button"
            onClick={() =>
              setMobileMenu(mobileMenu === "player" ? null : "player")
            }
            className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-left min-w-0 transition-all ${
              activePlayerMod
                ? "bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]"
                : "bg-[#0d0d12] text-neutral-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={activePlayerMod?.icon || CLASH_ICONS.townHall}
                alt=""
                className="w-5 h-5 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[7px] font-mono uppercase text-neutral-400">
                  Player
                </p>
                <p className="text-[10px] font-bold text-white truncate">
                  {activePlayerMod?.name || "Terminal"}
                </p>
              </div>
            </div>
            <span className="text-[8px] font-mono text-neutral-400">
              {mobileMenu === "player" ? "▼" : "▲"}
            </span>
          </button>

          {/* 2. Clan */}
          <button
            type="button"
            onClick={() => setMobileMenu(mobileMenu === "clan" ? null : "clan")}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-left min-w-0 transition-all ${
              activeClanMod
                ? "bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]"
                : "bg-[#0d0d12] text-neutral-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={activeClanMod?.icon || CLASH_ICONS.clanCastle}
                alt=""
                className="w-5 h-5 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[7px] font-mono uppercase text-neutral-400">
                  Clan
                </p>
                <p className="text-[10px] font-bold text-white truncate">
                  {activeClanMod?.name || "Overview"}
                </p>
              </div>
            </div>
            <span className="text-[8px] font-mono text-neutral-400">
              {mobileMenu === "clan" ? "▼" : "▲"}
            </span>
          </button>

          {/* 3. Village Switcher */}
          <button
            type="button"
            onClick={() =>
              setMobileMenu(mobileMenu === "village" ? null : "village")
            }
            className="flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl bg-[#0d0d12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-left min-w-0"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={`https://assets.clashk.ing/buildings/home-village/town_hall/level_${
                  activeVillage?.townHallLevel || 1
                }.webp`}
                alt=""
                className="w-5 h-5 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[7px] font-mono uppercase text-neutral-400">
                  TH{activeVillage?.townHallLevel || 1}
                </p>
                <p className="text-[10px] font-bold text-white truncate">
                  {activeVillage?.name || "Link ID"}
                </p>
              </div>
            </div>
            <span className="text-[8px] font-mono text-neutral-400">
              {mobileMenu === "village" ? "▼" : "▲"}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

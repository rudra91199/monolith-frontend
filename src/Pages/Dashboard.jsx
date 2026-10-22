import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useVillage } from "../Context/VillageContext";
import {
  getActiveBuilders,
  buildMergedCategoryCatalog,
  buildMergedStructuresCatalog,
  analyzeItemUpgrade,
  CLASH_ICONS,
  useBuilderIcon,
} from "../utils/upgradeCalculator";

import PlayerHeader from "../Components/Dashboard/PlayerHeader";
import PlayerTabs from "../Components/Dashboard/PlayerTabs";
import BoostControl from "../Components/Dashboard/BoostControl";
import BuildersPanel from "../Components/Dashboard/BuildersPanel";
import CategorySection from "../Components/Dashboard/CategorySection";
import StructuresGrid from "../Components/Dashboard/StructuresGrid";
import UpgradeModal from "../Components/Dashboard/UpgradeModal";
import OverviewSection from "../Components/Dashboard/OverviewSection";
import FilterSystem from "../Components/Dashboard/FilterSystem";
import { getImageUrl } from "../Components/Dashboard/ItemCard";

// Fixed Non-Sliding Image Sub-Tab Selector (Compact on Mobile for 6 Hero Tabs)
function ImageSubTabs({ options, activeId, onChange, compact = false }) {
  const isSixHeroRow = compact || options.length >= 6;

  return (
    <div
      className={`grid rounded-2xl bg-[#060608]/90 border border-white/[0.08] border-t-black/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] ${
        isSixHeroRow ? "gap-1 sm:gap-2 p-1 sm:p-1.5" : "gap-2 p-1.5"
      }`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex flex-col sm:flex-row items-center justify-center rounded-xl transition-all cursor-pointer min-w-0 ${
              isSixHeroRow
                ? "gap-1 sm:gap-2 py-1.5 px-0.5 sm:py-2 sm:px-2"
                : "gap-1.5 sm:gap-2.5 py-2.5 px-2"
            } ${
              isActive
                ? "bg-gradient-to-b from-white/[0.16] to-white/[0.05] border border-white/[0.2] border-b-black/80 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.65)]"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <img
              src={opt.icon}
              alt={opt.label}
              className={`object-contain shrink-0 drop-shadow ${
                isSixHeroRow ? "w-5 h-5 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"
              }`}
            />
            <div className="text-center sm:text-left min-w-0 w-full sm:w-auto">
              <p
                className={`font-bold uppercase truncate ${
                  isSixHeroRow
                    ? "text-[9px] sm:text-xs tracking-tight sm:tracking-wider"
                    : "text-[10px] sm:text-xs tracking-wider"
                }`}
              >
                {opt.label}
              </p>
              {opt.count !== undefined && (
                <p className="text-[9px] font-mono text-neutral-400 hidden sm:block">
                  {opt.count}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { activeVillage, loadingProfile, openLinkModal, refreshTrigger } =
    useVillage();
  const workingBuilderIcon = useBuilderIcon(true);
  const freeBuilderIcon = useBuilderIcon(false);

  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [staticData, setStaticData] = useState(null);
  const [buildingData, setBuildingData] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [troopSubTab, setTroopSubTab] = useState("Barracks");
  const [spellSubTab, setSpellSubTab] = useState("Spell Factory");
  const [equipHeroTab, setEquipHeroTab] = useState("Barbarian King");
  const [appliedFilter, setAppliedFilter] = useState(null);

  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const [boostConfig, setBoostConfig] = useState(() => {
    const saved = localStorage.getItem("coc_boost_config");
    return saved ? JSON.parse(saved) : { type: "none", daysLeft: "" };
  });

  useEffect(() => {
    localStorage.setItem("coc_boost_config", JSON.stringify(boostConfig));
  }, [boostConfig]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loadingProfile) return;
    if (!activeVillage?.tag) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const encodedTag = encodeURIComponent(activeVillage.tag);
        const [playerRes, staticRes, buildingRes] = await Promise.all([
          api.get(`/api/player/${encodedTag}`),
          staticData
            ? Promise.resolve(staticData)
            : fetch("https://assets.clashk.ing/static_data.json")
                .then((res) => res.json())
                .catch(() => null),
          api.get(`/api/building/${encodedTag}`).catch(() => null),
        ]);

        setPlayerData(playerRes.data?.current || playerRes.data);
        setPreviousData(playerRes.data?.previous || null);
        if (staticRes) setStaticData(staticRes);
        setBuildingData(buildingRes?.data?.data || null);
      } catch (err) {
        setError(err.message || "Failed to fetch village data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [activeVillage?.tag, loadingProfile, refreshTrigger]);

  const activeBuilders = useMemo(
    () => getActiveBuilders(buildingData, staticData, nowMs),
    [buildingData, staticData, nowMs],
  );

  const isPetEntity = (item) => {
    if (!item) return false;
    if (item.unlockBuilding === "Pet House") return true;
    const lower = (item.name || "").toLowerCase().trim();
    return Array.isArray(staticData?.pets)
      ? staticData.pets.some((p) => p.name?.toLowerCase().trim() === lower)
      : false;
  };

  const getPreviousLevelMap = (arr) => {
    const map = {};
    if (Array.isArray(arr))
      arr.forEach((i) => {
        map[i.name] = i.level;
      });
    return map;
  };

  const prevTroopsMap = useMemo(
    () => getPreviousLevelMap(previousData?.troops),
    [previousData],
  );
  const prevSpellsMap = useMemo(
    () => getPreviousLevelMap(previousData?.spells),
    [previousData],
  );
  const prevHeroesMap = useMemo(
    () => getPreviousLevelMap(previousData?.heroes),
    [previousData],
  );
  const prevEquipMap = useMemo(
    () => getPreviousLevelMap(previousData?.heroEquipment),
    [previousData],
  );
  const prevPetsMap = useMemo(() => {
    const map = getPreviousLevelMap(previousData?.pets);
    if (Array.isArray(previousData?.troops)) {
      previousData.troops.forEach((t) => {
        if (isPetEntity(t)) map[t.name] = t.level;
      });
    }
    return map;
  }, [previousData, staticData]);

  const rawTroops = playerData?.troops || [];
  const rawOwnedPets = useMemo(() => {
    const list = playerData?.pets?.length ? [...playerData.pets] : [];
    rawTroops.forEach((t) => {
      if (isPetEntity(t) && !list.find((p) => p.name === t.name)) list.push(t);
    });
    return list;
  }, [playerData, rawTroops, staticData]);

  const rawHomeTroops = useMemo(
    () =>
      rawTroops.filter(
        (t) => (!t.village || t.village === "home") && !isPetEntity(t),
      ),
    [rawTroops, staticData],
  );
  const rawHomeSpells = useMemo(
    () =>
      playerData?.spells?.filter((s) => !s.village || s.village === "home") ||
      [],
    [playerData],
  );
  const rawHomeHeroes = useMemo(
    () =>
      playerData?.heroes?.filter((h) => !h.village || h.village === "home") ||
      [],
    [playerData],
  );
  const rawEquipment = playerData?.heroEquipment || [];
  const thLevel =
    playerData?.townHallLevel || activeVillage?.townHallLevel || 1;

  const homeBuildings = useMemo(
    () =>
      buildMergedStructuresCatalog(
        buildingData?.buildings || [],
        buildingData?.traps || [],
        staticData,
        thLevel,
      ),
    [buildingData, staticData, thLevel],
  );

  const fullTroopsCatalog = useMemo(
    () =>
      buildMergedCategoryCatalog(
        "troops",
        rawHomeTroops,
        staticData,
        buildingData,
      ),
    [rawHomeTroops, staticData, buildingData],
  );
  const fullSpellsCatalog = useMemo(
    () =>
      buildMergedCategoryCatalog(
        "spells",
        rawHomeSpells,
        staticData,
        buildingData,
      ),
    [rawHomeSpells, staticData, buildingData],
  );
  const fullHeroesCatalog = useMemo(
    () =>
      buildMergedCategoryCatalog(
        "heroes",
        rawHomeHeroes,
        staticData,
        buildingData,
      ),
    [rawHomeHeroes, staticData, buildingData],
  );
  const fullPetsCatalog = useMemo(
    () =>
      buildMergedCategoryCatalog(
        "pets",
        rawOwnedPets,
        staticData,
        buildingData,
      ),
    [rawOwnedPets, staticData, buildingData],
  );
  const fullEquipmentCatalog = useMemo(
    () =>
      buildMergedCategoryCatalog(
        "equipment",
        rawEquipment,
        staticData,
        buildingData,
      ),
    [rawEquipment, staticData, buildingData],
  );

  // Include all 6 Heroes for Equipment Sub-Tabs
  const equipmentByHero = useMemo(() => {
    const heroOrder = [
      "Barbarian King",
      "Archer Queen",
      "Minion Prince",
      "Grand Warden",
      "Royal Champion",
      "Dragon Duke",
    ];
    const groups = {};
    heroOrder.forEach((h) => {
      groups[h] = [];
    });
    fullEquipmentCatalog.forEach((eq) => {
      const h = eq.hero || "Barbarian King";
      if (!groups[h]) groups[h] = [];
      groups[h].push(eq);
    });
    return groups;
  }, [fullEquipmentCatalog]);

  const calculateProgress = (catalogItems, category) => {
    if (!catalogItems?.length) return { current: 0, max: 0, percentage: 0 };
    let currentTotal = 0;
    let maxTotal = 0;
    catalogItems.forEach((item) => {
      const analysis = analyzeItemUpgrade(item, category, staticData, thLevel);
      const count = item.count || 1;
      currentTotal += (item.isLocked ? 0 : item.level || 0) * count;
      maxTotal += (analysis.maxAtTh || 1) * count;
    });
    const percentage =
      maxTotal > 0
        ? Math.min(100, (currentTotal / maxTotal) * 100).toFixed(1)
        : 0;
    return { current: currentTotal, max: maxTotal, percentage };
  };

  const progressStats = useMemo(
    () => ({
      heroes: calculateProgress(fullHeroesCatalog, "heroes"),
      troops: calculateProgress(fullTroopsCatalog, "troops"),
      spells: calculateProgress(fullSpellsCatalog, "spells"),
      pets: calculateProgress(fullPetsCatalog, "pets"),
      equipment: calculateProgress(fullEquipmentCatalog, "equipment"),
      buildings:
        homeBuildings.length > 0
          ? calculateProgress(homeBuildings, "buildings")
          : null,
    }),
    [
      fullHeroesCatalog,
      fullTroopsCatalog,
      fullSpellsCatalog,
      fullPetsCatalog,
      fullEquipmentCatalog,
      homeBuildings,
      staticData,
      thLevel,
    ],
  );

  // Handle Filter Submission & Smart Tab Redirection
  const handleApplyFilter = (config) => {
    const {
      category,
      searchQuery,
      troopSub,
      spellSub,
      equipHero,
      equipRarity,
      structureSub,
      structureResource,
      sortBy,
    } = config;

    const hasSearch = Boolean(searchQuery);
    const hasCustomSort = sortBy && sortBy !== "default";

    // 1. Heroes: No search & no sort -> redirect straight to Heroes tab
    if (category === "heroes" && !hasSearch && !hasCustomSort) {
      setAppliedFilter(null);
      setActiveTab("heroes");
      return;
    }

    // 2. Pets: No search & no sort -> redirect straight to Pets tab
    if (category === "pets" && !hasSearch && !hasCustomSort) {
      setAppliedFilter(null);
      setActiveTab("pets");
      return;
    }

    // 3. Troops: No search & no sort -> redirect to Troops tab + chosen Barracks/Dark Barracks/Workshop sub-tab
    if (category === "troops" && !hasSearch && !hasCustomSort) {
      setAppliedFilter(null);
      setActiveTab("troops");
      if (troopSub) setTroopSubTab(troopSub);
      return;
    }

    // 4. Spells: No search & no sort -> redirect to Spells tab + chosen Spell Factory/Dark Spell Factory sub-tab
    if (category === "spells" && !hasSearch && !hasCustomSort) {
      setAppliedFilter(null);
      setActiveTab("spells");
      if (spellSub) setSpellSubTab(spellSub);
      return;
    }

    // 5. Equipment: No search, no Rare/Epic chosen, no sort -> redirect to Equipment tab + chosen Hero sub-tab
    if (
      category === "equipment" &&
      !hasSearch &&
      !equipRarity &&
      !hasCustomSort
    ) {
      setAppliedFilter(null);
      setActiveTab("equipment");
      if (equipHero) setEquipHeroTab(equipHero);
      return;
    }

    // 6. Structures: No search, no sub-category, no resource, no sort -> redirect to Structures tab
    if (
      category === "buildings" &&
      !hasSearch &&
      !structureSub &&
      !structureResource &&
      !hasCustomSort
    ) {
      setAppliedFilter(null);
      setActiveTab("buildings");
      return;
    }

    // Otherwise, activate Filtered Results View
    setActiveTab(category);
    setAppliedFilter(config);
  };

  const handleTabChange = (tabId) => {
    setAppliedFilter(null);
    setActiveTab(tabId);
  };

  // Compute Filtered & Sorted Items when appliedFilter is active
  const filteredResults = useMemo(() => {
    if (!appliedFilter) return null;
    const {
      category,
      searchQuery,
      troopSub,
      spellSub,
      equipHero,
      equipRarity,
      structureSub,
      structureResource,
      sortBy,
    } = appliedFilter;

    let list = [];
    if (category === "troops") {
      list = fullTroopsCatalog.filter(
        (t) => !troopSub || t.unlockBuilding === troopSub,
      );
    } else if (category === "spells") {
      list = fullSpellsCatalog.filter(
        (s) => !spellSub || s.unlockBuilding === spellSub,
      );
    } else if (category === "heroes") {
      list = [...fullHeroesCatalog];
    } else if (category === "pets") {
      list = [...fullPetsCatalog];
    } else if (category === "equipment") {
      list = fullEquipmentCatalog.filter((eq) => {
        if (equipHero && eq.hero !== equipHero) return false;
        if (equipRarity === "Epic" && eq.rarity !== "Epic") return false;
        if (equipRarity === "Rare" && eq.rarity === "Epic") return false;
        return true;
      });
    } else if (category === "buildings") {
      list = homeBuildings.filter((b) => {
        if (structureSub && b.structureType !== structureSub) return false;
        if (structureResource) {
          const analysis = analyzeItemUpgrade(
            b,
            "buildings",
            staticData,
            thLevel,
            boostConfig,
          );
          if (
            (analysis.resource || "").toLowerCase().trim() !==
            structureResource.toLowerCase().trim()
          ) {
            return false;
          }
        }
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => (item.name || "").toLowerCase().includes(q));
    }

    if (sortBy && sortBy !== "default") {
      const getSortCost = (item) => {
        const analysis = analyzeItemUpgrade(
          item,
          category,
          staticData,
          thLevel,
          boostConfig,
        );
        if (category === "equipment") {
          const ores = analysis.nextUpgrade?.ores || analysis.totalOresToMax;
          if (!ores) return 0;
          return (
            (ores.shiny_ore || 0) +
            (ores.glowy_ore || 0) * 10 +
            (ores.starry_ore || 0) * 50
          );
        }
        return (
          analysis.nextUpgrade?.cost ??
          analysis.totalCostToMax ??
          analysis.maxTierUpgrade?.cost ??
          0
        );
      };

      list = [...list].sort((a, b) => {
        if (sortBy === "name_asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        if (sortBy === "name_desc") {
          return (b.name || "").localeCompare(a.name || "");
        }
        const costA = getSortCost(a);
        const costB = getSortCost(b);

        if (sortBy === "cost_asc") {
          // Push 0-cost (already maxed/locked) items to the bottom so actual cheapest upgrades appear first
          if (costA <= 0 && costB > 0) return 1;
          if (costB <= 0 && costA > 0) return -1;
          return costA - costB;
        }
        if (sortBy === "cost_desc") {
          return costB - costA;
        }
        return 0;
      });
    }

    return list;
  }, [
    appliedFilter,
    fullTroopsCatalog,
    fullSpellsCatalog,
    fullHeroesCatalog,
    fullPetsCatalog,
    fullEquipmentCatalog,
    homeBuildings,
    staticData,
    thLevel,
    boostConfig,
  ]);

  if (loadingProfile || loading) {
    return (
      <div className="w-full h-[65vh] flex flex-col items-center justify-center px-4">
        <img
          src={workingBuilderIcon}
          alt="Loading"
          className="w-20 h-20 object-contain animate-bounce mb-4"
        />
        <p className="text-[11px] text-neutral-300 tracking-[0.3em] uppercase font-bold animate-pulse">
          Syncing Village Telemetry...
        </p>
      </div>
    );
  }

  if (!activeVillage) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg backdrop-blur-2xl bg-[#0a0a0c]/85 border border-white/10 rounded-[2rem] p-6 sm:p-10 text-center shadow-2xl">
          <img
            src={workingBuilderIcon}
            alt="Builder"
            className="w-24 h-24 mx-auto mb-5 object-contain"
          />
          <h2 className="text-xl sm:text-3xl text-white tracking-wide mb-3">
            Initialize Your First Village
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
            Open Clash of Clans &rarr;{" "}
            <span className="text-white font-semibold">
              Settings &rarr; More Settings &rarr; Data Export &rarr; Copy
            </span>
            .
          </p>
          <button
            onClick={() => openLinkModal("link")}
            className="w-full h-13 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <img
              src={workingBuilderIcon}
              alt=""
              className="w-6 h-6 object-contain"
            />
            <span>Paste Village JSON</span>
          </button>
        </div>
      </div>
    );
  }

  if (error && !playerData)
    return <div className="text-red-500 p-8 text-center text-sm">{error}</div>;

  const thImage = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${thLevel}.webp`;
  const handleSelectCard = (item, category, analysis) =>
    setSelectedItemModal({ item, category, analysis });

  const troopSubOptions = [
    { id: "Barracks", label: "Barracks", icon: CLASH_ICONS.barracks },
    {
      id: "Dark Barracks",
      label: "Dark Troops",
      icon: CLASH_ICONS.darkBarracks,
    },
    { id: "Workshop", label: "Workshop", icon: CLASH_ICONS.workshop },
  ];

  const spellSubOptions = [
    {
      id: "Spell Factory",
      label: "Elixir Spells",
      icon: CLASH_ICONS.spellFactory,
    },
    {
      id: "Dark Spell Factory",
      label: "Dark Spells",
      icon: CLASH_ICONS.darkSpellFactory,
    },
  ];

  // Use only the Hero's last name (King, Queen, Prince, Warden, Champion, Duke) so all 6 fit on mobile screens
  const equipHeroOptions = Object.keys(equipmentByHero).map((heroName) => ({
    id: heroName,
    label: heroName.split(" ").pop(),
    icon: getImageUrl("heroes", heroName),
  }));

  const prevMapByCategory = {
    troops: prevTroopsMap,
    spells: prevSpellsMap,
    heroes: prevHeroesMap,
    equipment: prevEquipMap,
    pets: prevPetsMap,
    buildings: null,
  };

  return (
    <div className="relative w-full min-h-screen pb-28 lg:pb-16 overflow-x-hidden">
      <div className="w-full max-w-[1640px] mx-auto px-1 sm:px-4 lg:px-6 pt-2 sm:pt-5 space-y-3">
        <PlayerHeader
          playerData={playerData}
          previousData={previousData}
          thLevel={thLevel}
          thImage={thImage}
          userRole={activeVillage.role || "Member"}
          onSyncJson={() => openLinkModal("sync")}
          isOverview={activeTab === "overview" && !appliedFilter}
        />

        {activeTab === "overview" && !appliedFilter && (
          <div className="hidden lg:block">
            <BuildersPanel
              activeBuilders={activeBuilders}
              workingIcon={workingBuilderIcon}
              freeIcon={freeBuilderIcon}
              onSyncJson={() => openLinkModal("sync")}
            />
          </div>
        )}

        {/* Controls Bar: Side-by-Side on Mobile & Desktop */}
        <div className="relative z-40 flex items-center justify-between gap-2.5 flex-wrap">
          <PlayerTabs
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            activeBuilderCount={activeBuilders.length}
          />
          {activeTab !== "overview" &&
            activeTab !== "equipment" &&
            activeTab !== "builders" && (
              <BoostControl
                boostConfig={boostConfig}
                setBoostConfig={setBoostConfig}
              />
            )}
        </div>

        {/* Filter Row (PC) + Floating Filter Button & Drawer (Mobile) */}
        <FilterSystem
          activeTab={activeTab}
          appliedFilter={appliedFilter}
          onApplyFilter={handleApplyFilter}
          onClearFilter={() => setAppliedFilter(null)}
        />

        {/* Content Area */}
        <div className="relative z-10 min-h-[380px]">
          {appliedFilter ? (
            <div className="space-y-4">
              {filteredResults && filteredResults.length > 0 ? (
                <CategorySection
                  title={`Filtered ${appliedFilter.category.toUpperCase()} (${
                    filteredResults.length
                  })`}
                  subtitle={
                    [
                      appliedFilter.structureSub &&
                        `Type: ${appliedFilter.structureSub}`,
                      appliedFilter.structureResource &&
                        `Resource: ${appliedFilter.structureResource}`,
                      appliedFilter.equipHero &&
                        appliedFilter.category === "equipment" &&
                        `Hero: ${appliedFilter.equipHero}`,
                      appliedFilter.equipRarity &&
                        `Tier: ${appliedFilter.equipRarity}`,
                      appliedFilter.searchQuery &&
                        `Search: "${appliedFilter.searchQuery}"`,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "Custom Filter & Sort Results"
                  }
                  icon={
                    CLASH_ICONS[appliedFilter.category] ||
                    CLASH_ICONS.structures
                  }
                  items={filteredResults}
                  category={appliedFilter.category}
                  staticData={staticData}
                  thLevel={thLevel}
                  boostConfig={boostConfig}
                  prevMap={prevMapByCategory[appliedFilter.category]}
                  onSelect={handleSelectCard}
                />
              ) : (
                <div className="backdrop-blur-xl bg-[#0a0a0c]/70 border border-white/[0.08] rounded-3xl p-10 text-center space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-white">
                    No Matching Units or Structures Found
                  </p>
                  <p className="text-xs font-mono text-neutral-400">
                    Try adjusting your search query, resource filter, or
                    category selection.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAppliedFilter(null)}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-xs font-mono font-bold text-cyan-300 uppercase cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewSection
                  thLevel={thLevel}
                  thImage={thImage}
                  heroesCatalog={fullHeroesCatalog}
                  equipmentCatalog={fullEquipmentCatalog}
                  rawHomeHeroes={rawHomeHeroes}
                  progressStats={progressStats}
                  staticData={staticData}
                  onSelectCard={handleSelectCard}
                />
              )}

              {activeTab === "builders" && (
                <BuildersPanel
                  activeBuilders={activeBuilders}
                  workingIcon={workingBuilderIcon}
                  freeIcon={freeBuilderIcon}
                  onSyncJson={() => openLinkModal("sync")}
                />
              )}

              {/* TAB: TROOPS */}
              {activeTab === "troops" && (
                <div className="space-y-4">
                  <ImageSubTabs
                    options={troopSubOptions}
                    activeId={troopSubTab}
                    onChange={setTroopSubTab}
                  />
                  <CategorySection
                    title={`${troopSubTab} Units`}
                    subtitle={`Ordered serially by ${troopSubTab} Unlock Level`}
                    icon={
                      troopSubTab === "Barracks"
                        ? CLASH_ICONS.barracks
                        : troopSubTab === "Dark Barracks"
                          ? CLASH_ICONS.darkBarracks
                          : CLASH_ICONS.workshop
                    }
                    items={fullTroopsCatalog.filter(
                      (t) => t.unlockBuilding === troopSubTab,
                    )}
                    category="troops"
                    staticData={staticData}
                    thLevel={thLevel}
                    boostConfig={boostConfig}
                    prevMap={prevTroopsMap}
                    onSelect={handleSelectCard}
                  />
                </div>
              )}

              {/* TAB: SPELLS */}
              {activeTab === "spells" && (
                <div className="space-y-4">
                  <ImageSubTabs
                    options={spellSubOptions}
                    activeId={spellSubTab}
                    onChange={setSpellSubTab}
                  />
                  <CategorySection
                    title={
                      spellSubTab === "Spell Factory"
                        ? "Elixir Spells"
                        : "Dark Spells"
                    }
                    subtitle={`Ordered serially by ${spellSubTab} Unlock Level`}
                    icon={
                      spellSubTab === "Spell Factory"
                        ? CLASH_ICONS.spellFactory
                        : CLASH_ICONS.darkSpellFactory
                    }
                    items={fullSpellsCatalog.filter(
                      (s) => s.unlockBuilding === spellSubTab,
                    )}
                    category="spells"
                    staticData={staticData}
                    thLevel={thLevel}
                    boostConfig={boostConfig}
                    prevMap={prevSpellsMap}
                    onSelect={handleSelectCard}
                  />
                </div>
              )}

              {activeTab === "heroes" && (
                <CategorySection
                  title="Home Village Heroes — Hero Hall"
                  subtitle="Ordered serially by Hero Hall & Town Hall Level"
                  icon={CLASH_ICONS.heroes}
                  items={fullHeroesCatalog}
                  category="heroes"
                  staticData={staticData}
                  thLevel={thLevel}
                  boostConfig={boostConfig}
                  prevMap={prevHeroesMap}
                  onSelect={handleSelectCard}
                />
              )}

              {activeTab === "pets" && (
                <CategorySection
                  title="Hero Pets — Pet House"
                  subtitle="Ordered serially by Pet House Level"
                  icon={CLASH_ICONS.petHouse}
                  items={fullPetsCatalog}
                  category="pets"
                  staticData={staticData}
                  thLevel={thLevel}
                  boostConfig={boostConfig}
                  prevMap={prevPetsMap}
                  onSelect={handleSelectCard}
                />
              )}

              {/* TAB: EQUIPMENT (Compact 6-Hero Last-Name Sub-Tabs) */}
              {activeTab === "equipment" && (
                <div className="space-y-4">
                  <ImageSubTabs
                    options={equipHeroOptions}
                    activeId={equipHeroTab}
                    onChange={setEquipHeroTab}
                    compact
                  />
                  <CategorySection
                    title={`${equipHeroTab} Equipment`}
                    subtitle="Common Gear unlocks via Blacksmith • Epic Gear via Trader / Events"
                    icon={getImageUrl("heroes", equipHeroTab)}
                    items={equipmentByHero[equipHeroTab] || []}
                    category="equipment"
                    staticData={staticData}
                    thLevel={thLevel}
                    boostConfig={boostConfig}
                    prevMap={prevEquipMap}
                    onSelect={handleSelectCard}
                  />
                </div>
              )}

              {activeTab === "buildings" && (
                <StructuresGrid
                  buildings={homeBuildings}
                  staticData={staticData}
                  thLevel={thLevel}
                  boostConfig={boostConfig}
                  workingBuilderIcon={workingBuilderIcon}
                  onSyncJson={() => openLinkModal("sync")}
                  onSelect={handleSelectCard}
                />
              )}
            </>
          )}
        </div>
      </div>

      <UpgradeModal
        selectedItemModal={selectedItemModal}
        onClose={() => setSelectedItemModal(null)}
        thLevel={thLevel}
        workingBuilderIcon={workingBuilderIcon}
      />
    </div>
  );
}

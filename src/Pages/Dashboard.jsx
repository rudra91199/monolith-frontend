import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert, Hammer, Clock, Coins, FileJson, X, Castle } from 'lucide-react';
import api from '../utils/api';
import { useVillage } from '../context/VillageContext';
import { getActiveBuilders, formatTime, formatCost } from '../utils/upgradeCalculator';

import PlayerHeader from '../Components/Dashboard/PlayerHeader';
import PlayerTabs from '../Components/Dashboard/PlayerTabs';
import ProgressBar from '../Components/Dashboard/ProgressBar';
import ItemCard, { getImageUrl } from '../Components/Dashboard/ItemCard';
import BoostControl from '../Components/Dashboard/BoostControl';

const PET_NAMES = [
  'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Frosty', 
  'Diggy', 'Poison Lizard', 'Phoenix', 'Spirit Fox', 'Angry Jelly'
];

export default function Dashboard() {
  const { activeVillage, loadingProfile, openLinkModal, refreshTrigger } = useVillage();

  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [staticData, setStaticData] = useState(null);
  const [buildingData, setBuildingData] = useState(null);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const [boostConfig, setBoostConfig] = useState(() => {
    const saved = localStorage.getItem('coc_boost_config');
    return saved ? JSON.parse(saved) : { type: 'none', daysLeft: '' };
  });

  useEffect(() => {
    localStorage.setItem('coc_boost_config', JSON.stringify(boostConfig));
  }, [boostConfig]);

  // Live 1-second ticker for active builders
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
            : fetch('https://assets.clashk.ing/static_data.json').then(res => res.json()).catch(() => null),
          api.get(`/api/building/${encodedTag}`).catch(() => null)
        ]);
        
        // Support both { current, previous } (2-snapshot backend) and flat snapshot
        const currentSnap = playerRes.data?.current || playerRes.data;
        const previousSnap = playerRes.data?.previous || null;

        setPlayerData(currentSnap);
        setPreviousData(previousSnap);
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

  const activeBuilders = useMemo(() => getActiveBuilders(buildingData, nowMs), [buildingData, nowMs]);

  const getPreviousLevelMap = (categoryArray) => {
    const map = {};
    if (!Array.isArray(categoryArray)) return map;
    categoryArray.forEach(item => { map[item.name] = item.level; });
    return map;
  };

  const prevTroopsMap = useMemo(() => getPreviousLevelMap(previousData?.troops), [previousData]);
  const prevSpellsMap = useMemo(() => getPreviousLevelMap(previousData?.spells), [previousData]);
  const prevHeroesMap = useMemo(() => getPreviousLevelMap(previousData?.heroes), [previousData]);
  const prevPetsMap = useMemo(() => getPreviousLevelMap(previousData?.pets), [previousData]);
  const prevEquipMap = useMemo(() => getPreviousLevelMap(previousData?.heroEquipment), [previousData]);

  const calculateProgress = (playerItems) => {
    if (!playerItems || playerItems.length === 0) return { current: 0, max: 0, percentage: 0 };
    let currentTotal = 0;
    let maxTotal = 0;
    const th = playerData?.townHallLevel || 1;
    
    playerItems.forEach(item => {
      let maxAtTh = item.maxLevel || item.level || 1;
      if (staticData) {
        const nameKey = item.name;
        for (const cat of ['troops', 'heroes', 'spells', 'pets', 'equipment', 'heroEquipment']) {
          if (staticData[cat] && staticData[cat][nameKey] && Array.isArray(staticData[cat][nameKey])) {
             maxAtTh = staticData[cat][nameKey][th] || maxAtTh;
             break;
          }
        }
      }
      const count = item.count || 1;
      currentTotal += (item.level || 0) * count;
      maxTotal += maxAtTh * count;
    });

    const percentage = maxTotal > 0 ? Math.min(100, (currentTotal / maxTotal) * 100).toFixed(1) : 0;
    return { current: currentTotal, max: maxTotal, percentage };
  };

  if (loadingProfile || loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-neutral-500 animate-spin mb-4" />
        <p className="text-[10px] text-neutral-400 tracking-[0.3em] uppercase font-bold animate-pulse">Syncing Terminal...</p>
      </div>
    );
  }

  // ONBOARDING: No village linked yet
  if (!activeVillage) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg backdrop-blur-2xl bg-[#0a0a0c]/80 border border-neutral-800 rounded-[2.5rem] p-8 sm:p-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Castle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide mb-3">Initialize Your First Village</h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">
            Open Clash of Clans &rarr; <span className="text-white font-semibold">Settings &rarr; More Settings &rarr; Data Export &rarr; Copy</span>. Paste your village JSON to verify ownership and import all building levels & active builders simultaneously.
          </p>
          <button
            onClick={() => openLinkModal('link')}
            className="w-full h-14 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
          >
            <FileJson className="w-4 h-4" />
            <span>Paste Village JSON</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (error && !playerData) return <div className="text-red-500 p-8 text-center">{error}</div>;

  const thLevel = playerData?.townHallLevel || activeVillage.townHallLevel || 1;
  const thImage = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${thLevel}.webp`;

  const rawTroops = playerData?.troops || [];
  let combinedPets = playerData?.pets && playerData.pets.length > 0 ? [...playerData.pets] : [];
  rawTroops.forEach(t => {
    if (PET_NAMES.includes(t.name) && !combinedPets.find(p => p.name === t.name)) combinedPets.push(t);
  });
  
  const homeTroops = rawTroops.filter(t => (!t.village || t.village === 'home') && !PET_NAMES.includes(t.name));
  const homeSpells = playerData?.spells?.filter(s => !s.village || s.village === 'home') || [];
  const homeHeroes = playerData?.heroes?.filter(h => !h.village || h.village === 'home') || [];
  const equipment = playerData?.heroEquipment || [];
  const homeBuildings = (buildingData?.buildings || []).filter(b => b.dataId !== 1000097); // Filter out modular crafting container

  return (
    <div className="relative w-full min-h-screen pb-20 overflow-x-hidden">
      
      <div className="absolute top-0 left-0 w-full h-[400px] sm:h-[500px] pointer-events-none z-[-1] overflow-hidden">
         <motion.div 
           animate={{ scale: [1, 1.05, 1] }} 
           transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
           className="w-full h-full bg-cover bg-center opacity-60 mix-blend-screen" 
           style={{ 
             backgroundImage: `url('https://assets.clashk.ing/landscape/war-stats.png')`,
             maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)',
             WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)'
           }} 
         />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">
        
        <PlayerHeader
          playerData={playerData}
          previousData={previousData}
          thLevel={thLevel}
          thImage={thImage}
          userRole={activeVillage.role || 'Member'}
          onSyncJson={() => openLinkModal('sync')}
        />

        {/* ACTIVE BUILDERS LIVE COUNTDOWN BAR */}
        {activeBuilders.length > 0 && (
          <div className="backdrop-blur-xl bg-[#0a0a0c]/70 border border-amber-500/20 rounded-[1.5rem] p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Hammer className="w-4 h-4 text-amber-500 animate-bounce" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Active Builders ({activeBuilders.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Live Countdown</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBuilders.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/[0.05]">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-white truncate">{b.name}</p>
                    <p className="text-[10px] font-mono text-amber-400">Lv.{b.currentLevel} &rarr; Lv.{b.targetLevel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
                      <Clock className="w-3 h-3" />
                      {formatTime(b.remainingSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <PlayerTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab !== 'overview' && (
          <BoostControl boostConfig={boostConfig} setBoostConfig={setBoostConfig} />
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="backdrop-blur-xl bg-[#0a0a0c]/60 border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[2rem] p-5 sm:p-8">
                <h2 className="text-xs sm:text-sm font-serif text-white tracking-widest uppercase mb-6 sm:mb-8 drop-shadow-md">TH{thLevel} Progression Matrix</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 sm:gap-y-6">
                  <ProgressBar label="Heroes" stats={calculateProgress(homeHeroes)} colorClass="bg-gradient-to-r from-amber-600 to-yellow-400" />
                  <ProgressBar label="Troops" stats={calculateProgress(homeTroops)} colorClass="bg-gradient-to-r from-rose-600 to-rose-400" />
                  <ProgressBar label="Spells" stats={calculateProgress(homeSpells)} colorClass="bg-gradient-to-r from-cyan-600 to-cyan-400" />
                  <ProgressBar label="Pets" stats={calculateProgress(combinedPets)} colorClass="bg-gradient-to-r from-emerald-600 to-emerald-400" />
                  <ProgressBar label="Equipment" stats={calculateProgress(equipment)} colorClass="bg-gradient-to-r from-violet-600 to-violet-400" />
                </div>
              </motion.div>
            )}

            {activeTab !== 'overview' && activeTab !== 'buildings' && (
              <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="backdrop-blur-xl bg-[#0a0a0c]/40 border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[2rem] p-3 sm:p-6">
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {activeTab === 'troops' && homeTroops.map(t => (
                    <ItemCard key={t.name} item={t} category="troops" staticData={staticData} thLevel={thLevel} boostConfig={boostConfig} previousLevel={prevTroopsMap[t.name]} onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })} />
                  ))}
                  {activeTab === 'spells' && homeSpells.map(s => (
                    <ItemCard key={s.name} item={s} category="spells" staticData={staticData} thLevel={thLevel} boostConfig={boostConfig} previousLevel={prevSpellsMap[s.name]} onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })} />
                  ))}
                  {activeTab === 'heroes' && homeHeroes.map(h => (
                    <ItemCard key={h.name} item={h} category="heroes" staticData={staticData} thLevel={thLevel} boostConfig={boostConfig} previousLevel={prevHeroesMap[h.name]} onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })} />
                  ))}
                  {activeTab === 'equipment' && equipment.map(e => (
                    <ItemCard key={e.name} item={e} category="equipment" staticData={staticData} thLevel={thLevel} boostConfig={boostConfig} previousLevel={prevEquipMap[e.name]} onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })} />
                  ))}
                  {activeTab === 'pets' && combinedPets.map(p => (
                    <ItemCard key={p.name} item={p} category="pets" staticData={staticData} thLevel={thLevel} boostConfig={boostConfig} previousLevel={prevPetsMap[p.name]} onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })} />
                  ))}
                </div>
                
                {((activeTab === 'pets' && combinedPets.length === 0) || (activeTab === 'equipment' && equipment.length === 0)) && (
                   <div className="w-full py-16 flex flex-col items-center justify-center text-center opacity-50">
                     <ShieldAlert className="w-12 h-12 text-neutral-500 mb-4" />
                     <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">No Items Unlocked</p>
                   </div>
                )}
              </motion.div>
            )}

            {/* BUILDINGS TAB */}
            {activeTab === 'buildings' && (
               <motion.div key="buildings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="backdrop-blur-xl bg-[#0a0a0c]/40 border border-white/[0.05] rounded-[2rem] p-4 sm:p-6">
                 {homeBuildings.length > 0 ? (
                   <>
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-2">
                       <div>
                         <h3 className="text-sm font-serif text-white uppercase tracking-widest">Village Structures & Defenses</h3>
                         <p className="text-[10px] text-neutral-500 font-mono">Click any structure to view level-by-level upgrade costs & ETM</p>
                       </div>
                       <button
                         onClick={() => openLinkModal('sync')}
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest transition-colors self-start sm:self-auto"
                       >
                         <FileJson className="w-3.5 h-3.5" />
                         <span>Update Village JSON</span>
                       </button>
                     </div>
                     <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                       {homeBuildings.map((b, idx) => (
                         <ItemCard
                           key={`${b.dataId}-${b.level}-${idx}`}
                           item={b}
                           category="buildings"
                           staticData={staticData}
                           thLevel={thLevel}
                           boostConfig={boostConfig}
                           onSelect={(item, cat, analysis) => setSelectedItemModal({ item, category: cat, analysis })}
                         />
                       ))}
                     </div>
                   </>
                 ) : (
                   <div className="py-16 text-center max-w-md mx-auto">
                     <Castle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                     <h3 className="text-lg font-serif text-white mb-2">No Building Snapshot Found</h3>
                     <p className="text-xs text-neutral-400 mb-6">
                       Upload your Clash of Clans JSON export to track defenses, army camps, walls, and active builder timers.
                     </p>
                     <button
                       onClick={() => openLinkModal('sync')}
                       className="px-6 py-3 rounded-xl bg-white text-black font-bold text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                     >
                       Upload Village JSON
                     </button>
                   </div>
                 )}
               </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* LEVEL-BY-LEVEL UPGRADE & ETM DETAILS MODAL */}
      <AnimatePresence>
        {selectedItemModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItemModal(null)}
              className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-[80] bg-[#0a0a0c] border border-neutral-800 rounded-[2rem] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-neutral-800/80 bg-[#070709] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={getImageUrl(selectedItemModal.category, selectedItemModal.item.name, selectedItemModal.item.level)}
                      alt={selectedItemModal.item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-white tracking-wide">
                      {selectedItemModal.item.name}
                      {selectedItemModal.item.count > 1 && (
                        <span className="ml-2 text-xs font-mono text-amber-400">x{selectedItemModal.item.count}</span>
                      )}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400">
                      Current: <span className="text-white font-bold">Lv.{selectedItemModal.item.level}</span> / TH{thLevel} Max: <span className="text-amber-400 font-bold">Lv.{selectedItemModal.analysis.maxAtTh}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItemModal(null)}
                  className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cumulative ETM Summary Banner */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-black/40 border-b border-neutral-800/60">
                <div className="p-3 rounded-xl bg-[#0f0f13] border border-white/[0.04]">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Total Cost to TH Max</p>
                  <p className="text-base font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    {formatCost(selectedItemModal.analysis.totalCostToMax * (selectedItemModal.item.count || 1))}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0f0f13] border border-white/[0.04]">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Estimated Time to Max (ETM)</p>
                  <p className="text-base font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedItemModal.analysis.totalTimeToMax * (selectedItemModal.item.count || 1))}
                  </p>
                </div>
              </div>

              {/* Remaining Levels Breakdown Table */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {selectedItemModal.analysis.remainingLevels.length > 0 ? (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[10px] text-neutral-500 uppercase border-b border-neutral-800">
                        <th className="py-2.5 px-3">Target Level</th>
                        <th className="py-2.5 px-3">Upgrade Cost</th>
                        <th className="py-2.5 px-3 text-right">Upgrade Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {selectedItemModal.analysis.remainingLevels.map((lvl) => (
                        <tr key={lvl.level} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-bold text-white">Level {lvl.level}</td>
                          <td className="py-3 px-3 text-amber-400">{formatCost(lvl.cost)}</td>
                          <td className="py-3 px-3 text-right text-cyan-300">{formatTime(lvl.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center text-neutral-400 text-xs uppercase tracking-widest font-bold">
                    Maximum Level Reached for Town Hall {thLevel}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
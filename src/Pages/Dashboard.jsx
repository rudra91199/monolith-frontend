import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

import PlayerHeader from '../Components/Dashboard/PlayerHeader';
import PlayerTabs from '../Components/Dashboard/PlayerTabs';
import ProgressBar from '../Components/Dashboard/ProgressBar';
import ItemCard from '../Components/Dashboard/ItemCard';
import BoostControl from '../Components/Dashboard/BoostControl'; // NEW IMPORT

const PET_NAMES = [
  'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Frosty', 
  'Diggy', 'Poison Lizard', 'Phoenix', 'Spirit Fox', 'Angry Jelly'
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState(null);
  const [staticData, setStaticData] = useState(null);
  const [buildingData, setBuildingData] = useState(null); // NEW STATE
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  
  // NEW STATE: Load boosts from local storage instantly
  const [boostConfig, setBoostConfig] = useState(() => {
    const saved = localStorage.getItem('coc_boost_config');
    return saved ? JSON.parse(saved) : { type: 'none', daysLeft: '' };
  });

  // NEW EFFECT: Auto-save boost selection
  useEffect(() => {
    localStorage.setItem('coc_boost_config', JSON.stringify(boostConfig));
  }, [boostConfig]);

  const getDecodedToken = () => {
    const token = localStorage.getItem('coc_token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch (e) { return null; }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const tokenData = getDecodedToken();
        if (!tokenData) throw new Error("No valid session token found.");

        const actualTag = tokenData.playerTag || tokenData.tag || tokenData.player_tag || tokenData.id;
        if (!actualTag) throw new Error("JWT payload missing player tag.");

        setUserRole(tokenData.role || tokenData.userRole || 'Member');

        // FIXED: Now fetches your newly created backend route concurrently
        const [playerRes, staticRes, buildingRes] = await Promise.all([
          api.get(`/api/player/${encodeURIComponent(actualTag)}`),
          fetch('https://assets.clashk.ing/static_data.json').then(res => res.json()).catch(() => null),
          api.get(`/api/building/${encodeURIComponent(actualTag)}`).catch(() => null)
        ]);
        
        setPlayerData(playerRes.data);
        setStaticData(staticRes);
        setBuildingData(buildingRes?.data?.data || null);
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const calculateProgress = (playerItems) => {
    if (!playerItems || playerItems.length === 0) return { current: 0, max: 0, percentage: 0 };
    let currentTotal = 0;
    let maxTotal = 0;
    const th = playerData?.townHallLevel || 1;
    
    playerItems.forEach(item => {
      let maxAtTh = item.maxLevel;
      if (staticData) {
        const nameKey = item.name;
        for (const cat of ['troops', 'heroes', 'spells', 'pets', 'equipment', 'heroEquipment']) {
          if (staticData[cat] && staticData[cat][nameKey] && Array.isArray(staticData[cat][nameKey])) {
             maxAtTh = staticData[cat][nameKey][th] || maxAtTh;
             break;
          }
        }
        if (staticData[nameKey] && Array.isArray(staticData[nameKey])) maxAtTh = staticData[nameKey][th] || maxAtTh;
      }
      currentTotal += item.level;
      maxTotal += maxAtTh;
    });

    const percentage = maxTotal > 0 ? ((currentTotal / maxTotal) * 100).toFixed(1) : 0;
    return { current: currentTotal, max: maxTotal, percentage };
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-neutral-500 animate-spin mb-4" />
        <p className="text-[10px] text-neutral-400 tracking-[0.3em] uppercase font-bold animate-pulse">Syncing Terminal...</p>
      </div>
    );
  }

  if (error && !playerData) return <div className="text-red-500 p-8 text-center">{error}</div>;

  const thLevel = playerData?.townHallLevel || 1;
  const thImage = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${thLevel}.webp`;

  const rawTroops = playerData?.troops || [];
  let combinedPets = playerData?.pets && playerData.pets.length > 0 ? [...playerData.pets] : [];
  rawTroops.forEach(t => {
    if (PET_NAMES.includes(t.name) && !combinedPets.find(p => p.name === t.name)) combinedPets.push(t);
  });
  
  const homeTroops = rawTroops.filter(t => (!t.village || t.village === 'home') && !PET_NAMES.includes(t.name));
  const homeSpells = playerData?.spells?.filter(s => s.village === 'home') || [];
  const homeHeroes = playerData?.heroes?.filter(h => h.village === 'home') || [];
  const equipment = playerData?.heroEquipment || [];

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
        
        <PlayerHeader playerData={playerData} thLevel={thLevel} thImage={thImage} userRole={userRole} />
        
        <PlayerTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* NEW: Render Boost Control just above the grids (Hidden on Overview tab) */}
        {activeTab !== 'overview' && (
          <BoostControl boostConfig={boostConfig} setBoostConfig={setBoostConfig} />
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="backdrop-blur-xl bg-[#0a0a0c]/60 border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[2rem] p-5 sm:p-8">
                <h2 className="text-xs sm:text-sm font-serif text-white tracking-widest uppercase mb-6 sm:mb-8 drop-shadow-md">TH{thLevel} Research Progress</h2>
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
                  {activeTab === 'troops' && homeTroops.map(t => <ItemCard key={t.name} item={t} category="troops" staticData={staticData} thLevel={thLevel} />)}
                  {activeTab === 'spells' && homeSpells.map(s => <ItemCard key={s.name} item={s} category="spells" staticData={staticData} thLevel={thLevel} />)}
                  {activeTab === 'heroes' && homeHeroes.map(h => <ItemCard key={h.name} item={h} category="heroes" staticData={staticData} thLevel={thLevel} />)}
                  {activeTab === 'equipment' && equipment.map(e => <ItemCard key={e.name} item={e} category="equipment" staticData={staticData} thLevel={thLevel} />)}
                  {activeTab === 'pets' && combinedPets.map(p => <ItemCard key={p.name} item={p} category="pets" staticData={staticData} thLevel={thLevel} />)}
                </div>
                
                {((activeTab === 'pets' && combinedPets.length === 0) || (activeTab === 'equipment' && equipment.length === 0)) && (
                   <div className="w-full py-16 flex flex-col items-center justify-center text-center opacity-50">
                     <ShieldAlert className="w-12 h-12 text-neutral-500 mb-4" />
                     <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">No Items Unlocked</p>
                   </div>
                )}
              </motion.div>
            )}

            {/* NEW: Temporary placeholder for the Buildings Tab */}
            {activeTab === 'buildings' && (
               <motion.div key="buildings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="backdrop-blur-xl bg-[#0a0a0c]/40 border border-white/[0.05] rounded-[2rem] p-10 text-center text-neutral-500">
                  <p className="font-mono text-sm uppercase tracking-widest">Building Tracker Module Pending...</p>
                  {buildingData && <p className="text-[10px] text-green-500 mt-2">({buildingData.buildings?.length} Structures Loaded from Database)</p>}
               </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
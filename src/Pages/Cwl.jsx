import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert, Swords, ArrowLeft, Trophy, Medal, Star } from 'lucide-react';
import api from '../utils/api';
import { useVillage } from '../Context/VillageContext';

const cwlAmbientAssets = [
  "https://assets.clashk.ing/icons/Icon_DC_CWL.png",
  "https://assets.clashk.ing/resources/league_medals.webp",
  "https://assets.clashk.ing/icons/Icon_HV_Shield_Arrow.png",
  "https://assets.clashk.ing/leagues/league-tier/champion_league_1.png"
];

export default function Cwl() {
  const { activeVillage, loadingProfile } = useVillage();
  const [loading, setLoading] = useState(true);
  const [cwlData, setCwlData] = useState(null);
  
  const [activeTab, setActiveTab] = useState('matchups');
  const [selectedWarIndex, setSelectedWarIndex] = useState(null);

  useEffect(() => {
    if (loadingProfile) return;
    if (!activeVillage?.clanTag) {
      setCwlData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/api/cwl/${encodeURIComponent(activeVillage.clanTag)}`)
      .then(res => setCwlData(res.data.data))
      .catch(() => setCwlData(null))
      .finally(() => setLoading(false));
  }, [activeVillage?.clanTag, loadingProfile]);

  // ... keep the rest of your Cwl.jsx file (from `const clanLeaderboard = useMemo(...)` downwards) untouched!
  // Calculate Internal Clan Leaderboard across all available wars
  const clanLeaderboard = useMemo(() => {
    if (!cwlData?.wars) return [];
    const stats = {};
    
    cwlData.wars.forEach(war => {
      if (!war.ourClan?.members) return;
      war.ourClan.members.forEach(m => {
        if (!stats[m.tag]) {
          stats[m.tag] = { name: m.name, tag: m.tag, th: m.townHallLevel, stars: 0, destruction: 0, attacks: 0 };
        }
        if (m.attacks && m.attacks.length > 0) {
          m.attacks.forEach(a => {
            stats[m.tag].stars += a.stars;
            stats[m.tag].destruction += a.destruction;
            stats[m.tag].attacks += 1;
          });
        }
      });
    });
    
    return Object.values(stats).sort((a, b) => b.stars - a.stars || b.destruction - a.destruction);
  }, [cwlData]);

  // Helper to find enemy name by tag for the Attack Log
  const getPlayerName = (tag, memberList) => {
    const player = memberList.find(m => m.tag === tag);
    return player ? player.name : "Unknown Chief";
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-[10px] text-red-500/80 tracking-[0.3em] uppercase font-bold animate-pulse">Establishing War Link...</p>
      </div>
    );
  }

  if (!cwlData?.isInCwl) {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-red-900 mb-6" />
        <h2 className="text-3xl font-serif text-white mb-2">No Active League</h2>
        <p className="text-sm text-neutral-500 max-w-md">Your clan is not participating in the current Clan War League season, or the data is not yet available on the Monolith terminal.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full max-w-6xl mx-auto space-y-6 min-h-[80vh]">
      
      {/* --- CRISP 3D PARALLAX BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [-10, 10, -10], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] blur-[3px]"
        >
          <img src={cwlAmbientAssets[0]} alt="Ambient CWL" className="w-full h-full object-contain grayscale-[30%]" />
        </motion.div>

        {[...Array(6)].map((_, i) => {
          const asset = cwlAmbientAssets[1 + (i % (cwlAmbientAssets.length - 1))];
          const size = Math.random() * 40 + 35;
          return (
            <motion.div 
              key={i}
              animate={{ 
                y: [0, -150, 0], 
                x: [0, (i % 2 === 0 ? 40 : -40), 0],
                rotate: [0, i % 2 === 0 ? 360 : -360],
              }}
              transition={{ duration: 25 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
              className="absolute opacity-30 hover:opacity-50 transition-opacity"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${40 + Math.random() * 50}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <img src={asset} alt="ambient drop" className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(220,38,38,0.3)]" />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* --- HEADER & INNER TABS --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-red-900/30 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.15)] flex-shrink-0">
              <Swords className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide mb-1">
                War League
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-red-400 font-mono tracking-widest uppercase">Season {cwlData.season}</span>
                <span className="w-1 h-1 rounded-full bg-red-800" />
                <span className="text-[11px] text-neutral-400 uppercase tracking-[0.2em] font-bold">
                  Status: <span className={cwlData.state === 'inWar' ? 'text-amber-500' : 'text-white'}>{cwlData.state}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          {selectedWarIndex === null && (
            <div className="flex bg-[#0a0a0c]/80 border border-neutral-800/60 rounded-xl p-1 backdrop-blur-md">
              {['matchups', 'standings', 'leaderboard'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors z-10 ${activeTab === tab ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {activeTab === tab && (
                    <motion.div layoutId="cwlTabBubble" className="absolute inset-0 bg-red-900/40 border border-red-800/50 rounded-lg -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                  )}
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MATCHUPS (AND WAR DETAILS) */}
          {activeTab === 'matchups' && (
            <motion.div key="matchups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              {/* If no war is selected, show the Grid of Rounds */}
              {selectedWarIndex === null ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cwlData.wars.map((war, idx) => {
                    const isEnded = war.state === 'warEnded';
                    const isPrep = war.state === 'preparation';
                    return (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedWarIndex(idx)}
                        className="cursor-pointer backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 hover:border-red-900/50 rounded-[2rem] p-6 shadow-xl transition-colors group relative overflow-hidden"
                      >
                        {war.state === 'inWar' && <div className="absolute top-0 right-0 w-24 h-24 bg-red-900/20 blur-[30px] rounded-full pointer-events-none" />}
                        
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Round {idx + 1}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isEnded ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : isPrep ? 'bg-blue-950/30 border-blue-900/50 text-blue-400' : 'bg-red-950/30 border-red-900/50 text-red-400'}`}>
                            {war.state}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                           {/* Our Clan */}
                           <div className="flex flex-col items-center gap-2 w-1/3">
                             <img src={war.ourClan.badge.url} alt="Us" className="w-12 h-12 drop-shadow-lg" />
                             <span className="text-[11px] font-bold text-white text-center truncate w-full">{war.ourClan.name}</span>
                             <div className="flex items-center gap-1 text-amber-400 font-mono text-sm"><Star className="w-3 h-3" fill="currentColor"/> {war.ourClan.stars || 0}</div>
                           </div>

                           <div className="text-neutral-600 font-bold text-xs uppercase tracking-widest">VS</div>

                           {/* Enemy Clan */}
                           <div className="flex flex-col items-center gap-2 w-1/3">
                             <img src={war.enemyClan.badge.url} alt="Enemy" className="w-12 h-12 drop-shadow-lg" />
                             <span className="text-[11px] font-bold text-neutral-400 text-center truncate w-full">{war.enemyClan.name}</span>
                             <div className="flex items-center gap-1 text-amber-400/50 font-mono text-sm"><Star className="w-3 h-3" fill="currentColor"/> {war.enemyClan.stars || 0}</div>
                           </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex justify-between items-center text-[10px] font-mono tracking-widest">
                           <span className="text-green-500/80">{war.ourClan.destruction ? war.ourClan.destruction.toFixed(1) : 0}% Dest</span>
                           <span className="text-red-500/80">{war.enemyClan.destruction ? war.enemyClan.destruction.toFixed(1) : 0}% Dest</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* --- SPECIFIC WAR DETAIL VIEW --- */
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  
                  {/* Back Button & Header */}
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedWarIndex(null)} className="p-3 rounded-xl bg-[#0a0a0c]/80 border border-neutral-800 hover:bg-neutral-800 transition-colors text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-serif text-white tracking-wide">
                      Round {selectedWarIndex + 1} Action Log
                    </h2>
                  </div>

                  {/* Detailed Attack Logs (Side by Side) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Our Attacks */}
                    <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-green-900/30 rounded-[2rem] overflow-hidden shadow-xl">
                      <div className="p-5 border-b border-green-900/30 bg-green-950/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={cwlData.wars[selectedWarIndex].ourClan.badge.url} className="w-8 h-8" alt="Us" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Our Attacks</h3>
                        </div>
                        <span className="font-mono text-green-400 text-sm">{cwlData.wars[selectedWarIndex].ourClan.stars || 0} ★</span>
                      </div>
                      <div className="p-2 space-y-1 h-[500px] overflow-y-auto custom-scrollbar">
                        {cwlData.wars[selectedWarIndex].ourClan.members?.filter(m => m.attacks?.length > 0).map((member, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-transparent hover:border-neutral-800">
                            <div>
                              <p className="text-xs font-bold text-white">{member.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono mt-1">
                                vs {getPlayerName(member.attacks[0].defenderTag, cwlData.wars[selectedWarIndex].enemyClan.members)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-amber-400 mb-1 justify-end">
                                {[...Array(member.attacks[0].stars)].map((_, s) => <Star key={s} className="w-3 h-3" fill="currentColor" />)}
                              </div>
                              <p className="text-[10px] font-mono text-neutral-400">{member.attacks[0].destruction}%</p>
                            </div>
                          </div>
                        ))}
                        {cwlData.wars[selectedWarIndex].state === 'preparation' && (
                          <p className="text-center text-neutral-500 text-xs py-10 uppercase tracking-widest font-bold">Preparation Day</p>
                        )}
                      </div>
                    </div>

                    {/* Enemy Attacks */}
                    <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-red-900/30 rounded-[2rem] overflow-hidden shadow-xl">
                      <div className="p-5 border-b border-red-900/30 bg-red-950/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={cwlData.wars[selectedWarIndex].enemyClan.badge.url} className="w-8 h-8" alt="Them" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Enemy Attacks</h3>
                        </div>
                        <span className="font-mono text-red-400 text-sm">{cwlData.wars[selectedWarIndex].enemyClan.stars || 0} ★</span>
                      </div>
                      <div className="p-2 space-y-1 h-[500px] overflow-y-auto custom-scrollbar">
                        {cwlData.wars[selectedWarIndex].enemyClan.members?.filter(m => m.attacks?.length > 0).map((member, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-transparent hover:border-neutral-800">
                            <div>
                              <p className="text-xs font-bold text-neutral-300">{member.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono mt-1">
                                vs {getPlayerName(member.attacks[0].defenderTag, cwlData.wars[selectedWarIndex].ourClan.members)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-red-400 mb-1 justify-end">
                                {[...Array(member.attacks[0].stars)].map((_, s) => <Star key={s} className="w-3 h-3" fill="currentColor" />)}
                              </div>
                              <p className="text-[10px] font-mono text-neutral-500">{member.attacks[0].destruction}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 2: STANDINGS (Current League Group) */}
          {activeTab === 'standings' && (
            <motion.div key="standings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-800/60 flex items-center gap-3">
                  <Medal className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-serif text-white tracking-widest uppercase">League Group</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0a0a0c]">
                      <tr>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Clan</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">Level</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">Roster Size</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-right">Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/40">
                      {cwlData.standings.map((clan, index) => (
                        <tr key={clan.tag} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={clan.badge.url} alt="badge" className="w-8 h-8" />
                              <span className={`font-bold ${clan.tag === cwlData.wars[0]?.ourClan?.tag ? 'text-amber-400' : 'text-white'}`}>{clan.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-neutral-300">{clan.level}</td>
                          <td className="px-6 py-4 text-center font-mono text-neutral-400">{clan.members?.length || 0}</td>
                          <td className="px-6 py-4 text-right font-mono text-neutral-600">{clan.tag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CLAN LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-800/60 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-serif text-white tracking-widest uppercase">Internal MVP Board</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0a0a0c]">
                      <tr>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Rank</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Chief</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">Attacks</th>
                        <th className="px-6 py-4 text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center">Total Stars</th>
                        <th className="px-6 py-4 text-[10px] text-green-500/80 font-bold uppercase tracking-widest text-right">Total Dest.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/40">
                      {clanLeaderboard.map((member, index) => (
                        <tr key={member.tag} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-mono text-neutral-500">#{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-white font-bold">{member.name}</span>
                              <span className="text-[9px] text-neutral-500 font-mono tracking-widest">TH{member.th}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-neutral-400">{member.attacks}</td>
                          <td className="px-6 py-4 text-center font-mono text-amber-400 font-bold">{member.stars}</td>
                          <td className="px-6 py-4 text-right font-mono text-green-400">{member.destruction.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
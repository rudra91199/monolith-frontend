import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronRight, Loader2, Fingerprint, Users, Swords, Hexagon, X, MessageSquareQuote } from 'lucide-react';
import api from '../utils/api';

// Crisp Clan Ambient Assets
const clanAmbientAssets = [
  "https://assets.clashk.ing/resources/league_medals.webp",
  "https://assets.clashk.ing/resources/raid_medals.webp",
  "https://assets.clashk.ing/icons/Icon_DC_CWL.png",
  "https://assets.clashk.ing/icons/Icon_HV_Shield_Arrow.png",
  "https://assets.clashk.ing/icons/Icon_CC_Resource_Capital_Gold_small.png",
  "https://assets.clashk.ing/magic_snacks/clan_castle_cake.webp"
];

export default function Clan() {
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [clanData, setClanData] = useState(null);
  
  const [userRole, setUserRole] = useState('Member');
  const [clanTag, setClanTag] = useState('Unknown');
  
  const [showRosterModal, setShowRosterModal] = useState(false);

  const getDecodedToken = () => {
    const token = localStorage.getItem('coc_token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch (e) { return null; }
  };

  useEffect(() => {
    const checkClanStatus = async () => {
      try {
        const tokenData = getDecodedToken();
        if (!tokenData) return setLoading(false);

        const role = tokenData.role || tokenData.userRole || 'Member';
        setUserRole(role);
        setClanTag(tokenData.clanTag || 'Unknown');
        
        const response = await api.get(`/api/clan/${encodeURIComponent(tokenData.clanTag)}`);
        const fetchedData = response.data?.data || response.data;

        if (response.data?.isRegistered && fetchedData?.name) {
          setClanData(fetchedData);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        setIsRegistered(false);
      } finally {
        setLoading(false);
      }
    };
    checkClanStatus();
  }, []);

  const handleRegisterClan = async () => {
    setRegistering(true);
    try {
      await api.post('/api/clan/register', { clanTag });
      const encodedTag = encodeURIComponent(clanTag);
      const getResponse = await api.get(`/api/clan/${encodedTag}`);
      const fetchedData = getResponse.data?.data || getResponse.data;
      
      if (fetchedData && fetchedData.name) {
        setClanData(fetchedData);
        setIsRegistered(true);
      } else {
        throw new Error("Could not retrieve clan data after registration.");
      }
    } catch (error) {
      alert("Registration failed. Check your browser console.");
    } finally {
      setRegistering(false);
    }
  };

  const normalizedRole = userRole.toLowerCase();
  const hasClearance = ['leader', 'coleader', 'admin'].includes(normalizedRole);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-neutral-500 animate-spin mb-4" />
        <p className="text-[10px] text-neutral-500 tracking-[0.3em] uppercase font-bold animate-pulse">Scouting Clan...</p>
      </div>
    );
  }

  const memberCount = clanData?.memberCount || (Array.isArray(clanData?.members) ? clanData.members.length : 0);
  const membersArray = clanData?.members || clanData?.memberList || [];
  const clanCastleImage = "https://assets.clashk.ing/buildings/home-village/clan_castle/level_11.webp";
  
  // FIX: Properly reference .badge.url as provided by clashofclans.js
  const backgroundAsset = isRegistered && clanData?.badge?.url ? clanData.badge.url : clanCastleImage;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full max-w-6xl mx-auto space-y-6">
      
      {/* --- CRISP CLAN ASSETS PARALLAX BACKGROUND (FIXED TO VIEWPORT) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Clan Crest Watermark */}
        <motion.div 
          animate={{ y: [-10, 10, -10], rotate: [0, 2, -2, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] blur-[4px]"
        >
          <img src={backgroundAsset} alt="Ambient Clan Asset" className="w-full h-full object-contain grayscale-[20%]" />
        </motion.div>

        {/* Floating Medals and Shields */}
        {[...Array(6)].map((_, i) => {
          const asset = clanAmbientAssets[i % clanAmbientAssets.length];
          const size = Math.random() * 45 + 40;
          return (
            <motion.div 
              key={i}
              animate={{ 
                y: [0, -120, 0], 
                x: [0, (i % 2 === 0 ? 40 : -40), 0],
                rotate: [0, i % 2 === 0 ? -360 : 360],
              }}
              transition={{ duration: 25 + Math.random() * 15, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
              className="absolute opacity-25 hover:opacity-40 transition-opacity"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${40 + Math.random() * 50}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <img src={asset} alt="ambient drop" className="w-full h-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]" />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 space-y-6">
        {/* --- UNREGISTERED STATE --- */}
        {!isRegistered && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="w-full max-w-md backdrop-blur-[40px] bg-[#08080a]/80 border border-neutral-800/60 rounded-[2rem] p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,1)] text-center relative overflow-hidden"
            >
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[70px] opacity-20 pointer-events-none ${hasClearance ? 'bg-amber-500' : 'bg-red-600'}`} />
              <div className="relative z-10">
                <div className="w-28 h-28 mx-auto mb-6 relative">
                  <img src={clanCastleImage} alt="Clan Castle" className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide font-serif mb-3">
                  {hasClearance ? 'Clan Castle Unlinked' : 'Clearance Too Low'}
                </h2>
                <div className="inline-block px-4 py-1.5 mb-6 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[11px] text-neutral-400 font-mono tracking-wider">{clanTag}</p>
                </div>
                {hasClearance ? (
                  <>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                      Your clan's fortress has not been established on the Monolith servers. Construct the link to track your history.
                    </p>
                    <button onClick={handleRegisterClan} disabled={registering} className="w-full h-14 rounded-xl bg-white text-black font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                      {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Establish Link</span><ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3 text-left">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-[12px] text-neutral-300">Ask your Leader or Co-Leader to log in and restore the Clan Castle.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* --- REGISTERED OVERVIEW STATE --- */}
        {isRegistered && clanData && (
          <>
            {/* HEADER ROW */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800/60 pb-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 relative flex-shrink-0">
                  {/* FIX: Map the official badge properly */}
                  <img src={clanData.badge?.url || clanCastleImage} alt="Clan Badge" className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide mb-1">
                    {clanData.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-3 mt-2">
                    <span className="text-[11px] text-neutral-500 font-mono tracking-widest">{clanData.tag}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-[11px] text-amber-500 uppercase tracking-[0.2em] font-bold">Level {clanData.clanLevel || clanData.level || '--'}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-[11px] text-neutral-400 uppercase tracking-[0.2em] font-bold">
                       {clanData.type === 'inviteOnly' ? 'Invite Only' : clanData.type === 'closed' ? 'Closed' : 'Open'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/50 border border-neutral-800">
                   <Fingerprint className="w-4 h-4 text-neutral-500" />
                   <span className="text-[11px] text-neutral-400 uppercase tracking-widest">Clearance: <span className="text-white font-bold">{userRole}</span></span>
                 </div>
                 <button onClick={() => setShowRosterModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors text-white">
                   <Users className="w-4 h-4" />
                   <span className="text-[11px] uppercase tracking-widest font-bold">{memberCount}/50 Roster</span>
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUMN 1: Identity & Description */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 rounded-[2rem] p-8 shadow-xl">
                   <div className="flex items-center gap-3 mb-4 text-neutral-500">
                      <MessageSquareQuote className="w-5 h-5" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Clan Charter</span>
                   </div>
                   <p className="text-neutral-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                     {clanData.description || "No description provided."}
                   </p>
                 </div>

                 {clanData.labels && clanData.labels.length > 0 && (
                   <div className="flex flex-wrap gap-3">
                     {clanData.labels.map((label) => (
                       <div key={label.id} className="flex items-center gap-2 bg-[#0a0a0c]/80 border border-neutral-800/60 rounded-xl px-4 py-2">
                         {label.iconUrls?.small && <img src={label.iconUrls.small} alt={label.name} className="w-6 h-6 object-contain" />}
                         <span className="text-xs text-neutral-300 font-bold">{label.name}</span>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              {/* COLUMN 2: Performance Stats */}
              <div className="space-y-6">
                 
                 {/* War Machine Card */}
                 <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 blur-[40px] rounded-full pointer-events-none" />
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                      <Swords className="w-5 h-5 text-red-500" />
                      <h3 className="text-white font-serif tracking-wide uppercase text-sm">War Machine</h3>
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">War League</p>
                        <p className="text-sm font-bold text-neutral-200">{clanData.warLeague?.name || "Unranked"}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-neutral-800/60 pt-4">
                        <div>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Wins - Losses - Ties</p>
                          <p className="font-mono text-sm">
                            <span className="text-green-500">{clanData.warWins || 0}</span>
                            <span className="text-neutral-600 mx-1">-</span>
                            <span className="text-red-500">{clanData.warLosses || 0}</span>
                            <span className="text-neutral-600 mx-1">-</span>
                            <span className="text-neutral-400">{clanData.warTies || 0}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Streak</p>
                          <p className="text-lg font-mono text-amber-500">{clanData.warWinStreak || 0}</p>
                        </div>
                      </div>
                   </div>
                 </div>

                 {/* Capital Card */}
                 <div className="backdrop-blur-[40px] bg-[#070709]/80 border border-neutral-800/60 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/10 blur-[40px] rounded-full pointer-events-none" />
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                      <Hexagon className="w-5 h-5 text-cyan-500" />
                      <h3 className="text-white font-serif tracking-wide uppercase text-sm">Clan Capital</h3>
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Capital League</p>
                        <p className="text-sm font-bold text-neutral-200">{clanData.capitalLeague?.name || "Unranked"}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-neutral-800/60 pt-4">
                        <div>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Capital Hall</p>
                          <p className="font-mono text-lg text-white">{clanData.clanCapital?.capitalHallLevel || 1}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Trophies</p>
                          <p className="text-lg font-mono text-cyan-400">{clanData.capitalPoints || 0}</p>
                        </div>
                      </div>
                   </div>
                 </div>

              </div>
            </div>

            {/* --- ROSTER MODAL --- */}
            <AnimatePresence>
              {showRosterModal && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowRosterModal(false)}
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl z-[70] bg-[#0a0a0c] border border-neutral-800/80 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
                  >
                    <div className="flex items-center justify-between p-6 border-b border-neutral-800/60 bg-[#070709]">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-neutral-500" />
                        <h2 className="text-lg font-serif text-white tracking-widest uppercase">Active Roster</h2>
                      </div>
                      <button onClick={() => setShowRosterModal(false)} className="p-2 rounded-full bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="overflow-y-auto overflow-x-auto custom-scrollbar p-0 m-0">
                      <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
                        <thead className="bg-[#0a0a0c] sticky top-0 z-10 shadow-md">
                          <tr>
                            <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Rank</th>
                            <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Chief</th>
                            <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">TH</th>
                            <th className="px-6 py-4 text-[10px] text-green-600/80 font-bold uppercase tracking-widest text-right">Donated</th>
                            <th className="px-6 py-4 text-[10px] text-red-600/80 font-bold uppercase tracking-widest text-right">Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                          {membersArray.map((member, index) => (
                            <tr key={member.tag || index} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-mono text-neutral-500">{index + 1}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-white font-bold">{member.name}</span>
                                  <span className="text-[9px] text-neutral-500 font-mono tracking-widest">{member.tag}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[11px] text-neutral-400 uppercase tracking-widest font-bold">
                                {member.role ? member.role.replace('admin', 'Elder').replace('coLeader', 'Co-Leader') : '--'}
                              </td>
                              <td className="px-6 py-4 text-center font-mono text-white">{member.townHallLevel || '--'}</td>
                              <td className="px-6 py-4 text-right font-mono text-neutral-300">{member.donations || 0}</td>
                              <td className="px-6 py-4 text-right font-mono text-neutral-500">{member.donationsReceived || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
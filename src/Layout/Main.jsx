import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router';
import { LayoutDashboard, Shield, Swords, Hexagon, LogOut, Castle, Target, ChevronUp, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useVillage } from '../context/VillageContext';

function DesktopNavLink({ link, isActive }) {
  const Icon = link.icon;
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { damping: 15, stiffness: 150 });
  const mouseY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.15);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.15);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <Link to={link.path} ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="block relative group my-1">
      {isActive && (
        <motion.div layoutId="active-desktop" className="absolute inset-0 bg-white/[0.04] rounded-xl border border-white/[0.08] shadow-[inset_0_1px_12px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.5)]" transition={{ type: "spring", stiffness: 220, damping: 25 }} />
      )}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-neutral-700/30 pointer-events-none" />
      <motion.div style={{ x: mouseX, y: mouseY }} className={`relative z-10 flex items-center gap-4 px-4 py-3 rounded-xl ${isActive ? 'text-white font-semibold' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
        <motion.div variants={{ hover: { rotate: 5, scale: 1.05 }, rest: { rotate: 0, scale: 1 } }} className="transition-transform">
          <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
        </motion.div>
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold select-none">{link.name}</span>
      </motion.div>
    </Link>
  );
}

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const { linkedVillages, activeVillage, setActiveVillage, openLinkModal, unlinkVillage } = useVillage();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.035), transparent 80%)`;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('coc_token');
    localStorage.removeItem('coc_active_village');
    navigate('/');
  };

  const playerLinks = [
    { name: 'Terminal', path: '/dashboard', icon: LayoutDashboard }
  ];

  const clanLinks = [
    { name: 'Overview', path: '/dashboard/clan', icon: Shield },
    { name: 'War League', path: '/dashboard/cwl', icon: Swords },
    { name: 'Clan Games', path: '/dashboard/games', icon: Target },
    { name: 'Capital', path: '/dashboard/capital', icon: Hexagon },
  ];

  const isClanRouteActive = clanLinks.some(link => location.pathname === link.path);

  return (
    <div className="min-h-[100dvh] bg-[#030304] flex selection:bg-neutral-600/40 font-sans overflow-hidden">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-size-[120%] bg-center" style={{ backgroundImage: `url('https://assets.clashk.ing/sceneries/dark_days_scenery/thumbnail.webp')` }} />
        <div className="absolute inset-0 bg-[#030304]/85" />
      </div>

      {/* 1. DESKTOP SIDEBAR */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 100, mass: 1 }}
        onMouseMove={(e) => {
          if (isMobile) return;
          const rect = e.currentTarget.getBoundingClientRect();
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
        }}
        className="hidden lg:flex flex-col w-[290px] fixed inset-y-0 left-0 z-40 backdrop-blur-[40px] bg-[#070709]/70 border-r border-neutral-800/50 shadow-[30px_0_70px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ background: spotlight }} />

        {/* Branding */}
        <div className="p-8 pb-5 flex items-center gap-4 relative z-10 border-b border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-[#0a0a0c]/80 border border-neutral-700/50 flex items-center justify-center shadow-[inset_0_2px_15px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-600/20 to-transparent opacity-50" />
            <Castle className="w-6 h-6 text-neutral-200 relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-[0.2em] uppercase font-serif leading-tight">Monolith</h1>
            <p className="text-[9px] text-neutral-400 tracking-[0.3em] uppercase font-semibold mt-0.5">Data Syndicate</p>
          </div>
        </div>

        {/* MULTI-VILLAGE SWITCHER */}
        <div className="px-4 pt-4 relative z-20">
          <div className="bg-[#0a0a0c]/90 border border-neutral-800/80 rounded-2xl p-2.5">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[9px] text-neutral-500 uppercase tracking-[0.25em] font-bold">Active Village</span>
              <button
                onClick={() => openLinkModal('link')}
                className="flex items-center gap-1 text-[9px] text-amber-400 hover:text-amber-300 uppercase tracking-widest font-bold"
              >
                <Plus className="w-3 h-3" /> Add ID
              </button>
            </div>

            {activeVillage ? (
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-colors text-left"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{activeVillage.name}</p>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-wider truncate">
                    TH{activeVillage.townHallLevel} &bull; {activeVillage.clanName || 'No Clan'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={() => openLinkModal('link')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest text-center hover:bg-amber-500/20 transition-colors"
              >
                + Link First Village
              </button>
            )}

            <AnimatePresence>
              {switcherOpen && linkedVillages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-2 border-t border-neutral-800/60 space-y-1 max-h-48 overflow-y-auto custom-scrollbar"
                >
                  {linkedVillages.map((v) => {
                    const isSelected = activeVillage?.tag === v.tag;
                    return (
                      <div
                        key={v.tag}
                        className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                          isSelected ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <button
                          onClick={() => { setActiveVillage(v); setSwitcherOpen(false); }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-neutral-300'}`}>
                            {v.name}
                          </p>
                          <p className="text-[9px] font-mono text-neutral-500 truncate">
                            {v.tag} &bull; TH{v.townHallLevel}
                          </p>
                        </button>
                        <button
                          onClick={() => unlinkVillage(v.tag)}
                          title="Unlink village"
                          className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 px-4 py-6 space-y-8 relative z-10 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-4 text-[9px] text-neutral-600 font-bold uppercase tracking-[0.3em] mb-3">Player</p>
            <nav className="space-y-1">
              {playerLinks.map((link) => (
                <DesktopNavLink key={link.name} link={link} isActive={location.pathname === link.path} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-4 text-[9px] text-neutral-600 font-bold uppercase tracking-[0.3em] mb-3">Clan Modules</p>
            <nav className="space-y-1">
              {clanLinks.map((link) => (
                <DesktopNavLink key={link.name} link={link} isActive={location.pathname === link.path} />
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 relative z-10 border-t border-white/[0.02]">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition-all group">
            <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Disconnect</span>
          </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-[290px] pb-[96px] lg:pb-0 min-h-screen relative z-10">
        <motion.div key={`${location.pathname}-${activeVillage?.tag || 'none'}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="h-full text-white">
          <Outlet />
        </motion.div>
      </main>

      {/* 3. MOBILE BOTTOM SHEET MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-[80px] left-4 right-4 z-50 bg-[#0a0a0c] border border-neutral-800/80 rounded-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-2 max-h-[75vh] overflow-y-auto"
            >
              {/* Mobile Village Switcher */}
              <div className="p-4 border-b border-neutral-800/60 bg-[#070709]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.25em]">Linked Villages</span>
                  <button
                    onClick={() => { setMobileMenuOpen(false); openLinkModal('link'); }}
                    className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Village
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {linkedVillages.map((v) => (
                    <button
                      key={v.tag}
                      onClick={() => { setActiveVillage(v); setMobileMenuOpen(false); }}
                      className={`px-3 py-2 rounded-xl border text-left shrink-0 ${
                        activeVillage?.tag === v.tag
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <p className="text-xs font-bold">{v.name}</p>
                      <p className="text-[9px] font-mono opacity-80">TH{v.townHallLevel} &bull; {v.clanName || 'No Clan'}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/50">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">Clan Operations</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full bg-neutral-900 text-neutral-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-2 space-y-1">
                {clanLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link key={link.name} to={link.path} className={`flex items-center gap-4 p-4 rounded-2xl ${isActive ? 'bg-neutral-800/60 text-white' : 'text-neutral-400'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs uppercase tracking-widest font-bold">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. MOBILE BOTTOM DOCK */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 22, stiffness: 120, delay: 0.1 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-[40px] bg-[#070709]/85 border-t border-neutral-800/50 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center justify-between px-6 py-2">
          <Link to="/dashboard" className="relative flex flex-col items-center justify-center w-16 h-14">
             {location.pathname === '/dashboard' && <motion.div layoutId="active-mobile-dock" className="absolute inset-x-0 inset-y-1 bg-neutral-800/50 rounded-2xl border border-neutral-700/50" />}
             <div className={`relative z-10 flex flex-col items-center ${location.pathname === '/dashboard' ? 'text-white' : 'text-neutral-500'}`}>
               <LayoutDashboard className="w-[20px] h-[20px] mb-1" />
               <span className="text-[9px] uppercase tracking-[0.1em] font-bold scale-90">Terminal</span>
             </div>
          </Link>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="relative flex flex-col items-center justify-center w-20 h-14">
             {isClanRouteActive && <motion.div layoutId="active-mobile-dock" className="absolute inset-x-0 inset-y-1 bg-neutral-800/50 rounded-2xl border border-neutral-700/50" />}
             <div className={`relative z-10 flex flex-col items-center ${isClanRouteActive || mobileMenuOpen ? 'text-white' : 'text-neutral-500'}`}>
               {mobileMenuOpen ? <ChevronUp className="w-[20px] h-[20px] mb-1" /> : <Shield className="w-[20px] h-[20px] mb-1" />}
               <span className="text-[9px] uppercase tracking-[0.1em] font-bold scale-90 truncate max-w-[76px]">
                 {activeVillage?.name || 'Menu'}
               </span>
             </div>
          </button>

          <button onClick={handleLogout} className="relative flex flex-col items-center justify-center w-16 h-14 text-neutral-500 hover:text-red-400">
             <div className="relative z-10 flex flex-col items-center">
               <LogOut className="w-[20px] h-[20px] mb-1" />
               <span className="text-[9px] uppercase tracking-[0.1em] font-bold scale-90">Exit</span>
             </div>
          </button>
        </div>
      </motion.nav>

    </div>
  );
}
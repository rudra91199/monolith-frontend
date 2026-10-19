import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Swords, FlaskConical, Crown, Shield, PawPrint, ChevronDown, Castle } from 'lucide-react';

export const DASHBOARD_TABS = [
  { id: 'overview', icon: Layers, label: 'Overview' },
  { id: 'troops', icon: Swords, label: 'Troops' },
  { id: 'spells', icon: FlaskConical, label: 'Spells' },
  { id: 'heroes', icon: Crown, label: 'Heroes' },
  { id: 'equipment', icon: Shield, label: 'Equips' },
  { id: 'pets', icon: PawPrint, label: 'Pets' },
  { id: 'buildings', icon: Castle, label: 'Bases' } // NEW LINE
];
export default function PlayerTabs({ activeTab, setActiveTab }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeTabData = DASHBOARD_TABS.find(t => t.id === activeTab);
  const ActiveIcon = activeTabData?.icon || Layers;

  return (
    <div className="relative z-50">
      
      {/* MOBILE: Dropdown Menu */}
      <div className="md:hidden relative w-full">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-4 rounded-[1.25rem] bg-black/60 border border-white/[0.08] backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center gap-3 text-white">
            <ActiveIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest">{activeTabData?.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/[0.08] rounded-[1.25rem] overflow-hidden shadow-2xl"
            >
              {DASHBOARD_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 p-4 text-left border-b border-white/[0.02] last:border-0 transition-colors ${isActive ? 'bg-white/5 text-white' : 'text-neutral-400 hover:bg-white/[0.02]'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : ''}`} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP: Horizontal Tabs */}
      <div className="hidden md:flex items-center gap-2 p-1.5 bg-black/60 border border-white/[0.05] rounded-[1.25rem] backdrop-blur-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] w-max">
        {DASHBOARD_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 flex items-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${isActive ? 'text-white drop-shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="desktopTabBg" 
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] -z-10" 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                />
              )}
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
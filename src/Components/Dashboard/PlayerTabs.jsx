import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLASH_ICONS, useBuilderIcon } from '../../utils/upgradeCalculator';

export default function PlayerTabs({ activeTab, setActiveTab, activeBuilderCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const workingBuilderIcon = useBuilderIcon(true);
  const freeBuilderIcon = useBuilderIcon(false);

  const isBuildersWorking = activeBuilderCount > 0;
  const builderTabIcon = isBuildersWorking ? workingBuilderIcon : freeBuilderIcon;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: CLASH_ICONS.townHall, badge: 'Matrix' },
    {
      id: 'builders',
      label: `Builders (${activeBuilderCount}/6)`,
      icon: builderTabIcon,
      badge: isBuildersWorking ? 'Working' : 'Idle',
      isWorking: isBuildersWorking
    },
    { id: 'troops', label: 'Troops', icon: CLASH_ICONS.troops, badge: 'Army' },
    { id: 'spells', label: 'Spells', icon: CLASH_ICONS.spells, badge: 'Factory' },
    { id: 'heroes', label: 'Heroes', icon: CLASH_ICONS.heroes, badge: 'Hero Hall' },
    { id: 'equipment', label: 'Equipment', icon: CLASH_ICONS.equipment, badge: 'Gear' },
    { id: 'pets', label: 'Pets', icon: CLASH_ICONS.pets, badge: 'Pet House' },
    { id: 'buildings', label: 'Structures', icon: CLASH_ICONS.structures, badge: 'Village' }
  ];

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-40 flex-1">
      {/* MOBILE: Compact Skeuomorphic Button (No Colored Borders) */}
      <div ref={dropdownRef} className="md:hidden relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
            activeTabData.id === 'builders' && isBuildersWorking
              ? 'bg-gradient-to-b from-[#162722] to-[#0a1210] shadow-[inset_0_1px_1px_rgba(52,211,153,0.3),0_8px_20px_rgba(0,0,0,0.85)]'
              : 'bg-gradient-to-b from-[#1e1e26] to-[#0e0e13] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.75)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeTabData.icon}
                alt={activeTabData.label}
                className="w-6 h-6 object-contain drop-shadow"
              />
              {activeTabData.id === 'builders' && isBuildersWorking && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[8px] text-neutral-400 font-mono uppercase tracking-widest">
                Category
              </p>
              <p
                className={`text-xs font-bold uppercase tracking-wider truncate ${
                  activeTabData.id === 'builders' && isBuildersWorking
                    ? 'text-emerald-300'
                    : 'text-white'
                }`}
              >
                {activeTabData.label}
              </p>
            </div>
          </div>

          <span className="ml-2 px-2 py-0.5 rounded-lg bg-black/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] text-[9px] font-mono text-neutral-300">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.16 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0d0d12]/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_25px_60px_rgba(0,0,0,0.95)] divide-y divide-white/[0.04]"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isBuilderWorkingTab = tab.id === 'builders' && tab.isWorking;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      isActive
                        ? isBuilderWorkingTab
                          ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-200'
                          : 'bg-gradient-to-r from-white/[0.14] to-white/[0.04] text-white'
                        : isBuilderWorkingTab
                        ? 'bg-emerald-950/25 text-emerald-300 hover:bg-emerald-950/40'
                        : 'text-neutral-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={tab.icon}
                          alt={tab.label}
                          className="w-6 h-6 object-contain"
                        />
                        {isBuilderWorkingTab && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider truncate">
                        {tab.label}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase shrink-0 px-2 py-0.5 rounded-md ${
                        isBuilderWorkingTab
                          ? 'bg-emerald-500/15 text-emerald-300 font-bold shadow-[inset_0_1px_1px_rgba(52,211,153,0.25)]'
                          : 'text-neutral-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP / LAPTOP: Spread Skeuomorphic Tab Bar (Borderless Active Pills) */}
      <div className="hidden md:flex items-center flex-wrap gap-1.5 p-1.5 bg-[#07070a]/90 rounded-2xl backdrop-blur-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.07)] w-max max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isBuilderWorkingTab = tab.id === 'builders' && tab.isWorking;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 flex items-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? isBuilderWorkingTab
                    ? 'text-emerald-200 drop-shadow-md'
                    : 'text-white drop-shadow-md'
                  : isBuilderWorkingTab
                  ? 'text-emerald-300 bg-gradient-to-b from-emerald-500/15 to-emerald-950/20 shadow-[inset_0_1px_1px_rgba(52,211,153,0.25)] hover:from-emerald-500/25'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="desktopTabBg"
                  className={`absolute inset-0 rounded-xl -z-10 ${
                    isBuilderWorkingTab
                      ? 'bg-gradient-to-b from-emerald-500/25 to-emerald-950/40 shadow-[inset_0_1px_1px_rgba(52,211,153,0.4),0_4px_12px_rgba(0,0,0,0.7)]'
                      : 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.65)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative shrink-0">
                <img src={tab.icon} alt={tab.label} className="w-5 h-5 object-contain" />
                {isBuilderWorkingTab && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
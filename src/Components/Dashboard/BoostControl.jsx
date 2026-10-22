import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLASH_ICONS, useBuilderIcon } from '../../utils/upgradeCalculator';

const BOOST_OPTIONS = [
  { id: 'none', short: '0%', label: 'No Boost (0%)', badge: 'Standard' },
  { id: 'gold_pass_10', short: '10%', label: 'Gold Pass (10%)', badge: '-10%' },
  { id: 'gold_pass_15', short: '15%', label: 'Gold Pass (15%)', badge: '-15%' },
  { id: 'gold_pass_20', short: '20%', label: 'Gold Pass (20%)', badge: '-20%' },
  { id: 'hammer_jam', short: '50%', label: 'Hammer Jam (50%)', badge: '-50%' },
  { id: 're_engagement', short: '50%', label: 'Return Boost (50%)', badge: '-50%' }
];

export default function BoostControl({ boostConfig, setBoostConfig }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const workingBuilderIcon = useBuilderIcon(true);
  const currentOption = BOOST_OPTIONS.find((o) => o.id === boostConfig.type) || BOOST_OPTIONS[0];

  useEffect(() => {
    const handleOut = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  return (
    <div ref={ref} className="relative z-40 shrink-0">
      {/* MOBILE: Compact Tactile Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-[#1e1e26] to-[#0e0e13] border border-white/[0.15] border-b-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_6px_16px_rgba(0,0,0,0.75)]"
      >
        <img src={CLASH_ICONS.boostSnack} alt="Boost" className="w-6 h-6 object-contain shrink-0" />
        <div className="text-left">
          <p className="text-[8px] text-neutral-400 font-mono uppercase tracking-widest">Boost</p>
          <p className="text-xs font-bold text-white whitespace-nowrap">
            {currentOption.short}
            {boostConfig.type !== 'none' && boostConfig.daysLeft ? ` • ${boostConfig.daysLeft}d` : ''}
          </p>
        </div>
        <span className="text-[9px] font-mono text-neutral-400 ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {/* DESKTOP: Full Skeuomorphic Bar */}
      <div className="hidden md:flex items-center gap-3 backdrop-blur-xl bg-gradient-to-b from-[#15151a]/90 to-[#0a0a0d]/95 border border-white/[0.1] border-b-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_8px_20px_rgba(0,0,0,0.7)] rounded-2xl px-4 py-2">
        <img src={CLASH_ICONS.boostSnack} alt="Boost" className="w-7 h-7 object-contain shrink-0" />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#060608] border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-left cursor-pointer"
        >
          <div>
            <p className="text-[8px] text-neutral-400 uppercase font-mono">Active Boost</p>
            <p className="text-xs font-bold text-white">{currentOption.label}</p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">{open ? '▲' : '▼'}</span>
        </button>

        {boostConfig.type !== 'none' && (
          <div className="flex items-center gap-2 bg-[#060608] border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] rounded-xl px-3 py-1.5">
            <img src={workingBuilderIcon} alt="" className="w-4 h-4 object-contain" />
            <input
              type="number"
              placeholder="Days"
              value={boostConfig.daysLeft || ''}
              onChange={(e) => setBoostConfig({ ...boostConfig, daysLeft: e.target.value })}
              className="bg-transparent border-none outline-none text-white text-xs font-mono w-12 placeholder:text-neutral-600"
            />
            <span className="text-[9px] text-neutral-400 uppercase font-bold">Days</span>
          </div>
        )}
      </div>

      {/* Popover Menu (Works on both Mobile & Desktop) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 z-[100] bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.15] rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.98)] p-2 space-y-1"
          >
            {BOOST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setBoostConfig({ ...boostConfig, type: opt.id });
                  if (opt.id === 'none') setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                  boostConfig.type === opt.id
                    ? 'bg-gradient-to-r from-white/[0.16] to-white/[0.05] text-white font-bold border border-white/[0.15]'
                    : 'text-neutral-300 hover:bg-white/[0.05]'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] font-mono text-neutral-400">{opt.badge}</span>
              </button>
            ))}

            {boostConfig.type !== 'none' && (
              <div className="pt-2 mt-1 border-t border-white/[0.08] flex items-center justify-between px-2 py-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Days Left:</span>
                <input
                  type="number"
                  placeholder="0"
                  value={boostConfig.daysLeft || ''}
                  onChange={(e) => setBoostConfig({ ...boostConfig, daysLeft: e.target.value })}
                  className="bg-black/80 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs font-mono w-20 text-right outline-none"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
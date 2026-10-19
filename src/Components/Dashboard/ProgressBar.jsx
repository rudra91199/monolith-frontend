import { motion } from 'framer-motion';

export default function ProgressBar({ label, stats, colorClass }) {
  if (!stats || stats.max === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 drop-shadow-md">{label}</span>
        <span className="text-[11px] text-white font-bold drop-shadow-md">{stats.percentage}% <span className="text-neutral-500 font-mono tracking-normal text-[10px] ml-1">({stats.current}/{stats.max})</span></span>
      </div>
      <div className="w-full h-2.5 sm:h-3 bg-[#0a0a0c] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)] border border-black/50">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${stats.percentage}%` }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-full relative overflow-hidden shadow-[0_0_10px_currentColor]`}
        >
           <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
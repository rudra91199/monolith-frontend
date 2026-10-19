import { Zap, Clock } from "lucide-react";

const BOOST_OPTIONS = [
  {
    id: "none",
    label: "No Boost",
    color: "text-neutral-500",
    bg: "bg-neutral-900",
  },
  {
    id: "gold_pass_10",
    label: "Pass 10%",
    color: "text-yellow-500",
    bg: "bg-yellow-950/30",
  },
  {
    id: "gold_pass_15",
    label: "Pass 15%",
    color: "text-yellow-400",
    bg: "bg-yellow-900/40",
  },
  {
    id: "gold_pass_20",
    label: "Pass 20%",
    color: "text-amber-400",
    bg: "bg-amber-900/40",
  },
  {
    id: "hammer_jam",
    label: "Hammer Jam",
    color: "text-cyan-400",
    bg: "bg-cyan-900/40",
  },
  {
    id: "re_engagement",
    label: "Return Boost",
    color: "text-green-400",
    bg: "bg-green-900/40",
  },
];

export default function BoostControl({ boostConfig, setBoostConfig }) {
  return (
    <div className="backdrop-blur-xl bg-[#0a0a0c]/60 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
      {/* Title Area */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[inset_0_1px_4px_rgba(245,158,11,0.2)]">
          <Zap className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm tracking-wide drop-shadow-md">
            Active Boosts
          </h3>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-widest">
            Calculates ETM & Costs
          </p>
        </div>
      </div>

      {/* Control Toggles */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
        <div className="flex bg-black/60 border border-white/[0.05] rounded-[1rem] p-1 w-full sm:w-auto overflow-x-auto custom-scrollbar shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          {BOOST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBoostConfig({ ...boostConfig, type: opt.id })}
              className={`px-3 py-1.5 rounded-[0.75rem] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${boostConfig.type === opt.id ? `${opt.bg}${opt.color} shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.4)]` : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Expiration Timer (Only shows if a boost is active) */}
        {boostConfig.type !== "none" && (
          <div className="flex items-center gap-2 bg-black/60 border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] rounded-[1rem] px-3 py-1.5 w-full sm:w-auto shrink-0">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="number"
              placeholder="Days"
              value={boostConfig.daysLeft || ""}
              onChange={(e) =>
                setBoostConfig({ ...boostConfig, daysLeft: e.target.value })
              }
              className="bg-transparent border-none outline-none text-white text-[11px] font-mono w-12 placeholder:text-neutral-700"
            />
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">
              Left
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

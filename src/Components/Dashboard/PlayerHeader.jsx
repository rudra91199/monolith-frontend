import { Swords, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PlayerHeader({ playerData, thLevel, thImage, userRole }) {
  return (
    <div className="backdrop-blur-2xl bg-[#0a0a0c]/60 border border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.6)] rounded-4xl p-5 sm:p-8">
      
      {/* Top Row: Identity (Left) & TH (Right) */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <div className="inline-block px-3 py-1 mb-2 rounded-lg bg-black/60 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,1)]">
            <p className="text-[10px] text-neutral-400 font-mono tracking-widest">{playerData?.playerTag}</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide truncate w-full drop-shadow-md">
            {playerData?.name || "Chief"}
          </h1>
          <p className="text-[11px] text-amber-500 font-bold uppercase tracking-widest mt-1">{userRole}</p>
        </div>

        <div className="relative shrink-0 w-20 h-20 sm:w-28 sm:h-28">
          <div className="absolute inset-0 bg-blue-900/20 blur-[30px] rounded-full" />
          <img src={thImage} alt={`TH${thLevel}`} className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" />
          <div className="absolute -bottom-1 right-0 px-2 py-0.5 bg-black border border-white/10 rounded-full shadow-lg z-20">
             <span className="text-[10px] text-white font-mono font-bold tracking-wider">TH{thLevel}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
        <div className="flex items-center gap-2 bg-black/50 border border-white/[0.05] rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-white/[0.05]">
            <Swords className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5 truncate">Atk Won</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">{playerData?.attackWins || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/50 border border-white/[0.05] rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-white/[0.05]">
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5 truncate">Def Won</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">{playerData?.defenseWins || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-950/20 border border-green-900/30 rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-green-950/50 flex items-center justify-center shrink-0 border border-green-900/50">
            <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-green-500/70 font-bold mb-0.5 truncate">Donated</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">{playerData?.donations || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/30 rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-red-950/50 flex items-center justify-center shrink-0 border border-red-900/50">
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-red-500/70 font-bold mb-0.5 truncate">Received</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">{playerData?.donationsReceived || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
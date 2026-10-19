import { Swords, Shield, ArrowUpRight, ArrowDownRight, FileJson } from 'lucide-react';

export default function PlayerHeader({ playerData, previousData, thLevel, thImage, userRole, onSyncJson }) {
  const getDiff = (field) => {
    if (!previousData || previousData[field] === undefined || playerData?.[field] === undefined) return 0;
    return (playerData[field] || 0) - (previousData[field] || 0);
  };

  const atkDiff = getDiff('attackWins');
  const defDiff = getDiff('defenseWins');
  const donDiff = getDiff('donations');
  const recDiff = getDiff('donationsReceived');

  return (
    <div className="backdrop-blur-2xl bg-[#0a0a0c]/60 border border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.6)] rounded-4xl p-5 sm:p-8">
      
      {/* Top Row: Identity (Left) & TH (Right) */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-block px-3 py-1 rounded-lg bg-black/60 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,1)]">
              <p className="text-[10px] text-neutral-400 font-mono tracking-widest">{playerData?.playerTag}</p>
            </div>
            {onSyncJson && (
              <button
                onClick={onSyncJson}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-400 font-bold uppercase tracking-widest transition-colors"
              >
                <FileJson className="w-3 h-3" />
                <span>Sync Village JSON</span>
              </button>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide truncate w-full drop-shadow-md">
            {playerData?.name || "Chief"}
          </h1>
          <p className="text-[11px] text-amber-500 font-bold uppercase tracking-widest mt-1">
            {userRole?.replace('admin', 'Elder').replace('coLeader', 'Co-Leader')}
          </p>
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
            <p className="text-sm text-white font-mono font-bold leading-none truncate">
              {playerData?.attackWins || 0}
              {atkDiff > 0 && <span className="text-[10px] text-emerald-400 ml-1.5">+{atkDiff}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/50 border border-white/[0.05] rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-white/[0.05]">
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5 truncate">Def Won</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">
              {playerData?.defenseWins || 0}
              {defDiff > 0 && <span className="text-[10px] text-emerald-400 ml-1.5">+{defDiff}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-950/20 border border-green-900/30 rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-green-950/50 flex items-center justify-center shrink-0 border border-green-900/50">
            <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-green-500/70 font-bold mb-0.5 truncate">Donated</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">
              {playerData?.donations || 0}
              {donDiff > 0 && <span className="text-[10px] text-emerald-400 ml-1.5">+{donDiff}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/30 rounded-[1rem] p-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-red-950/50 flex items-center justify-center shrink-0 border border-red-900/50">
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[9px] uppercase tracking-widest text-red-500/70 font-bold mb-0.5 truncate">Received</p>
            <p className="text-sm text-white font-mono font-bold leading-none truncate">
              {playerData?.donationsReceived || 0}
              {recDiff > 0 && <span className="text-[10px] text-rose-400 ml-1.5">+{recDiff}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Flame } from 'lucide-react';

const formatCdnName = (name) => {
  if (name === 'L.A.S.S.I') return 'lassi';
  return name.toLowerCase().replace(/\s+/g, '_');
};

const getImageUrl = (category, name) => {
  const formatted = formatCdnName(name);
  if (category === 'equipment') return `https://assets.clashk.ing/equipment/${formatted}.webp`;
  if (category === 'spells') return `https://assets.clashk.ing/spells/${formatted}.webp`;
  if (category === 'pets') return `https://assets.clashk.ing/pets/${formatted}/icon.webp`;
  return `https://assets.clashk.ing/${category}/${formatted}/icon.webp`;
};

export default function ItemCard({ item, category, staticData, thLevel }) {
  let maxAtTh = item.maxLevel;
  if (staticData) {
    const nameKey = item.name;
    const searchCat = category === 'equipment' ? 'heroEquipment' : category;
    if (staticData[searchCat]?.[nameKey] && Array.isArray(staticData[searchCat][nameKey])) {
       maxAtTh = staticData[searchCat][nameKey][thLevel] || maxAtTh;
    } else if (staticData[nameKey] && Array.isArray(staticData[nameKey])) {
       maxAtTh = staticData[nameKey][thLevel] || maxAtTh;
    }
  }

  const isMaxed = item.level >= maxAtTh;
  const progressPercent = maxAtTh > 0 ? (item.level / maxAtTh) * 100 : 0;

  return (
    <div className="flex flex-col items-center p-2 sm:p-3 rounded-[1rem] backdrop-blur-md bg-[#0a0a0c]/60 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.6)] relative overflow-hidden hover:bg-[#121216]/80 transition-colors min-w-0">
      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mb-2 relative shrink-0">
        <img 
          src={getImageUrl(category, item.name)} 
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {isMaxed && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full border border-[#0a0a0c] flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-[#0a0a0c]" fill="currentColor" />
          </div>
        )}
      </div>
      <p className="text-[9px] sm:text-[10px] text-neutral-300 font-bold uppercase tracking-widest text-center truncate w-full mb-1.5 drop-shadow-md px-1">
        {item.name}
      </p>
      <div className="w-full px-1">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className={`text-[10px] sm:text-xs font-mono font-bold drop-shadow-md ${isMaxed ? 'text-amber-400' : 'text-white'}`}>{item.level}</span>
          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 drop-shadow-md">/{maxAtTh}</span>
        </div>
        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
          <div 
            className={`h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ${isMaxed ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`} 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
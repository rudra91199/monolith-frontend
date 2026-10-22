import ItemCard from './ItemCard';

export default function CategorySection({
  title,
  subtitle,
  icon,
  items,
  category,
  staticData,
  thLevel,
  boostConfig,
  prevMap,
  onSelect
}) {
  if (!items || items.length === 0) return null;
  const unlockedCount = items.filter((i) => !i.isLocked).length;

  return (
    <div className="backdrop-blur-3xl bg-gradient-to-b from-white/[0.04] to-black/35 sm:rounded-3xl p-0 sm:p-4 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_12px_35px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-md bg-black/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] p-1 flex items-center justify-center shrink-0">
            <img src={icon} alt={title} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
              {title}
            </h3>
            <p className="text-[9px] font-mono text-neutral-400 truncate">{subtitle}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-black/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-[9px] font-mono font-bold text-cyan-300 shrink-0">
          {unlockedCount}/{items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start ">
        {items.map((item) => (
          <ItemCard
            key={item.name}
            item={item}
            category={category}
            staticData={staticData}
            thLevel={thLevel}
            boostConfig={boostConfig}
            previousLevel={prevMap?.[item.name]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
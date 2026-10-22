import { CLASH_ICONS } from '../../utils/upgradeCalculator';

export function SingleStar({ className = 'w-4 h-4' }) {
  const starSrc = CLASH_ICONS.star || CLASH_ICONS.stars;
  return (
    <img
      src={starSrc}
      alt="Star"
      className={`${className} object-contain shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
    />
  );
}

export default function WarStars({ count = 0, size = 'w-4 h-4' }) {
  const starSrc = CLASH_ICONS.star || CLASH_ICONS.stars;
  const safeCount = Math.max(0, Math.min(3, Number(count) || 0));

  if (safeCount === 0) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-neutral-500">
        0 Stars
      </span>
    );
  }

  return (
    <div className="inline-flex items-center -space-x-1.5 shrink-0">
      {Array.from({ length: safeCount }).map((_, idx) => (
        <img
          key={idx}
          src={starSrc}
          alt="★"
          style={{ zIndex: idx + 1 }}
          className={`${size} object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] ${
            safeCount === 3 && idx === 1 ? '-translate-y-0.5 scale-110' : ''
          }`}
        />
      ))}
    </div>
  );
}
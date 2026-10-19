// Maps the user's UI selection to the exact Supercell discount mechanics
export const getDiscountMultipliers = (boostType) => {
  switch (boostType) {
    case "gold_pass_10":
      return { cost: 0.9, time: 0.9 };
    case "gold_pass_15":
      return { cost: 0.85, time: 0.85 };
    case "gold_pass_20":
      return { cost: 0.8, time: 0.8 };
    case "hammer_jam":
      return { cost: 0.5, time: 1.0 };
    case "re_engagement":
      return { cost: 0.5, time: 0.5 };
    default:
      return { cost: 1.0, time: 1.0 };
  }
};

// Converts raw API seconds into a clean "14d 12h" string
export const formatTime = (seconds) => {
  if (!seconds) return "0s";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 && d === 0) parts.push(`${m}m`);
  return parts.join(" ") || "< 1m";
};

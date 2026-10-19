export const getDiscountMultipliers = (boostType) => {
  switch (boostType) {
    case "gold_pass_10":
      return { cost: 0.9, time: 0.9 };
    case "gold_pass_15":
      return { cost: 0.85, time: 0.85 };
    case "gold_pass_20":
      return { cost: 0.8, time: 0.8 };
    case "hammer_jam":
      return { cost: 0.5, time: 0.5 };
    case "re_engagement":
      return { cost: 0.5, time: 0.5 };
    default:
      return { cost: 1.0, time: 1.0 };
  }
};

export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return "0s";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 && d < 10) parts.push(`${m}m`);
  if (d === 0 && h === 0 && s > 0) parts.push(`${s}s`);
  return parts.join(" ") || "< 1m";
};

export const formatCost = (num) => {
  if (!num || num <= 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
  return num.toLocaleString();
};

// Finds the static definition of an item in ClashKing's static_data.json
export const findStaticEntity = (staticData, category, item) => {
  if (!staticData || !item) return null;
  const searchCats =
    category === "equipment"
      ? ["equipment", "heroEquipment"]
      : category === "buildings"
      ? ["buildings", "traps"]
      : [category];

  const targetName = (item.name || "").toLowerCase().trim();
  const targetId = item.dataId || item.data;

  for (const cat of searchCats) {
    const bucket = staticData[cat];
    if (!bucket) continue;

    if (Array.isArray(bucket)) {
      const match = bucket.find(
        (entry) =>
          (targetId && (entry._id === targetId || entry.id === targetId)) ||
          (entry.name && entry.name.toLowerCase().trim() === targetName)
      );
      if (match) return match;
    } else if (typeof bucket === "object") {
      if (bucket[item.name]) return bucket[item.name];
      if (targetId && bucket[targetId]) return bucket[targetId];
      const key = Object.keys(bucket).find((k) => k.toLowerCase().trim() === targetName);
      if (key) return bucket[key];
    }
  }
  return null;
};

// Computes current max at TH, next level upgrade cost/time, and full remaining ETM table
export const analyzeItemUpgrade = (item, category, staticData, thLevel, boostConfig = { type: "none", daysLeft: "" }) => {
  const currentLevel = item.level ?? 0;
  const multipliers = getDiscountMultipliers(boostConfig?.type);
  const boostWindowSeconds = boostConfig?.daysLeft ? Number(boostConfig.daysLeft) * 86400 : Infinity;

  const entity = findStaticEntity(staticData, category, item);
  let maxAtTh = item.maxLevel || currentLevel || 1;
  let resource = entity?.upgrade_resource || "Resource";
  const remainingLevels = [];

  if (entity && Array.isArray(entity.levels)) {
    // Filter levels unlocked at or below player's Town Hall
    const thLevels = entity.levels.filter((l) => !l.required_townhall || l.required_townhall <= thLevel);
    if (thLevels.length > 0) {
      maxAtTh = Math.max(...thLevels.map((l) => l.level || 0));
    } else {
      maxAtTh = Math.max(...entity.levels.map((l) => l.level || 0));
    }

    let cumulativeSeconds = 0;

    entity.levels
      .filter((l) => l.level > currentLevel && l.level <= maxAtTh)
      .sort((a, b) => a.level - b.level)
      .forEach((lvlObj) => {
        const rawCost =
          lvlObj.build_cost ??
          lvlObj.upgrade_cost ??
          lvlObj.cost ??
          (typeof lvlObj.upgrade_cost === "object" ? lvlObj.upgrade_cost.shiny_ore || 0 : 0);
        const rawTime = lvlObj.build_time ?? lvlObj.upgrade_time ?? lvlObj.time ?? 0;

        // Apply boost if within the remaining boost window
        const isWithinBoostWindow = cumulativeSeconds < boostWindowSeconds;
        const effectiveCost = Math.round(rawCost * (isWithinBoostWindow ? multipliers.cost : 1));
        const effectiveTime = Math.round(rawTime * (isWithinBoostWindow ? multipliers.time : 1));

        cumulativeSeconds += effectiveTime;

        remainingLevels.push({
          level: lvlObj.level,
          rawCost,
          rawTime,
          cost: effectiveCost,
          time: effectiveTime,
          requiredTh: lvlObj.required_townhall || thLevel,
        });
      });
  } else if (entity && Array.isArray(entity)) {
    // Fallback if staticData[cat][name] is a simple TH -> maxLevel array
    maxAtTh = entity[thLevel] || item.maxLevel || currentLevel;
  }

  const isMaxed = currentLevel >= maxAtTh;
  const nextUpgrade = remainingLevels[0] || null;
  const totalCostToMax = remainingLevels.reduce((sum, l) => sum + l.cost, 0);
  const totalTimeToMax = remainingLevels.reduce((sum, l) => sum + l.time, 0);

  return {
    currentLevel,
    maxAtTh,
    isMaxed,
    resource,
    nextUpgrade,
    remainingLevels,
    totalCostToMax,
    totalTimeToMax,
  };
};

// Calculates live remaining time for active builders from the uploaded JSON timestamp
export const getActiveBuilders = (buildingData, nowMs = Date.now()) => {
  if (!buildingData?.buildings) return [];
  const uploadSec = buildingData.uploadTimestamp || Math.floor(nowMs / 1000);
  const elapsedSec = Math.max(0, Math.floor(nowMs / 1000) - uploadSec);

  const active = [];
  buildingData.buildings.forEach((b, idx) => {
    if (b.timer && b.timer > 0) {
      const remaining = Math.max(0, b.timer - elapsedSec);
      if (remaining > 0) {
        active.push({
          id: `${b.dataId}-${idx}`,
          name: b.name,
          currentLevel: b.level,
          targetLevel: (b.level || 0) + 1,
          remainingSeconds: remaining,
          totalTimer: b.timer,
        });
      }
    }
  });

  return active.sort((a, b) => a.remainingSeconds - b.remainingSeconds);
};
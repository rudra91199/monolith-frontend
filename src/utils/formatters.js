export const FALLBACK_BUILDING_ID_NAMES = {
  1000000: 'Army Camp',
  1000001: 'Town Hall',
  1000002: 'Elixir Collector',
  1000003: 'Elixir Storage',
  1000004: 'Gold Mine',
  1000005: 'Gold Storage',
  1000006: 'Barracks',
  1000007: 'Laboratory',
  1000008: 'Cannon',
  1000009: 'Archer Tower',
  1000010: 'Wall',
  1000011: 'Wizard Tower',
  1000012: 'Air Defense',
  1000013: 'Mortar',
  1000014: 'Clan Castle',
  1000015: "Builder's Hut",
  1000019: 'Hidden Tesla',
  1000020: 'Spell Factory',
  1000021: 'X-Bow',
  1000023: 'Dark Elixir Drill',
  1000024: 'Dark Elixir Storage',
  1000026: 'Dark Barracks',
  1000027: 'Inferno Tower',
  1000028: 'Air Sweeper',
  1000029: 'Dark Spell Factory',
  1000031: 'Eagle Artillery',
  1000032: 'Bomb Tower',
  1000059: 'Workshop',
  1000064: "B.O.B's Hut",
  1000067: 'Scattershot',
  1000068: 'Pet House',
  1000070: 'Blacksmith',
  1000071: 'Hero Hall',
  1000072: 'Spell Tower',
  1000077: 'Monolith',
  1000079: 'Multi-Gear Tower',
  1000084: 'Multi-Archer Tower',
  1000085: 'Ricochet Cannon',
  1000089: 'Firespitter',
  1000090: 'Super Wizard Tower',
  1000093: 'Helper Hut'
};

export const FALLBACK_TRAP_ID_NAMES = {
  12000000: 'Bomb',
  12000001: 'Spring Trap',
  12000002: 'Giant Bomb',
  12000005: 'Air Bomb',
  12000006: 'Seeking Air Mine',
  12000008: 'Skeleton Trap',
  12000016: 'Tornado Trap',
  12000020: 'Giga Bomb'
};

export const getDiscountMultipliers = (boostType) => {
  switch (boostType) {
    case 'gold_pass_10':
      return { cost: 0.9, time: 0.9 };
    case 'gold_pass_15':
      return { cost: 0.85, time: 0.85 };
    case 'gold_pass_20':
      return { cost: 0.8, time: 0.8 };
    case 'hammer_jam':
      return { cost: 0.5, time: 0.5 };
    case 're_engagement':
      return { cost: 0.5, time: 0.5 };
    default:
      return { cost: 1.0, time: 1.0 };
  }
};

export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 && d < 10) parts.push(`${m}m`);
  if (d === 0 && h === 0 && s > 0) parts.push(`${s}s`);
  return parts.join(' ') || '< 1m';
};

export const formatCost = (num) => {
  if (!num || num <= 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
  return num.toLocaleString();
};

export const findStaticEntity = (staticData, category, item) => {
  if (!item) return null;
  const targetId = Number(item.dataId || item.data || item._id || item.id || 0);
  const fallbackName =
    (category === 'buildings' || category === 'traps') && targetId
      ? FALLBACK_BUILDING_ID_NAMES[targetId] || FALLBACK_TRAP_ID_NAMES[targetId]
      : null;
  const rawName =
    item.name && !item.name.startsWith('Unknown ') ? item.name : fallbackName || item.name || '';
  const targetName = rawName.toLowerCase().trim();

  if (staticData) {
    const isTrapItem =
      item.isTrap ||
      category === 'traps' ||
      (targetId >= 12000000 && targetId < 13000000) ||
      Boolean(FALLBACK_TRAP_ID_NAMES[targetId]);

    const searchCats =
      category === 'equipment'
        ? ['equipment', 'heroEquipment']
        : isTrapItem
        ? ['traps', 'buildings']
        : category === 'buildings'
        ? ['buildings', 'traps']
        : [category];

    for (const cat of searchCats) {
      const bucket = staticData[cat];
      if (!bucket) continue;

      if (Array.isArray(bucket)) {
        if (targetId) {
          const idMatch = bucket.find((entry) => Number(entry._id || entry.id) === targetId);
          if (idMatch) return idMatch;
        }
        if (targetName) {
          const nameMatch = bucket.find(
            (entry) => entry.name && entry.name.toLowerCase().trim() === targetName
          );
          if (nameMatch) return nameMatch;
        }
      } else if (typeof bucket === 'object') {
        if (targetId && bucket[targetId]) return bucket[targetId];
        if (rawName && bucket[rawName]) return bucket[rawName];
        const key = Object.keys(bucket).find((k) => k.toLowerCase().trim() === targetName);
        if (key) return bucket[key];
      }
    }

    // Fallback for brand-new Equipment: inherit Epic (27) or Common (18) Ore table
    if (category === 'equipment') {
      const equipBucket = staticData.equipment || staticData.heroEquipment;
      if (Array.isArray(equipBucket)) {
        const isEpic = item.rarity === 'Epic' || Number(item.maxLevel) === 27;
        const template = equipBucket.find((e) =>
          isEpic
            ? e.rarity === 'Epic' || e.levels?.length === 27
            : e.rarity === 'Common' || e.levels?.length === 18
        );
        if (template) {
          return {
            ...template,
            name: rawName || item.name,
            hero: item.hero,
            rarity: isEpic ? 'Epic' : 'Common'
          };
        }
      }
    }
  }

  // Fallback for single-level huts (B.O.B's Hut, Helper Hut) or unmapped buildings/traps
  if ((category === 'buildings' || category === 'traps') && fallbackName) {
    return {
      _id: targetId,
      name: fallbackName,
      upgrade_resource: 'Gold',
      levels: [{ level: Math.max(1, item.level || 1), build_cost: 0, build_time: 0 }]
    };
  }

  return null;
};
import {
  findStaticEntity,
  FALLBACK_BUILDING_ID_NAMES,
  FALLBACK_TRAP_ID_NAMES
} from './formatters';

const getStaticBucketArray = (staticData, category) => {
  if (!staticData) return [];
  const key = category === 'equipment' && !staticData.equipment ? 'heroEquipment' : category;
  const bucket = staticData[key];
  if (!bucket) return [];
  if (Array.isArray(bucket)) return bucket;
  if (typeof bucket === 'object') return Object.values(bucket);
  return [];
};

export const getUserBuildingLevelsMap = (buildingData, staticData) => {
  const map = {};
  if (!buildingData?.buildings) return map;

  buildingData.buildings.forEach((b) => {
    const entity = findStaticEntity(staticData, 'buildings', b);
    const resolvedName = (
      entity?.name ||
      FALLBACK_BUILDING_ID_NAMES[b.dataId] ||
      b.name ||
      ''
    ).trim();
    if (!resolvedName) return;
    if (!map[resolvedName] || b.level > map[resolvedName]) {
      map[resolvedName] = b.level;
    }
  });
  return map;
};

const ARMY_STRUCTURE_NAMES = new Set([
  'army camp',
  'barracks',
  'dark barracks',
  'laboratory',
  'spell factory',
  'dark spell factory',
  'workshop',
  'blacksmith',
  'hero hall',
  'hero tavern',
  'pet house',
  'clan castle',
  'helper hut',
  "b.o.b's hut"
]);

const RESOURCE_STRUCTURE_NAMES = new Set([
  'gold mine',
  'gold storage',
  'elixir collector',
  'elixir storage',
  'dark elixir drill',
  'dark elixir storage'
]);

const TRAP_NAMES = new Set([
  'bomb',
  'spring trap',
  'giant bomb',
  'air bomb',
  'seeking air mine',
  'skeleton trap',
  'tornado trap',
  'giga bomb'
]);

export const getStructureSubCategory = (item) => {
  if (!item) return 'Defense';
  const id = Number(item.dataId || item.data || item._id || item.id || 0);
  const normName = (item.name || '').toLowerCase().trim();

  if (
    item.isTrap ||
    item.structureType === 'Traps' ||
    (id >= 12000000 && id < 13000000) ||
    Boolean(FALLBACK_TRAP_ID_NAMES[id]) ||
    TRAP_NAMES.has(normName)
  ) {
    return 'Traps';
  }

  if (ARMY_STRUCTURE_NAMES.has(normName)) {
    return 'Army';
  }

  if (RESOURCE_STRUCTURE_NAMES.has(normName)) {
    return 'Resources';
  }

  return 'Defense';
};

// Town Hall Building Limits for Merged Defenses & Key Structures
const getRequiredStructureLimits = (thLevel) => {
  const rules = [
    {
      dataId: 1000070,
      name: 'Blacksmith',
      minTh: 8,
      getLimit: (th) => (th >= 8 ? 1 : 0),
      unlockHint: 'Unlocks Hero Equipment at TH8'
    },
    {
      dataId: 1000093,
      name: 'Helper Hut',
      minTh: 9,
      getLimit: (th) => (th >= 9 ? 1 : 0),
      unlockHint: "Houses Builder's Apprentice & Lab Assistant"
    },
    {
      dataId: 1000068,
      name: 'Pet House',
      minTh: 14,
      getLimit: (th) => (th >= 14 ? 1 : 0),
      unlockHint: 'Unlocks Hero Pets at TH14'
    },
    {
      dataId: 1000072,
      name: 'Spell Tower',
      minTh: 15,
      getLimit: (th) => (th >= 15 ? 2 : 0),
      unlockHint: 'Defensive Spell Tower (TH15)'
    },
    {
      dataId: 1000077,
      name: 'Monolith',
      minTh: 15,
      getLimit: (th) => (th >= 15 ? 1 : 0),
      unlockHint: 'Dark Elixir Signature Defense (TH15)'
    },
    {
      dataId: 1000084,
      name: 'Multi-Archer Tower',
      minTh: 16,
      getLimit: (th) => (th >= 17 ? 3 : th === 16 ? 2 : 0),
      unlockHint: 'Merge 2 Maxed Archer Towers (Lv.21)'
    },
    {
      dataId: 1000085,
      name: 'Ricochet Cannon',
      minTh: 16,
      getLimit: (th) => (th >= 17 ? 3 : th === 16 ? 2 : 0),
      unlockHint: 'Merge 2 Maxed Cannons (Lv.21)'
    },
    {
      dataId: 1000079,
      name: 'Multi-Gear Tower',
      minTh: 17,
      getLimit: (th) => (th >= 17 ? 1 : 0),
      unlockHint: 'Merge Geared-Up Archer Tower & Geared-Up Cannon'
    },
    {
      dataId: 1000089,
      name: 'Firespitter',
      minTh: 17,
      getLimit: (th) => (th >= 17 ? 2 : 0),
      unlockHint: 'Signature Cone Defense (TH17)'
    },
    {
      dataId: 1000090,
      name: 'Super Wizard Tower',
      minTh: 18,
      getLimit: (th) => (th >= 18 ? 2 : 0),
      unlockHint: 'Merge 2 Maxed Wizard Towers (TH18)'
    }
  ];

  return rules
    .map((r) => ({ ...r, allowedCount: r.getLimit(thLevel) }))
    .filter((r) => r.allowedCount > 0);
};

// Compares placed buildings & traps against TH limits and places unplaced/locked cards LAST
export const buildMergedStructuresCatalog = (
  placedBuildings = [],
  placedTraps = [],
  staticData = null,
  thLevel = 1
) => {
  if ((!placedBuildings || placedBuildings.length === 0) && (!placedTraps || placedTraps.length === 0)) {
    return [];
  }

  const resolvedPlaced = (placedBuildings || [])
    .filter((b) => b.dataId !== 1000097)
    .map((b) => {
      const entity = findStaticEntity(staticData, 'buildings', b);
      const trueName =
        entity?.name || FALLBACK_BUILDING_ID_NAMES[b.dataId] || b.name || `Structure #${b.dataId}`;
      const itemObj = {
        ...b,
        name: trueName,
        isTrap: false,
        isLocked: false
      };
      return {
        ...itemObj,
        structureType: getStructureSubCategory(itemObj)
      };
    });

  const resolvedTraps = (placedTraps || []).map((t) => {
    const entity = findStaticEntity(staticData, 'traps', { ...t, isTrap: true });
    const trueName =
      entity?.name || FALLBACK_TRAP_ID_NAMES[t.dataId] || t.name || `Trap #${t.dataId}`;
    return {
      ...t,
      name: trueName,
      isTrap: true,
      isLocked: false,
      upgradeResource: entity?.upgrade_resource || 'Gold',
      structureType: 'Traps'
    };
  });

  // Also check if staticData.traps has any Home Village traps unlocked at thLevel that aren't placed yet
  const placedTrapIds = new Set(resolvedTraps.map((t) => Number(t.dataId)));
  const placedTrapNames = new Set(resolvedTraps.map((t) => (t.name || '').toLowerCase().trim()));
  const unplacedTrapCards = [];

  const staticTrapsList = getStaticBucketArray(staticData, 'traps');
  staticTrapsList.forEach((st) => {
    if (!st || !st.name) return;
    if (st.village && st.village !== 'home') return;
    const stId = Number(st._id ?? st.id ?? 0);
    const normName = st.name.toLowerCase().trim();
    const firstLvl = Array.isArray(st.levels) && st.levels.length > 0 ? st.levels[0] : null;
    const reqTh = firstLvl?.required_townhall ?? st.required_townhall ?? 1;

    if (reqTh <= thLevel && !placedTrapIds.has(stId) && !placedTrapNames.has(normName)) {
      const maxLvl = Array.isArray(st.levels)
        ? Math.max(...st.levels.map((l) => Number(l.level) || 1))
        : 1;
      unplacedTrapCards.push({
        dataId: stId,
        name: st.name,
        level: 0,
        maxLevel: maxLvl,
        count: 1,
        timer: 0,
        isTrap: true,
        isLocked: true,
        structureType: 'Traps',
        unlockBuilding: 'Town Hall',
        unlockBuildingLevel: reqTh,
        unlockHallLevel: reqTh,
        unlockRequirementText: `Unplaced Trap (Unlocks at TH${reqTh})`
      });
    }
  });

  // Count how many of each building are currently placed in the village
  const placedCountsByName = {};
  const placedCountsById = {};

  resolvedPlaced.forEach((b) => {
    const c = b.count || 1;
    const norm = (b.name || '').toLowerCase().trim();
    placedCountsByName[norm] = (placedCountsByName[norm] || 0) + c;
    if (b.dataId) {
      placedCountsById[b.dataId] = (placedCountsById[b.dataId] || 0) + c;
    }
  });

  const unplacedLockedCards = [];
  const limitRules = getRequiredStructureLimits(thLevel);

  limitRules.forEach((rule) => {
    const normName = rule.name.toLowerCase().trim();
    const placedCount = Math.max(
      placedCountsById[rule.dataId] || 0,
      placedCountsByName[normName] || 0
    );

    if (placedCount < rule.allowedCount) {
      const missingCount = rule.allowedCount - placedCount;
      const staticEntity = findStaticEntity(staticData, 'buildings', {
        dataId: rule.dataId,
        name: rule.name
      });
      const maxLvl = Array.isArray(staticEntity?.levels)
        ? Math.max(...staticEntity.levels.map((l) => Number(l.level) || 1))
        : 1;

      const lockedItem = {
        dataId: rule.dataId,
        name: rule.name,
        level: 0,
        maxLevel: maxLvl,
        count: missingCount,
        timer: 0,
        isTrap: false,
        isLocked: true,
        unlockBuilding: `Town Hall`,
        unlockBuildingLevel: rule.minTh,
        unlockHallLevel: rule.minTh,
        unlockRequirementText: `${missingCount} of ${rule.allowedCount} Not Built (Placed: ${placedCount}/${rule.allowedCount}) • ${rule.unlockHint}`
      };

      unplacedLockedCards.push({
        ...lockedItem,
        structureType: getStructureSubCategory(lockedItem)
      });
    }
  });

  // Show placed buildings and traps first, and unplaced/to-unlock structures LAST
  return [...resolvedPlaced, ...resolvedTraps, ...unplacedLockedCards, ...unplacedTrapCards];
};

const EQUIPMENT_HERO_MAP = {
  'portal pendant': 'Minion Prince',
  'dark crown': 'Minion Prince',
  'meteor staff': 'Minion Prince',
  'dark orb': 'Minion Prince',
  'henchmen puppet': 'Minion Prince',
  'metal pants': 'Minion Prince',
  'noble iron': 'Minion Prince',
  'snake bracelet': 'Barbarian King',
  'spiky ball': 'Barbarian King',
  'giant gauntlet': 'Barbarian King',
  'action figure': 'Archer Queen',
  'magic mirror': 'Archer Queen',
  'frozen arrow': 'Archer Queen',
  'heroic torch': 'Grand Warden',
  'lavaloon puppet': 'Grand Warden',
  'fireball': 'Grand Warden',
  'frost flake': 'Royal Champion',
  'electro boots': 'Royal Champion',
  'rocket spear': 'Royal Champion',
  'fire heart': 'Dragon Duke',
  'flame blower': 'Dragon Duke',
  'stun blaster': 'Dragon Duke',
  'electro fangs': 'Dragon Duke',
  'rocket backpack': 'Dragon Duke',
  'revenge deck': 'Dragon Duke'
};

export const buildMergedCategoryCatalog = (
  category,
  playerItems = [],
  staticData = null,
  buildingData = null
) => {
  const buildingLevels = getUserBuildingLevelsMap(buildingData, staticData);
  const staticList = getStaticBucketArray(staticData, category);

  const ownedByName = new Map();
  const ownedById = new Map();
  const superTroopNames = new Set();

  playerItems.forEach((item) => {
    const normName = (item.name || '').toLowerCase().trim();
    if (item.originalName || item.boostable === true) {
      superTroopNames.add(normName);
      return;
    }
    if (item.seasonal === true) return;
    if (normName) ownedByName.set(normName, item);
    if (item.id !== undefined && item.id !== null) ownedById.set(Number(item.id), item);
  });

  const merged = [];
  const handledNames = new Set();

  staticList.forEach((st) => {
    if (!st || typeof st !== 'object' || !st.name) return;
    if (st.village && st.village !== 'home') return;

    const normName = st.name.toLowerCase().trim();
    const stId = Number(st._id ?? st.id);
    const owned = (stId ? ownedById.get(stId) : null) || ownedByName.get(normName);

    if (st.is_seasonal === true || st.seasonal === true || owned?.seasonal === true) return;
    if (
      category === 'troops' &&
      (st.super_troop ||
        st.is_super_troop ||
        st.original_troop ||
        superTroopNames.has(normName) ||
        owned?.originalName ||
        owned?.boostable === true)
    ) {
      return;
    }

    const firstLevelObj = Array.isArray(st.levels) && st.levels.length > 0 ? st.levels[0] : null;

    let unlockBuilding =
      owned?.unlockBuilding ||
      st.production_building ||
      (category === 'heroes'
        ? 'Hero Hall'
        : category === 'pets'
        ? 'Pet House'
        : category === 'equipment'
        ? 'Blacksmith'
        : null);

    if (unlockBuilding === 'Hero Tavern') unlockBuilding = 'Hero Hall';

    if (category === 'troops' && !['Barracks', 'Dark Barracks', 'Workshop'].includes(unlockBuilding)) {
      return;
    }
    if (category === 'spells' && !['Spell Factory', 'Dark Spell Factory'].includes(unlockBuilding)) {
      return;
    }

    const unlockBuildingLevel =
      owned?.unlockBuildingLevel ??
      st.production_building_level ??
      firstLevelObj?.required_hero_tavern_level ??
      firstLevelObj?.required_pet_house_level ??
      firstLevelObj?.required_blacksmith_level ??
      firstLevelObj?.required_lab_level ??
      1;

    if ((category === 'troops' || category === 'spells') && (!unlockBuildingLevel || unlockBuildingLevel <= 0)) {
      return;
    }

    const unlockHallLevel =
      owned?.unlockHallLevel ?? firstLevelObj?.required_townhall ?? st.required_townhall ?? 1;

    const maxStaticLevel = Array.isArray(st.levels)
      ? Math.max(...st.levels.map((l) => Number(l.level) || 0))
      : owned?.maxLevel || 1;

    const isLocked = !owned || (owned.level ?? 0) <= 0;
    const userBldLvl =
      buildingLevels[unlockBuilding] ??
      (unlockBuilding === 'Hero Hall'
        ? buildingLevels['Hero Hall'] ?? buildingLevels['Hero Tavern']
        : null) ??
      null;

    const rarity = st.rarity || owned?.rarity || (maxStaticLevel >= 27 ? 'Epic' : 'Common');
    const hero = st.hero || owned?.hero || EQUIPMENT_HERO_MAP[normName] || 'Hero';

    let unlockRequirementText = `Upgrade ${unlockBuilding} to Lv.${unlockBuildingLevel} (TH${unlockHallLevel})`;
    if (category === 'equipment') {
      if (rarity === 'Epic') {
        unlockRequirementText = `Buy from Trader Shop (1,500 Gems) or Medal Event`;
      } else {
        unlockRequirementText = `Upgrade Blacksmith to Lv.${unlockBuildingLevel} (Requires TH${unlockHallLevel})`;
      }
    } else if (category === 'heroes') {
      unlockRequirementText = `Upgrade Hero Hall to Lv.${unlockBuildingLevel} (Requires TH${unlockHallLevel})`;
    }

    handledNames.add(normName);

    merged.push({
      ...(owned || {}),
      _id: st._id ?? st.id ?? owned?.id,
      name: st.name,
      level: isLocked ? 0 : owned.level,
      maxLevel: maxStaticLevel,
      isLocked,
      hero,
      rarity,
      unlockBuilding,
      unlockBuildingLevel: Number(unlockBuildingLevel) || 1,
      unlockHallLevel: Number(unlockHallLevel) || 1,
      upgradeResource:
        owned?.upgradeResource ||
        st.upgrade_resource ||
        (unlockBuilding === 'Dark Barracks' || unlockBuilding === 'Dark Spell Factory' || category === 'pets'
          ? 'Dark Elixir'
          : 'Elixir'),
      userBuildingLevel: userBldLvl,
      unlockRequirementText
    });
  });

  playerItems.forEach((owned) => {
    const normName = (owned.name || '').toLowerCase().trim();
    if (!normName || handledNames.has(normName)) return;
    if (owned.seasonal === true || owned.originalName || owned.boostable === true) return;
    if (owned.village && owned.village !== 'home') return;

    const unlockBuilding =
      owned.unlockBuilding ||
      (category === 'heroes'
        ? 'Hero Hall'
        : category === 'pets'
        ? 'Pet House'
        : category === 'equipment'
        ? 'Blacksmith'
        : category === 'spells'
        ? 'Spell Factory'
        : 'Barracks');

    const unlockBuildingLevel = Number(owned.unlockBuildingLevel) || 1;
    const unlockHallLevel = Number(owned.unlockHallLevel) || (category === 'equipment' ? 8 : 1);
    const isEpic = owned.rarity === 'Epic' || Number(owned.maxLevel) === 27;
    const rarity = isEpic ? 'Epic' : 'Common';
    const hero = owned.hero || EQUIPMENT_HERO_MAP[normName] || 'Minion Prince';

    merged.push({
      ...owned,
      isLocked: (owned.level ?? 0) <= 0,
      hero,
      rarity,
      unlockBuilding,
      unlockBuildingLevel,
      unlockHallLevel,
      userBuildingLevel: buildingLevels[unlockBuilding] || null,
      unlockRequirementText:
        category === 'equipment' && isEpic
          ? `Buy from Trader Shop (1,500 Gems) or Medal Event`
          : `Upgrade ${unlockBuilding} to Lv.${unlockBuildingLevel} (TH${unlockHallLevel})`
    });
  });

  const buildingOrderRank = {
    Barracks: 1,
    'Dark Barracks': 2,
    Workshop: 3,
    'Spell Factory': 1,
    'Dark Spell Factory': 2,
    'Hero Hall': 1,
    'Pet House': 1,
    Blacksmith: 1
  };

  return merged.sort((a, b) => {
    const groupA = buildingOrderRank[a.unlockBuilding] || 99;
    const groupB = buildingOrderRank[b.unlockBuilding] || 99;
    if (groupA !== groupB) return groupA - groupB;

    if (category === 'equipment' && a.rarity !== b.rarity) {
      return a.rarity === 'Common' ? -1 : 1;
    }

    if ((a.unlockBuildingLevel || 0) !== (b.unlockBuildingLevel || 0)) {
      return (a.unlockBuildingLevel || 0) - (b.unlockBuildingLevel || 0);
    }
    if ((a.unlockHallLevel || 0) !== (b.unlockHallLevel || 0)) {
      return (a.unlockHallLevel || 0) - (b.unlockHallLevel || 0);
    }
    return (a._id || 0) - (b._id || 0);
  });
};
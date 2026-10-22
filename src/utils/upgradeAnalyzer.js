import { getResourceIcon } from './clashIcons';
import { getDiscountMultipliers, findStaticEntity } from './formatters';

const extractLevelTransition = (levelsArray, targetLevel, isEquipment) => {
  const currObj = levelsArray.find((l) => Number(l.level) === Number(targetLevel));
  const prevObj = levelsArray.find((l) => Number(l.level) === Number(targetLevel) - 1);

  if (isEquipment) {
    const currOres = currObj?.upgrade_cost;
    const prevOres = prevObj?.upgrade_cost;
    const currSum =
      typeof currOres === 'object' && currOres
        ? (currOres.shiny_ore || 0) + (currOres.glowy_ore || 0) + (currOres.starry_ore || 0)
        : 0;
    const prevSum =
      typeof prevOres === 'object' && prevOres
        ? (prevOres.shiny_ore || 0) + (prevOres.glowy_ore || 0) + (prevOres.starry_ore || 0)
        : 0;

    const lvl1Obj = levelsArray.find((l) => Number(l.level) === 1);
    const lvl1HasCost =
      typeof lvl1Obj?.upgrade_cost === 'object' &&
      ((lvl1Obj.upgrade_cost.shiny_ore || 0) > 0 ||
        (lvl1Obj.upgrade_cost.glowy_ore || 0) > 0 ||
        (lvl1Obj.upgrade_cost.starry_ore || 0) > 0);

    const sourceOres =
      (lvl1HasCost && prevSum > 0) || (currSum === 0 && prevSum > 0) ? prevOres : currOres;

    return {
      ores: {
        shiny_ore: sourceOres?.shiny_ore || 0,
        glowy_ore: sourceOres?.glowy_ore || 0,
        starry_ore: sourceOres?.starry_ore || 0
      },
      rawCost: 0,
      rawTime: 0,
      requiredTh: currObj?.required_townhall || prevObj?.required_townhall || 1
    };
  }

  const getRawCost = (obj) =>
    obj ? Number(obj.build_cost ?? obj.upgrade_cost ?? obj.cost ?? 0) : 0;
  const getRawTime = (obj) =>
    obj ? Number(obj.build_time ?? obj.upgrade_time ?? obj.time ?? 0) : 0;

  const maxLvlInEntity = Math.max(...levelsArray.map((l) => Number(l.level) || 0));
  const maxLvlObj = levelsArray.find((l) => Number(l.level) === maxLvlInEntity);
  const usesShiftedTier = maxLvlObj && getRawCost(maxLvlObj) === 0 && levelsArray.length > 1;

  let rawCost = getRawCost(currObj);
  let rawTime = getRawTime(currObj);

  if ((usesShiftedTier || rawCost === 0) && prevObj && getRawCost(prevObj) > 0) {
    rawCost = getRawCost(prevObj);
    rawTime = getRawTime(prevObj);
  }

  return {
    ores: null,
    rawCost,
    rawTime,
    requiredTh: currObj?.required_townhall || prevObj?.required_townhall || 1
  };
};

export const analyzeItemUpgrade = (
  item,
  category,
  staticData,
  thLevel,
  boostConfig = { type: 'none', daysLeft: '' }
) => {
  const isLocked = Boolean(item.isLocked || (item.level ?? 0) <= 0);
  const currentLevel = isLocked ? 0 : item.level ?? 1;
  const isEquipment = category === 'equipment';
  const multipliers = isEquipment ? { cost: 1, time: 1 } : getDiscountMultipliers(boostConfig?.type);
  const boostWindowSeconds = boostConfig?.daysLeft ? Number(boostConfig.daysLeft) * 86400 : Infinity;

  const entity = findStaticEntity(staticData, category, item);
  const resolvedName = entity?.name || item.name || `Structure #${item.dataId}`;
  const upgradeResource =
    item.upgradeResource ||
    entity?.upgrade_resource ||
    (category === 'heroes' ||
    category === 'pets' ||
    item.unlockBuilding === 'Dark Barracks' ||
    item.unlockBuilding === 'Dark Spell Factory'
      ? 'Dark Elixir'
      : category === 'troops' || category === 'spells'
      ? 'Elixir'
      : 'Gold');

  let maxAtTh = item.hallMaxLevel || item.maxLevel || Math.max(1, currentLevel);
  const remainingLevels = [];
  const totalOresToMax = { shiny_ore: 0, glowy_ore: 0, starry_ore: 0 };
  let maxTierUpgrade = null;

  if (entity && Array.isArray(entity.levels) && entity.levels.length > 0) {
    const thLevels = entity.levels.filter(
      (l) => !l.required_townhall || l.required_townhall <= thLevel
    );
    if (thLevels.length > 0) {
      maxAtTh = Math.max(...thLevels.map((l) => Number(l.level) || 0));
    } else {
      maxAtTh = Math.max(...entity.levels.map((l) => Number(l.level) || 0));
    }

    let cumulativeSeconds = 0;

    for (let targetLvl = currentLevel + 1; targetLvl <= maxAtTh; targetLvl++) {
      const transition = extractLevelTransition(entity.levels, targetLvl, isEquipment);

      if (isEquipment && transition.ores) {
        totalOresToMax.shiny_ore += transition.ores.shiny_ore;
        totalOresToMax.glowy_ore += transition.ores.glowy_ore;
        totalOresToMax.starry_ore += transition.ores.starry_ore;

        remainingLevels.push({
          fromLevel: targetLvl - 1,
          level: targetLvl,
          ores: transition.ores,
          cost: 0,
          time: 0,
          requiredTh: transition.requiredTh
        });
      } else {
        const isWithinBoostWindow = cumulativeSeconds < boostWindowSeconds;
        const effectiveCost = Math.round(
          transition.rawCost * (isWithinBoostWindow ? multipliers.cost : 1)
        );
        const effectiveTime = Math.round(
          transition.rawTime * (isWithinBoostWindow ? multipliers.time : 1)
        );

        cumulativeSeconds += effectiveTime;

        remainingLevels.push({
          fromLevel: targetLvl - 1,
          level: targetLvl,
          rawCost: transition.rawCost,
          rawTime: transition.rawTime,
          cost: effectiveCost,
          time: effectiveTime,
          requiredTh: transition.requiredTh
        });
      }
    }

    const finalTransition = extractLevelTransition(entity.levels, maxAtTh, isEquipment);
    maxTierUpgrade = {
      fromLevel: Math.max(1, maxAtTh - 1),
      level: maxAtTh,
      ores: finalTransition.ores,
      cost: Math.round(finalTransition.rawCost * multipliers.cost),
      time: Math.round(finalTransition.rawTime * multipliers.time)
    };
  } else if (item.upgradeCost || item.upgradeTime) {
    const cost = Math.round((item.upgradeCost || 0) * multipliers.cost);
    const time = Math.round((item.upgradeTime || 0) * multipliers.time);
    if (currentLevel < maxAtTh) {
      remainingLevels.push({
        fromLevel: currentLevel,
        level: currentLevel + 1,
        rawCost: item.upgradeCost || 0,
        rawTime: item.upgradeTime || 0,
        cost,
        time,
        requiredTh: thLevel
      });
    }
    maxTierUpgrade = {
      fromLevel: Math.max(1, maxAtTh - 1),
      level: maxAtTh,
      cost,
      time
    };
  }

  const isMaxed = !isLocked && currentLevel >= maxAtTh;
  const nextUpgrade = remainingLevels[0] || null;
  const totalCostToMax = remainingLevels.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalTimeToMax = remainingLevels.reduce((sum, l) => sum + (l.time || 0), 0);

  return {
    resolvedName,
    currentLevel,
    maxAtTh,
    isLocked,
    isMaxed,
    isEquipment,
    resource: upgradeResource,
    resourceIcon: getResourceIcon(upgradeResource),
    nextUpgrade,
    maxTierUpgrade,
    remainingLevels,
    totalCostToMax,
    totalTimeToMax,
    totalOresToMax,
    unlockRequirementText: item.unlockRequirementText || null,
    unlockBuilding: item.unlockBuilding || null,
    unlockBuildingLevel: item.unlockBuildingLevel || null,
    unlockHallLevel: item.unlockHallLevel || null,
    userBuildingLevel: item.userBuildingLevel ?? null
  };
};
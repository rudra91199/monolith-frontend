import { findStaticEntity } from './formatters';

const FALLBACK_HERO_IDS = {
  28000000: 'Barbarian King',
  28000001: 'Archer Queen',
  28000002: 'Grand Warden',
  28000004: 'Royal Champion',
  28000006: 'Minion Prince',
  28000007: 'Dragon Duke'
};

export const getActiveBuilders = (buildingData, staticData = null, nowMs = Date.now()) => {
  if (!buildingData) return [];
  const uploadSec = buildingData.uploadTimestamp || Math.floor(nowMs / 1000);
  const elapsedSec = Math.max(0, Math.floor(nowMs / 1000) - uploadSec);

  const active = [];

  const scanList = (list = [], category = 'buildings') => {
    list.forEach((item, idx) => {
      if (item.timer && item.timer > 0) {
        const remaining = Math.max(0, item.timer - elapsedSec);
        if (remaining > 0) {
          const entity = findStaticEntity(staticData, category, item);
          const resolvedName =
            entity?.name ||
            FALLBACK_HERO_IDS[item.dataId] ||
            item.name ||
            `Upgrade #${item.dataId}`;

          const copies = item.count || 1;
          for (let c = 0; c < copies; c++) {
            active.push({
              id: `${category}-${item.dataId}-${idx}-${c}`,
              category: category === 'heroes' ? 'heroes' : 'buildings',
              name: resolvedName,
              currentLevel: item.level,
              targetLevel: (item.level || 0) + 1,
              remainingSeconds: remaining,
              totalTimer: item.timer
            });
          }
        }
      }
    });
  };

  scanList(buildingData.buildings, 'buildings');
  scanList(buildingData.traps, 'buildings');
  scanList(buildingData.heroes, 'heroes');

  return active.sort((a, b) => a.remainingSeconds - b.remainingSeconds);
};
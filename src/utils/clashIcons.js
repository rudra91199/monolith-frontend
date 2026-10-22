import { useState, useEffect } from 'react';

import builderWorking1 from '../assets/Villager_HV_Builder_7.webp';
import builderWorking2 from '../assets/Villager_HV_Builder_16.webp';
import builderFree1 from '../assets/Villager_HV_Builder_13.webp';
import builderFree2 from '../assets/Villager_HV_Builder_21.webp';
import buildingStructureIcon from '../assets/Building.webp';
import clanGamesIcon from '../assets/Clan_Games.webp';
import WarIcon from '../assets/WarIcon.webp';
import stars from '../assets/Stars.webp';   
import trophy from '../assets/trophy.webp';

// Standing Hero Poses (2 per Hero)
import bk1 from '../assets/Heroes_Images/Barbarian_King_1.webp';
import bk2 from '../assets/Heroes_Images/Barbarian_King_2.webp';
import aq1 from '../assets/Heroes_Images/Archer_Queen_1.webp';
import aq2 from '../assets/Heroes_Images/Archer_Queen_2.webp';
import gw1 from '../assets/Heroes_Images/Grand_Warden_1.webp';
import gw2 from '../assets/Heroes_Images/Grand_Warden_2.webp';
import rc1 from '../assets/Heroes_Images/Royal_Champion_1.webp';
import rc2 from '../assets/Heroes_Images/Royal_Champion_2.webp';
import mp1 from '../assets/Heroes_Images/Minion_Prince_1.webp';
import mp2 from '../assets/Heroes_Images/Minion_Prince_2.webp';
import dd1 from '../assets/Heroes_Images/Dragon_Duke_1.webp';
import dd2 from '../assets/Heroes_Images/Dragon_Duke_2.webp';

export const HERO_STANDING_MAP = {
  'barbarian king': [bk1, bk2],
  'archer queen': [aq1, aq2],
  'minion prince': [mp1, mp2],
  'grand warden': [gw1, gw2],
  'royal champion': [rc1, rc2],
  'dragon duke': [dd1, dd2]
};

export const ALL_STANDING_HERO_IMAGES = [
  bk1, bk2, aq1, aq2, mp1, mp2, gw1, gw2, rc1, rc2, dd1, dd2
];

export const getHeroStandingPoses = (heroName) => {
  if (!heroName) return [bk1, bk2];
  const key = heroName.toLowerCase().trim();
  return HERO_STANDING_MAP[key] || [bk1, bk2];
};

// Cycles between pose 0 and pose 1 every 3 seconds for smooth fade-in / fade-out
export const useHeroPoseCycle = (intervalMs = 3000) => {
  const [poseIndex, setPoseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPoseIndex((prev) => (prev === 0 ? 1 : 0));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return poseIndex;
};

export const BUILDER_ASSETS = {
  working: [builderWorking1, builderWorking2],
  free: [builderFree1, builderFree2]
};

export const useBuilderIcon = (isWorking = true) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return isWorking ? BUILDER_ASSETS.working[frame] : BUILDER_ASSETS.free[frame];
};

export const CLASH_ICONS = {
  townHall: 'https://assets.clashk.ing/buildings/home-village/town_hall/level_16.webp',
  clanCastle: 'https://assets.clashk.ing/buildings/home-village/clan_castle/level_11.webp',
  clanGames: clanGamesIcon,
  builderHut: builderWorking1,
  structures: buildingStructureIcon,
  barracks: 'https://assets.clashk.ing/buildings/home-village/barracks/level_17.webp',
  darkBarracks: 'https://assets.clashk.ing/buildings/home-village/dark_barracks/level_11.webp',
  workshop: 'https://assets.clashk.ing/buildings/home-village/workshop/level_7.webp',
  spellFactory: 'https://assets.clashk.ing/buildings/home-village/spell_factory/level_7.webp',
  darkSpellFactory: 'https://assets.clashk.ing/buildings/home-village/dark_spell_factory/level_6.webp',
  laboratory: 'https://assets.clashk.ing/buildings/home-village/laboratory/level_14.webp',
  blacksmith: 'https://assets.clashk.ing/buildings/home-village/blacksmith/level_1.webp',
  petHouse: 'https://assets.clashk.ing/buildings/home-village/pet_house/level_10.webp',
  trophy: trophy,
  war: WarIcon,
  stars: stars,
  cwl: 'https://assets.clashk.ing/icons/Icon_DC_CWL.png',
  shield: 'https://assets.clashk.ing/icons/Icon_HV_Shield_Arrow.png',
  capitalGold: 'https://assets.clashk.ing/icons/Icon_CC_Resource_Capital_Gold_small.png',
  leagueMedals: 'https://assets.clashk.ing/resources/league_medals.webp',
  raidMedals: 'https://assets.clashk.ing/resources/raid_medals.webp',
  gold: 'https://assets.clashk.ing/resources/gold.webp',
  elixir: 'https://assets.clashk.ing/resources/elixir.webp',
  darkElixir: 'https://assets.clashk.ing/resources/dark_elixir.webp',
  shinyOre: 'https://assets.clashk.ing/resources/shiny_ore.webp',
  glowyOre: 'https://assets.clashk.ing/resources/glowy_ore.webp',
  starryOre: 'https://assets.clashk.ing/resources/starry_ore.webp',
  troops: 'https://assets.clashk.ing/magic_items/hammer_of_fighting.webp',
  spells: 'https://assets.clashk.ing/buildings/home-village/spell_factory/level_9.webp',
  heroes: 'https://assets.clashk.ing/buildings/home-village/hero_hall/level_12.webp',
  equipment: 'https://assets.clashk.ing/equipment/revenge_deck.webp',
  pets: 'https://assets.clashk.ing/magic_items/pet_potion.webp',
  boostSnack: 'https://assets.clashk.ing/stickers/Villager_BB_Master_Builder_7.png',
  clanCake: 'https://assets.clashk.ing/magic_snacks/clan_castle_cake.webp',
  star: 'https://assets.clashk.ing/icons/Icon_BB_Star.png',
  gamesMedal :'https://assets.clashk.ing/icons/Icon_HV_Clan_Games_Medal.png'
};

export const getResourceIcon = (resourceName) => {
  if (!resourceName) return CLASH_ICONS.gold;
  const lower = resourceName.toLowerCase().trim();
  if (lower.includes('dark')) return CLASH_ICONS.darkElixir;
  if (lower.includes('elixir')) return CLASH_ICONS.elixir;
  if (lower.includes('shiny')) return CLASH_ICONS.shinyOre;
  if (lower.includes('glowy')) return CLASH_ICONS.glowyOre;
  if (lower.includes('starry')) return CLASH_ICONS.starryOre;
  if (lower.includes('gold')) return CLASH_ICONS.gold;
  const formatted = lower.replace(/\s+/g, '_');
  return `https://assets.clashk.ing/resources/${formatted}.webp`;
};

export const getLeagueBadgeUrl = (leagueName) => {
  if (!leagueName || leagueName.toLowerCase() === 'unranked') {
    return CLASH_ICONS.cwl;
  }
  const romanMap = { III: '3', II: '2', IV: '4', V: '5', I: '1' };
  const parts = leagueName.trim().split(/\s+/);
  const lastPart = parts[parts.length - 1];
  if (romanMap[lastPart]) {
    parts[parts.length - 1] = romanMap[lastPart];
  }
  const slug = parts.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `https://assets.clashk.ing/leagues/league-tier/${slug}.png`;
};
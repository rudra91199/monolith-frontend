import { useMemo, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  CLASH_ICONS,
  ALL_STANDING_HERO_IMAGES,
  getHeroStandingPoses
} from '../../utils/upgradeCalculator';

const FEATURE_PILLS = [
  { label: 'Multi-Village Telemetry', icon: CLASH_ICONS.townHall },
  { label: 'Builder & Lab ETM Matrix', icon: CLASH_ICONS.builderHut },
  { label: 'Live War & CWL Archives', icon: CLASH_ICONS.war || CLASH_ICONS.cwl },
  { label: 'Clan Games Interceptor', icon: CLASH_ICONS.clanGames || CLASH_ICONS.leagueMedals }
];

const generateFloatingAssets = (count = 10) => {
  const categories = [
    {
      type: 'troop',
      pool: ['barbarian', 'archer', 'goblin', 'balloon', 'wizard', 'dragon', 'pekka', 'electro_dragon']
    },
    { type: 'hero', pool: ['hero'] },
    {
      type: 'pet',
      pool: ['electro_owl', 'mighty_yak', 'unicorn', 'frosty', 'diggy', 'spirit_fox', 'phoenix']
    },
    {
      type: 'equipment',
      pool: ['giant_gauntlet', 'action_figure', 'fireball', 'rocket_backpack']
    },
    { type: 'building', pool: ['13', '14', '15', '16', '17'] }
  ];

  return Array.from({ length: count }).map((_, i) => {
    const category = categories[i % categories.length];
    const entity = category.pool[Math.floor(Math.random() * category.pool.length)];

    let src = '';
    if (category.type === 'troop') src = `https://assets.clashk.ing/troops/${entity}/icon.webp`;
    if (category.type === 'hero') {
      src = ALL_STANDING_HERO_IMAGES[i % ALL_STANDING_HERO_IMAGES.length];
    }
    if (category.type === 'pet') src = `https://assets.clashk.ing/pets/${entity}/icon.webp`;
    if (category.type === 'equipment') src = `https://assets.clashk.ing/equipment/${entity}.webp`;
    if (category.type === 'building') {
      src = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${entity}.webp`;
    }

    return {
      id: i,
      src,
      size: 110 + (i % 4) * 35,
      top: `${(i * 11 + 8) % 88}%`,
      left: `${(i * 17 + 5) % 90}%`,
      depth: (i % 3) * 0.7 + 0.6,
      rotation: (i % 2 === 0 ? 1 : -1) * (10 + (i * 3) % 18),
      pulseDuration: 4 + (i % 4),
      pulseDelay: (i % 5) + 1
    };
  });
};

function SpatialAsset({ asset, mouseX, mouseY }) {
  const smoothX = useSpring(mouseX, { damping: 90, stiffness: 25, mass: 1.8 });
  const smoothY = useSpring(mouseY, { damping: 90, stiffness: 25, mass: 1.8 });

  const x = useTransform(smoothX, [0, 1920], [asset.depth * -55, asset.depth * 55]);
  const y = useTransform(smoothY, [0, 1080], [asset.depth * -55, asset.depth * 55]);

  return (
    <motion.div
      style={{
        x,
        y,
        top: asset.top,
        left: asset.left,
        width: asset.size,
        height: asset.size
      }}
      initial={{ opacity: 0, rotateZ: asset.rotation, y: 40 }}
      animate={{
        opacity: 1,
        rotateZ: asset.rotation + (asset.depth > 1.2 ? -12 : 12),
        y: -40
      }}
      transition={{
        opacity: { duration: 2 },
        rotateZ: { duration: 32 + asset.depth * 8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
        y: { duration: 24 + asset.depth * 10, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
      }}
      className="absolute pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
    >
      <img
        src={asset.src}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{ filter: 'grayscale(100%) brightness(0.32) contrast(1.2)' }}
        onError={(e) => (e.target.style.display = 'none')}
      />
      <motion.img
        src={asset.src}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0] }}
        transition={{
          duration: asset.pulseDuration,
          repeat: Infinity,
          repeatDelay: asset.pulseDelay,
          ease: 'easeInOut'
        }}
        onError={(e) => (e.target.style.display = 'none')}
      />
    </motion.div>
  );
}

export function LoginBackgroundLayer() {
  const floatingAssets = useMemo(() => generateFloatingAssets(10), []);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 960);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 540);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
    checkMobile();
    const handleMove = (e) => {
      if (!isMobile) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };
    window.addEventListener('resize', checkMobile);
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [isMobile, mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top Landscape Scenery */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 inset-x-0 h-[65dvh] bg-cover bg-center opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `url('https://assets.clashk.ing/landscape/war-landscape.jpg')`,
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040508]/50 via-[#040508]/85 to-[#030305]" />

      {/* Floating Spatial Troops, Heroes, Pets & Equipment */}
      {floatingAssets.map((asset) => (
        <SpatialAsset key={asset.id} asset={asset} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}

export default function LoginShowcasePanel() {
  const kingPose = getHeroStandingPoses('Barbarian King')[0];
  const queenPose = getHeroStandingPoses('Archer Queen')[0];

  return (
    <div className="hidden lg:flex flex-col justify-center space-y-6 select-none pr-4">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] w-max">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-cyan-300">
          ClashLab Telemetry Suite
        </span>
      </div>

      <h1 className="text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
        Clash Intel, <br />
        <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
          Refined.
        </span>
      </h1>

      <p className="text-sm text-neutral-300 leading-relaxed max-w-lg">
        Real-time upgrade matrices, active builder timers, permanent Clan War &amp; CWL combat logs, and automated Clan Games tracking under one unified ClashLab ID.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-lg">
        {FEATURE_PILLS.map((feat) => (
          <div
            key={feat.label}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.65)]"
          >
            <img src={feat.icon} alt="" className="w-7 h-7 object-contain shrink-0 drop-shadow" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white leading-tight">
              {feat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative h-36 pt-2 flex items-end gap-4 pointer-events-none">
        <div className="absolute bottom-1 left-8 w-44 h-6 bg-cyan-400/20 blur-2xl rounded-full" />
        <img
          src={kingPose}
          alt=""
          className="h-36 w-auto object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.95)]"
        />
        <img
          src={queenPose}
          alt=""
          className="h-32 w-auto object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.95)] -ml-4"
        />
      </div>
    </div>
  );
}
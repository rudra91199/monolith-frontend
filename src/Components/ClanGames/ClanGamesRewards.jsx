import { Check, Lock } from 'lucide-react';
import { CLASH_ICONS } from '../../utils/upgradeCalculator';

const REWARD_TIERS = [
  {
    tier: 'I',
    points: 3000,
    rewards: [
      { label: '1.68M Elixir', qty: '1.68M', icon: CLASH_ICONS.elixir },
      { label: 'Clock Potion', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/potions/clock_tower_potion.webp' },
      { label: '20 Gems', qty: '20', icon: 'https://assets.clashk.ing/resources/gems.webp' }
    ]
  },
  {
    tier: 'II',
    points: 7500,
    rewards: [
      { label: '2.52M Gold', qty: '2.52M', icon: CLASH_ICONS.gold },
      { label: 'Power Potion', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/potions/power_potion.webp' },
      { label: 'Training Potion', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/potions/training_potion.webp' }
    ]
  },
  {
    tier: 'III',
    points: 12000,
    rewards: [
      { label: 'Wall Rings', qty: '4x', icon: 'https://assets.clashk.ing/magic-items/wall_ring.webp' },
      { label: 'Research Potion', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/potions/research_potion.webp' },
      { label: '40 Gems', qty: '40', icon: 'https://assets.clashk.ing/resources/gems.webp' }
    ]
  },
  {
    tier: 'IV',
    points: 18000,
    rewards: [
      { label: '6.72M Elixir', qty: '6.72M', icon: CLASH_ICONS.elixir },
      { label: 'Super Potion', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/potions/super_potion.webp' },
      { label: 'Shovel', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/shovel_of_obstacles.webp' }
    ]
  },
  {
    tier: 'V',
    points: 30000,
    rewards: [
      { label: '45K Dark Elixir', qty: '45K', icon: CLASH_ICONS.darkElixir },
      { label: 'Builder Rune', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/runes/rune_of_builder_gold.webp' },
      { label: 'Builder Potion', qty: '2x', icon: 'https://assets.clashk.ing/magic-items/potions/builder_potion.webp' }
    ]
  },
  {
    tier: 'VI',
    points: 50000,
    rewards: [
      { label: 'Book of Building', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/books/book_of_building.webp' },
      { label: 'Rune of Gold', qty: '1x', icon: 'https://assets.clashk.ing/magic-items/runes/rune_of_gold.webp' },
      { label: '100 Gems', qty: '100', icon: 'https://assets.clashk.ing/resources/gems.webp' }
    ]
  }
];

export default function ClanGamesRewards({ totalPoints = 0 }) {
  return (
    <div className="backdrop-blur-2xl bg-gradient-to-b from-[#14161f]/90 to-[#08090d]/95 rounded-3xl p-4 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_15px_35px_rgba(0,0,0,0.85)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
            Clan Games Reward Tiers (I &ndash; VI)
          </h3>
          <p className="text-[10px] font-mono text-neutral-400">
            Choose 1 reward from each unlocked column • Score 4,000+ personal points to claim 1 bonus reward
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-[#050608] text-[10px] font-mono font-bold text-emerald-300">
          {REWARD_TIERS.filter((t) => totalPoints >= t.points).length} / 6 Tiers Unlocked
        </span>
      </div>

      {/* 6-Column Compact Reward Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {REWARD_TIERS.map((col) => {
          const isUnlocked = totalPoints >= col.points;
          return (
            <div
              key={col.tier}
              className={`rounded-2xl p-2.5 flex flex-col justify-between gap-2 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-b from-emerald-950/35 via-[#09110f]/95 to-[#06080b] shadow-[inset_0_1px_1px_rgba(52,211,153,0.3),0_8px_20px_rgba(0,0,0,0.75)]'
                  : 'bg-[#06070a]/85 opacity-75 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)]'
              }`}
            >
              {/* Column Top Header with Unlock Checkmark */}
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Tier {col.tier}
                  </p>
                  <p className="text-[9px] font-mono text-neutral-400">
                    {(col.points / 1000).toFixed(col.points % 1000 === 0 ? 0 : 1)}K Pts
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isUnlocked
                      ? 'bg-emerald-500/25 text-emerald-300 shadow-[inset_0_1px_1px_rgba(52,211,153,0.4)]'
                      : 'bg-white/[0.05] text-neutral-500'
                  }`}
                >
                  {isUnlocked ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Lock className="w-3 h-3" />}
                </div>
              </div>

              {/* 3 Selectable Reward Slots */}
              <div className="space-y-1.5">
                {col.rewards.map((rew, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-2 rounded-xl bg-[#050609]/95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] flex items-center gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] p-1 flex items-center justify-center shrink-0">
                      <img
                        src={rew.icon}
                        alt={rew.label}
                        className="w-full h-full object-contain drop-shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = CLASH_ICONS.clanGames || CLASH_ICONS.leagueMedals;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-bold text-white leading-tight">
                        {rew.qty}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-400 truncate">
                        {rew.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
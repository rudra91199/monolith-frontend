import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search, X, ArrowUpDown, RotateCcw, Check } from 'lucide-react';
import { CLASH_ICONS } from '../../utils/upgradeCalculator';
import { getImageUrl } from './ItemCard';

const CATEGORIES = [
  { id: 'troops', label: 'Troops', icon: CLASH_ICONS.troops },
  { id: 'spells', label: 'Spells', icon: CLASH_ICONS.spells },
  { id: 'heroes', label: 'Heroes', icon: CLASH_ICONS.heroes },
  { id: 'buildings', label: 'Structures', icon: CLASH_ICONS.structures },
  { id: 'equipment', label: 'Equipment', icon: CLASH_ICONS.equipment },
  { id: 'pets', label: 'Pets', icon: CLASH_ICONS.pets }
];

const TROOP_KINDS = [
  { id: 'Barracks', label: 'Barracks', icon: CLASH_ICONS.barracks },
  { id: 'Dark Barracks', label: 'Dark Barracks', icon: CLASH_ICONS.darkBarracks },
  { id: 'Workshop', label: 'Workshop', icon: CLASH_ICONS.workshop }
];

const SPELL_KINDS = [
  { id: 'Spell Factory', label: 'Spell Factory', icon: CLASH_ICONS.spellFactory },
  { id: 'Dark Spell Factory', label: 'Dark Spell Factory', icon: CLASH_ICONS.darkSpellFactory }
];

const HERO_LIST = [
  'Barbarian King',
  'Archer Queen',
  'Minion Prince',
  'Grand Warden',
  'Royal Champion',
  'Dragon Duke'
];

const STRUCTURE_TYPES = [
  { id: 'Army', label: 'Army', icon: CLASH_ICONS.barracks },
  { id: 'Defense', label: 'Defense', icon: CLASH_ICONS.shield },
  { id: 'Resources', label: 'Resources', icon: CLASH_ICONS.gold },
  { id: 'Traps', label: 'Traps', icon: CLASH_ICONS.structures }
];

const STRUCTURE_RESOURCES = [
  { id: 'Gold', label: 'Gold', icon: CLASH_ICONS.gold },
  { id: 'Elixir', label: 'Elixir', icon: CLASH_ICONS.elixir },
  { id: 'Dark Elixir', label: 'Dark Elixir', icon: CLASH_ICONS.darkElixir }
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Default Order' },
  { id: 'cost_asc', label: 'Min Cost ↑' },
  { id: 'cost_desc', label: 'Max Cost ↓' },
  { id: 'name_asc', label: 'Name (A → Z)' },
  { id: 'name_desc', label: 'Name (Z → A)' }
];

export default function FilterSystem({
  activeTab,
  appliedFilter,
  onApplyFilter,
  onClearFilter
}) {
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState('troops');
  const [searchQuery, setSearchQuery] = useState('');
  const [troopSub, setTroopSub] = useState('Barracks');
  const [spellSub, setSpellSub] = useState('Spell Factory');
  const [equipHero, setEquipHero] = useState('Barbarian King');
  const [equipRarity, setEquipRarity] = useState('');
  const [structureSub, setStructureSub] = useState('');
  const [structureResource, setStructureResource] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (open && !appliedFilter) {
      const validCats = ['troops', 'spells', 'heroes', 'buildings', 'equipment', 'pets'];
      if (validCats.includes(activeTab)) {
        setCategory(activeTab);
      }
    }
  }, [open, activeTab, appliedFilter]);

  const handleCategorySwitch = (catId) => {
    setCategory(catId);
    setSearchQuery('');
    setSortBy('default');
    if (catId === 'equipment') setEquipRarity('');
    if (catId === 'buildings') {
      setStructureSub('');
      setStructureResource('');
    }
  };

  const handleResetDraft = () => {
    setSearchQuery('');
    setTroopSub('Barracks');
    setSpellSub('Spell Factory');
    setEquipHero('Barbarian King');
    setEquipRarity('');
    setStructureSub('');
    setStructureResource('');
    setSortBy('default');
    if (appliedFilter) {
      onClearFilter();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onApplyFilter({
      category,
      searchQuery: searchQuery.trim(),
      troopSub,
      spellSub,
      equipHero,
      equipRarity,
      structureSub,
      structureResource,
      sortBy
    });
    setOpen(false);
  };

  const canSort = ['troops', 'spells', 'heroes', 'equipment', 'buildings'].includes(category);

  const renderFilterFields = () => (
    <div className="space-y-5">
      {/* 1. Search by Name */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
          Search by Name
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${
              CATEGORIES.find((c) => c.id === category)?.label || 'items'
            } by name...`}
            className="w-full bg-[#050608] shadow-[inset_0_2px_6px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.07)] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Selector */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
          Select Category
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySwitch(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_14px_rgba(0,0,0,0.75)]'
                    : 'bg-[#06070a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <img src={cat.icon} alt={cat.label} className="w-6 h-6 object-contain drop-shadow" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate w-full">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamic Category Sub-Options */}
      {category === 'troops' && (
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Troop Production Building
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TROOP_KINDS.map((tk) => {
              const active = troopSub === tk.id;
              return (
                <button
                  key={tk.id}
                  type="button"
                  onClick={() => setTroopSub(tk.id)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.7)]'
                      : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <img src={tk.icon} alt={tk.label} className="w-5 h-5 object-contain shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs">{tk.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {category === 'spells' && (
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Spell Factory Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SPELL_KINDS.map((sk) => {
              const active = spellSub === sk.id;
              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => setSpellSub(sk.id)}
                  className={`flex items-center justify-center gap-2.5 p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-b from-white/[0.18] to-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.7)]'
                      : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <img src={sk.icon} alt={sk.label} className="w-5 h-5 object-contain shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs">{sk.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {category === 'heroes' && (
        <div className="p-3 rounded-2xl bg-[#06070a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] text-[11px] font-mono text-neutral-300">
          Search heroes by name or apply sorting below. Leaving search &amp; sort blank redirects directly to the Heroes tab.
        </div>
      )}

      {category === 'pets' && (
        <div className="p-3 rounded-2xl bg-[#06070a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] text-[11px] font-mono text-neutral-300">
          Search pets by name above or leave search blank to jump directly to the Pets category.
        </div>
      )}

      {category === 'equipment' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Choose Hero (6 Heroes)
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {HERO_LIST.map((heroName) => {
                const lastName = heroName.split(' ').pop();
                const isSelected = equipHero === heroName;
                return (
                  <button
                    key={heroName}
                    type="button"
                    onClick={() => setEquipHero(heroName)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.7)]'
                        : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <img
                      src={getImageUrl('heroes', heroName)}
                      alt={lastName}
                      className="w-6 h-6 object-contain drop-shadow"
                    />
                    <span className="text-[8px] font-bold uppercase tracking-tight truncate w-full text-center">
                      {lastName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Equipment Tier (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '', label: 'All Tiers' },
                { id: 'Rare', label: 'Rare / Common' },
                { id: 'Epic', label: 'Epic' }
              ].map((tier) => (
                <button
                  key={tier.id || 'all'}
                  type="button"
                  onClick={() => setEquipRarity(tier.id)}
                  className={`py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    equipRarity === tier.id
                      ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.7)]'
                      : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {category === 'buildings' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Structure Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STRUCTURE_TYPES.map((st) => {
                const active = structureSub === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStructureSub(active ? '' : st.id)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.7)]'
                        : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <img src={st.icon} alt={st.label} className="w-5 h-5 object-contain shrink-0" />
                    <span className="text-[11px]">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Filter by Upgrade Resource
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STRUCTURE_RESOURCES.map((res) => {
                const active = structureResource === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setStructureResource(active ? '' : res.id)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.7)]'
                        : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <img src={res.icon} alt={res.label} className="w-5 h-5 object-contain shrink-0" />
                    <span className="text-[10px] sm:text-xs truncate">{res.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Sorting Section */}
      {canSort && (
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-300" />
            <span>Sort By (Costing or Alphabetical)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id)}
                  className={`py-2.5 px-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.7)]'
                      : 'bg-[#06070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* PC / DESKTOP FILTER ROW */}
      <div className="hidden md:flex items-center justify-between gap-3 backdrop-blur-2xl bg-gradient-to-b from-[#151720]/90 to-[#08090d]/95 rounded-2xl px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_10px_25px_rgba(0,0,0,0.75)]">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.07)] flex items-center justify-center text-neutral-200 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white">
              Village Filter &amp; Sort Matrix
            </p>
            <p className="text-[9px] font-mono text-neutral-400">
              Filter Troops, Spells, Heroes, Equipment, Pets &amp; Structures by Name, Type, Resource or Cost
            </p>
          </div>

          {appliedFilter && (
            <div className="flex items-center gap-1.5 flex-wrap ml-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-[10px] font-mono font-bold text-white uppercase">
                {appliedFilter.category}
              </span>
              {appliedFilter.structureSub && (
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.07] text-[10px] font-mono text-neutral-200">
                  {appliedFilter.structureSub}
                </span>
              )}
              {appliedFilter.structureResource && (
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.07] text-[10px] font-mono text-neutral-200">
                  {appliedFilter.structureResource}
                </span>
              )}
              {appliedFilter.equipRarity && (
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.07] text-[10px] font-mono text-neutral-200">
                  {appliedFilter.equipRarity}
                </span>
              )}
              {appliedFilter.searchQuery && (
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.07] text-[10px] font-mono text-white">
                  &ldquo;{appliedFilter.searchQuery}&rdquo;
                </span>
              )}
              {appliedFilter.sortBy && appliedFilter.sortBy !== 'default' && (
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.07] text-[10px] font-mono text-emerald-300">
                  {SORT_OPTIONS.find((s) => s.id === appliedFilter.sortBy)?.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {appliedFilter && (
            <button
              type="button"
              onClick={onClearFilter}
              className="px-3.5 py-2 rounded-xl bg-[#06070a] hover:bg-rose-950/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#222530] to-[#0e1017] hover:from-[#292d3a] hover:to-[#13161f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_16px_rgba(0,0,0,0.8)] text-xs font-bold uppercase tracking-widest text-white cursor-pointer transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-300" />
            <span>Open Filter</span>
          </button>
        </div>
      </div>

      {/* MOBILE SMALL FLOATING FILTER BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Filter Sidebar"
        className="md:hidden fixed bottom-22 right-4 z-40 w-12 h-12 rounded-2xl bg-gradient-to-b from-[#242733] to-[#0b0d13] shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_12px_28px_rgba(0,0,0,0.95)] flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <SlidersHorizontal className="w-5 h-5" />
        {appliedFilter && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        )}
      </button>

      {/* MODAL (PC) & SIDEBAR DRAWER (MOBILE) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[115] bg-black/80 backdrop-blur-md"
            />

            {/* DESKTOP CENTERED MODAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="hidden md:flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-full max-w-2xl max-h-[88dvh] bg-gradient-to-b from-[#13151d] to-[#08090d] rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_30px_90px_rgba(0,0,0,0.98)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#07080b]/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#050608] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] flex items-center justify-center text-white">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                      Command Filter &amp; Sorting Modal
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Filter categories, sub-buildings, resources, or sort by upgrade cost
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.05] text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {renderFilterFields()}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06] bg-[#07080b]/90 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#06070a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.08)] text-xs font-mono text-neutral-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-b from-white to-neutral-300 text-black font-bold text-xs uppercase tracking-widest hover:brightness-105 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_20px_rgba(0,0,0,0.8)]"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>

            {/* MOBILE SLIDE-OVER SIDEBAR WITH FLOATING ACTION BUTTONS BESIDE / AT TOP OF SIDEBAR */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="md:hidden fixed inset-y-0 right-0 z-[120] w-[82vw] max-w-sm bg-gradient-to-b from-[#13151d] to-[#08090d] shadow-[inset_1px_0_0_rgba(255,255,255,0.14),-25px_0_70px_rgba(0,0,0,0.98)] flex flex-col"
            >
              {/* Floating Action Rail Positioned Directly Beside the Left Edge of the Sidebar */}
              <div className="absolute -left-14 top-20 flex flex-col gap-2.5 z-30">
                <button
                  type="button"
                  onClick={handleSubmit}
                  title="Apply Filter"
                  className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-neutral-300 text-black shadow-[0_8px_25px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Apply</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDraft}
                  title="Reset Filter"
                  className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#222530] to-[#0c0e14] text-neutral-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_8px_25px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close Sidebar"
                  className="w-12 h-10 rounded-2xl bg-[#08090d]/95 text-neutral-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_20px_rgba(0,0,0,0.9)] flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Top Bar inside Sidebar (Also includes Reset & Apply right at the top) */}
              <div className="px-4 py-3.5 border-b border-white/[0.06] bg-[#07080b]/95 shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#050608] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] flex items-center justify-center text-white shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white truncate">
                    Filter &amp; Sort
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetDraft}
                    className="px-2.5 py-1.5 rounded-xl bg-[#050608] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] text-[10px] font-mono font-bold uppercase text-neutral-300"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-white to-neutral-300 text-black text-[10px] font-bold uppercase tracking-wider shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Body with pb-28 clearance above mobile nav bar */}
              <div className="flex-1 p-4 pb-28 overflow-y-auto custom-scrollbar">
                {renderFilterFields()}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import {
  formatCost,
  formatTime,
  getResourceIcon,
  CLASH_ICONS
} from '../../utils/upgradeCalculator';
import { getImageUrl } from './ItemCard';

export default function UpgradeModal({
  selectedItemModal,
  onClose,
  thLevel,
  workingBuilderIcon
}) {
  return (
    <AnimatePresence>
      {selectedItemModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-xl bg-[#0a0a0c] border border-neutral-800 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[85dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-800/80 bg-[#070709] flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-16 h-16 rounded-2xl bg-black/70 border border-white/10 p-2 flex items-center justify-center shrink-0 ${
                    selectedItemModal.analysis.isLocked ? 'grayscale' : ''
                  }`}
                >
                  <img
                    src={getImageUrl(
                      selectedItemModal.category,
                      selectedItemModal.item.name,
                      Math.max(1, selectedItemModal.item.level)
                    )}
                    alt={selectedItemModal.item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CLASH_ICONS.townHall;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-serif text-white tracking-wide truncate">
                      {selectedItemModal.item.name}
                      {selectedItemModal.item.count > 1 && (
                        <span className="ml-2 text-xs font-mono text-amber-400">
                          x{selectedItemModal.item.count}
                        </span>
                      )}
                    </h3>
                    {selectedItemModal.analysis.isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-300">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                  {selectedItemModal.analysis.unlockRequirementText && (
                    <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                      {selectedItemModal.analysis.unlockRequirementText}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={
                        selectedItemModal.analysis.isEquipment
                          ? CLASH_ICONS.shinyOre
                          : selectedItemModal.analysis.resourceIcon
                      }
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                    <p className="text-xs font-mono text-neutral-300">
                      Current:{' '}
                      <span className="text-white font-bold">
                        Lv.{selectedItemModal.item.level}
                      </span>{' '}
                      / TH{thLevel} Max:{' '}
                      <span className="text-amber-400 font-bold">
                        Lv.{selectedItemModal.analysis.maxAtTh}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white shrink-0 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Cumulative Resource & ETM Summary Banner */}
            {selectedItemModal.analysis.isEquipment ? (
              <div className="p-4 bg-black/50 border-b border-neutral-800/60">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2.5">
                  Required Blacksmith Ores to Max
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#0f0f13] border border-cyan-500/20 flex items-center gap-2.5">
                    <img
                      src={getResourceIcon('shiny_ore')}
                      alt="Shiny Ore"
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] text-cyan-400 uppercase font-bold">Shiny Ore</p>
                      <p className="text-sm font-mono font-bold text-white truncate">
                        {formatCost(
                          selectedItemModal.analysis.isMaxed
                            ? selectedItemModal.analysis.maxTierUpgrade?.ores?.shiny_ore || 0
                            : selectedItemModal.analysis.totalOresToMax.shiny_ore
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0f0f13] border border-purple-500/20 flex items-center gap-2.5">
                    <img
                      src={getResourceIcon('glowy_ore')}
                      alt="Glowy Ore"
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] text-purple-400 uppercase font-bold">Glowy Ore</p>
                      <p className="text-sm font-mono font-bold text-white truncate">
                        {formatCost(
                          selectedItemModal.analysis.isMaxed
                            ? selectedItemModal.analysis.maxTierUpgrade?.ores?.glowy_ore || 0
                            : selectedItemModal.analysis.totalOresToMax.glowy_ore
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0f0f13] border border-amber-500/20 flex items-center gap-2.5">
                    <img
                      src={getResourceIcon('starry_ore')}
                      alt="Starry Ore"
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] text-amber-400 uppercase font-bold">Starry Ore</p>
                      <p className="text-sm font-mono font-bold text-white truncate">
                        {formatCost(
                          selectedItemModal.analysis.isMaxed
                            ? selectedItemModal.analysis.maxTierUpgrade?.ores?.starry_ore || 0
                            : selectedItemModal.analysis.totalOresToMax.starry_ore
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4 bg-black/50 border-b border-neutral-800/60">
                <div className="p-3.5 rounded-2xl bg-[#0f0f13] border border-amber-500/20 flex items-center gap-3">
                  <img
                    src={selectedItemModal.analysis.resourceIcon}
                    alt={selectedItemModal.analysis.resource}
                    className="w-10 h-10 object-contain shrink-0 drop-shadow"
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
                      {selectedItemModal.analysis.isMaxed
                        ? `Final Upgrade (${selectedItemModal.analysis.resource})`
                        : `Total ${selectedItemModal.analysis.resource}`}
                    </p>
                    <p className="text-base sm:text-lg font-mono font-bold text-amber-300 truncate">
                      {formatCost(
                        (selectedItemModal.analysis.isMaxed
                          ? selectedItemModal.analysis.maxTierUpgrade?.cost || 0
                          : selectedItemModal.analysis.totalCostToMax) *
                          (selectedItemModal.item.count || 1)
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f0f13] border border-cyan-500/20 flex items-center gap-3">
                  <img
                    src={workingBuilderIcon}
                    alt="Estimated Time"
                    className="w-11 h-11 object-contain shrink-0 drop-shadow"
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
                      {selectedItemModal.analysis.isMaxed
                        ? 'Final Tier Duration'
                        : 'Estimated Time to Max'}
                    </p>
                    <p className="text-base sm:text-lg font-mono font-bold text-cyan-300 truncate">
                      {formatTime(
                        (selectedItemModal.analysis.isMaxed
                          ? selectedItemModal.analysis.maxTierUpgrade?.time || 0
                          : selectedItemModal.analysis.totalTimeToMax) *
                          (selectedItemModal.item.count || 1)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Levels Breakdown Table */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {selectedItemModal.analysis.remainingLevels.length > 0 ? (
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-neutral-500 uppercase border-b border-neutral-800">
                      <th className="py-2.5 px-3">Transition</th>
                      <th className="py-2.5 px-3">Required Resource</th>
                      {!selectedItemModal.analysis.isEquipment && (
                        <th className="py-2.5 px-3 text-right">Duration</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {selectedItemModal.analysis.remainingLevels.map((lvl) => (
                      <tr key={lvl.level} className="hover:bg-white/[0.03]">
                        <td className="py-3 px-3 font-bold text-white">
                          {lvl.fromLevel === 0
                            ? `Unlock (Lv.1)`
                            : `Lv.${lvl.fromLevel} → Lv.${lvl.level}`}
                        </td>
                        <td className="py-3 px-3">
                          {selectedItemModal.analysis.isEquipment && lvl.ores ? (
                            <div className="flex items-center gap-3 flex-wrap">
                              {lvl.ores.shiny_ore > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-cyan-300 font-bold">
                                  <img
                                    src={getResourceIcon('shiny_ore')}
                                    alt="Shiny"
                                    className="w-4 h-4 object-contain"
                                  />
                                  {formatCost(lvl.ores.shiny_ore)}
                                </span>
                              )}
                              {lvl.ores.glowy_ore > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-purple-300 font-bold">
                                  <img
                                    src={getResourceIcon('glowy_ore')}
                                    alt="Glowy"
                                    className="w-4 h-4 object-contain"
                                  />
                                  {formatCost(lvl.ores.glowy_ore)}
                                </span>
                              )}
                              {lvl.ores.starry_ore > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                                  <img
                                    src={getResourceIcon('starry_ore')}
                                    alt="Starry"
                                    className="w-4 h-4 object-contain"
                                  />
                                  {formatCost(lvl.ores.starry_ore)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-amber-300 font-bold">
                              <img
                                src={selectedItemModal.analysis.resourceIcon}
                                alt={selectedItemModal.analysis.resource}
                                className="w-5 h-5 object-contain"
                              />
                              {formatCost(lvl.cost)}
                            </span>
                          )}
                        </td>
                        {!selectedItemModal.analysis.isEquipment && (
                          <td className="py-3 px-3 text-right text-cyan-300 whitespace-nowrap">
                            <span className="inline-flex items-center justify-end gap-1.5">
                              <img
                                src={workingBuilderIcon}
                                alt=""
                                className="w-6 h-6 object-contain"
                              />
                              {formatTime(lvl.time)}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <img
                    src={CLASH_ICONS.leagueMedals}
                    alt="Maxed"
                    className="w-10 h-10 mx-auto object-contain"
                  />
                  <p className="text-amber-400 text-xs uppercase tracking-widest font-bold">
                    Maximum Level Reached for Town Hall {thLevel}
                  </p>
                  {selectedItemModal.analysis.maxTierUpgrade && (
                    <p className="text-neutral-400 text-xs font-mono">
                      Final Upgrade Transition: Lv.
                      {selectedItemModal.analysis.maxTierUpgrade.fromLevel} &rarr; Lv.
                      {selectedItemModal.analysis.maxTierUpgrade.level}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
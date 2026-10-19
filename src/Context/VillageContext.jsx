import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Castle, FileJson, X, CheckCircle2, AlertCircle, Loader2, Upload } from 'lucide-react';
import api from '../utils/api';

const VillageContext = createContext(null);

export function VillageProvider({ children }) {
  const [user, setUser] = useState(null);
  const [linkedVillages, setLinkedVillages] = useState([]);
  const [activeVillage, setActiveVillageState] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Global Modal for Linking a New Village or Updating Building JSON
  const [jsonModal, setJsonModal] = useState({ open: false, mode: 'link' }); // mode: 'link' | 'sync'
  const [jsonText, setJsonText] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const selectVillage = useCallback((villages, preferredTag = null) => {
    if (!villages || villages.length === 0) {
      setActiveVillageState(null);
      localStorage.removeItem('coc_active_village');
      return;
    }
    const savedTag = preferredTag || localStorage.getItem('coc_active_village');
    const found = villages.find(v => v.tag === savedTag) || villages[0];
    setActiveVillageState(found);
    localStorage.setItem('coc_active_village', found.tag);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('coc_token');
    if (!token) {
      setUser(null);
      setLinkedVillages([]);
      setActiveVillageState(null);
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await api.get('/api/auth/me');
      const fetchedUser = res.data.user;
      setUser(fetchedUser);
      const villages = fetchedUser?.linkedVillages || [];
      setLinkedVillages(villages);
      selectVillage(villages);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [selectVillage]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const setActiveVillage = (villageOrTag) => {
    const tag = typeof villageOrTag === 'string' ? villageOrTag : villageOrTag?.tag;
    selectVillage(linkedVillages, tag);
  };

  const openLinkModal = (mode = 'link') => {
    setJsonText('');
    setModalError('');
    setModalSuccess('');
    setJsonModal({ open: true, mode });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setJsonText(event.target.result);
    reader.readAsText(file);
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setModalLoading(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText.trim());
      } catch {
        throw new Error('Invalid JSON format. Copy the exact data export from Clash of Clans settings.');
      }

      if (!parsed.tag || !Array.isArray(parsed.buildings)) {
        throw new Error('JSON is missing village tag or buildings array.');
      }

      if (jsonModal.mode === 'link') {
        const res = await api.post('/api/auth/link-village', { villageJson: parsed });
        const updated = res.data.linkedVillages || [];
        setLinkedVillages(updated);
        selectVillage(updated, parsed.tag);
        setModalSuccess(res.data.message || 'Village linked and buildings synced!');
      } else {
        await api.post('/api/building/upload', parsed);
        setModalSuccess('Building levels & builder timers updated!');
      }

      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => {
        setJsonModal({ open: false, mode: 'link' });
      }, 900);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to process village JSON.');
    } finally {
      setModalLoading(false);
    }
  };

  const unlinkVillage = async (tag) => {
    if (!window.confirm(`Unlink village ${tag} from your account?`)) return;
    try {
      const res = await api.delete(`/api/auth/unlink-village/${encodeURIComponent(tag)}`);
      const updated = res.data.linkedVillages || [];
      setLinkedVillages(updated);
      selectVillage(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unlink village.');
    }
  };

  return (
    <VillageContext.Provider
      value={{
        user,
        linkedVillages,
        activeVillage,
        setActiveVillage,
        loadingProfile,
        fetchUserProfile,
        openLinkModal,
        unlinkVillage,
        refreshTrigger
      }}
    >
      {children}

      {/* GLOBAL JSON LINK / SYNC MODAL */}
      <AnimatePresence>
        {jsonModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setJsonModal({ open: false, mode: 'link' })}
              className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[90] bg-[#0a0a0c] border border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <FileJson className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-serif text-lg tracking-wide">
                      {jsonModal.mode === 'link' ? 'Link Village via JSON' : 'Sync Village Buildings'}
                    </h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      Settings &rarr; More Settings &rarr; Data Export &rarr; Copy
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setJsonModal({ open: false, mode: 'link' })}
                  className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleJsonSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                      Paste Clipboard JSON or Upload File
                    </span>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300 uppercase tracking-widest font-bold">
                      <Upload className="w-3 h-3" />
                      <span>Choose .json/.txt</span>
                      <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <textarea
                    rows={6}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"tag":"#9YYGR9PRG","timestamp":1791920378,"buildings":[...]}'
                    className="w-full bg-[#060608] border border-neutral-800 rounded-2xl p-4 text-xs font-mono text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 custom-scrollbar"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full h-12 rounded-xl bg-white text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-neutral-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {modalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Castle className="w-4 h-4" />
                      <span>{jsonModal.mode === 'link' ? 'Verify & Link Village' : 'Update Building Data'}</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </VillageContext.Provider>
  );
}

export const useVillage = () => useContext(VillageContext);
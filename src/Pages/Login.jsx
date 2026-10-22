import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronRight, ShieldCheck, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useVillage } from '../Context/VillageContext';
import BrandLogo from '../Components/Common/BrandLogo';
import LoginShowcasePanel, { LoginBackgroundLayer } from '../Components/Auth/LoginBackdrop';

export default function Login() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserProfile } = useVillage();

  // Modes: 'login' | 'register' | 'forgot' | 'reset' | 'verifying' | 'verified_success' | 'reset_success'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/verify-email/') && token) {
      setMode('verifying');
      axios
        .get(`/api/auth/verify-email/${token}`)
        .then((res) => {
          if (res.data.token) {
            localStorage.setItem('coc_token', res.data.token);
            setMode('verified_success'); // Show success UI instead of auto-redirect
          } else {
            setMode('login');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Verification link expired or invalid.');
          setMode('login');
        });
    } else if (location.pathname.startsWith('/reset-password/') && token) {
      setMode('reset');
    }
  }, [location.pathname, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('coc_token', res.data.token);
        await fetchUserProfile();
        navigate('/dashboard');
      } else if (mode === 'register') {
        await axios.post('/api/auth/register', { email, password });
        // After registering, show the "Check your email" success screen
        setMode('check_email');
        setPassword('');
      } else if (mode === 'forgot') {
        await axios.post('/api/auth/forgot-password', { email });
        setMode('check_email');
      } else if (mode === 'reset') {
        await axios.post(`/api/auth/reset-password/${token}`, { password });
        setMode('reset_success'); // Show Reset Success UI
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDashboard = async () => {
    setLoading(true);
    await fetchUserProfile();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#030305] flex items-center justify-center overflow-x-hidden px-4 sm:px-8 py-8">
      <LoginBackgroundLayer />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT 7 COLS (Desktop Showcase) */}
        <div className="lg:col-span-7">
          <LoginShowcasePanel />
        </div>

        {/* RIGHT 5 COLS (Auth Card) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="lg:col-span-5 w-full max-w-md mx-auto backdrop-blur-3xl bg-gradient-to-b from-white/[0.07] to-[#07080d]/95 rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_25px_70px_rgba(0,0,0,0.95)]"
        >
          <div className="flex flex-col items-center justify-center text-center mb-6 pb-5 border-b border-white/[0.07]">
            <BrandLogo variant="desktop" showMotto={true} />
          </div>

          {/* DEDICATED SUCCESS & LOADING SCREENS */}
          {mode === 'verifying' && (
            <div className="py-10 flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Authenticating Token</h2>
                <p className="text-[10px] font-mono text-neutral-400 mt-1">Establishing secure connection...</p>
              </div>
            </div>
          )}

          {mode === 'verified_success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-4 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  <ShieldCheck className="w-8 h-8 text-emerald-300" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Identity Verified</h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Your ClashLab ID is now active. You are cleared for access to the command terminal.
                </p>
              </div>
              <button
                onClick={handleEnterDashboard}
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-emerald-400 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(52,211,153,0.3)] hover:brightness-110 transition-all cursor-pointer"
              >
                {loading ? 'Initializing...' : 'Enter Dashboard'}
              </button>
            </motion.div>
          )}

          {mode === 'reset_success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-4 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <KeyRound className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Key Updated</h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Your security key has been successfully reset. Please sign in with your new credentials.
                </p>
              </div>
              <button
                onClick={() => setMode('login')}
                className="w-full h-12 rounded-2xl bg-yellow-400 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(250,204,21,0.3)] hover:brightness-110 transition-all cursor-pointer"
              >
                Return to Sign In
              </button>
            </motion.div>
          )}

          {mode === 'check_email' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-4 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <Mail className="w-8 h-8 text-cyan-300" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Check Your Inbox</h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  A verification link has been dispatched to your email. Click it to authorize your session.
                </p>
              </div>
              <button
                onClick={() => setMode('login')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-widest font-bold cursor-pointer"
              >
                &larr; Back to Sign In
              </button>
            </motion.div>
          )}

          {/* STANDARD LOGIN/REGISTER/FORGOT/RESET FORMS */}
          {['login', 'register', 'forgot', 'reset'].includes(mode) && (
            <>
              <div className="text-center mb-5">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase">
                  {mode === 'login' && 'Command Terminal Access'}
                  {mode === 'register' && 'Create ClashLab ID'}
                  {mode === 'forgot' && 'Recover ClashLab ID'}
                  {mode === 'reset' && 'Set New Security Key'}
                </h2>
              </div>

              {(mode === 'login' || mode === 'register') && (
                <div className="grid grid-cols-2 gap-1.5 p-1.5 mb-5 bg-black/60 rounded-2xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)]">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-gradient-to-b from-white/[0.2] to-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-rose-950/35 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode !== 'reset' && (
                  <div className="relative">
                    <Mail className="h-4 w-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="EMAIL ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/65 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:bg-black/90 transition-colors"
                      required
                    />
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div className="relative">
                    <Lock className="h-4 w-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      placeholder={mode === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/65 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:bg-black/90 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-[10px] font-mono text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                  {mode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-[10px] font-mono text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-1 rounded-2xl bg-gradient-to-b from-white to-neutral-300 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_20px_rgba(0,0,0,0.8)] hover:brightness-105 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Launch ClashLab'}
                        {mode === 'register' && 'Create ClashLab ID'}
                        {mode === 'forgot' && 'Send Recovery Link'}
                        {mode === 'reset' && 'Update Password'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
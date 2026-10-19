import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Mail,
  Lock,
  ChevronRight,
  Swords,
  Castle,
  Database,
  Network,
  History,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useVillage } from "../Context/VillageContext";

const generateAssets = (count) => {
  const categories = [
    {
      type: "troop",
      pool: ["barbarian", "archer", "giant", "goblin", "balloon", "wizard", "dragon", "pekka", "electro_dragon", "yeti", "ice_golem"],
    },
    {
      type: "hero",
      pool: ["barbarian_king", "archer_queen", "grand_warden", "royal_champion"],
    },
    {
      type: "pet",
      pool: ["lassi", "electro_owl", "mighty_yak", "unicorn", "frosty", "diggy", "poison_lizard", "phoenix"],
    },
    {
      type: "equipment",
      pool: ["giant_gauntlet", "frozen_arrow", "fireball", "rocket_backpack"],
    },
    { type: "building", pool: ["12", "13", "14", "15", "16"] },
  ];

  return Array.from({ length: count }).map((_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const entity = category.pool[Math.floor(Math.random() * category.pool.length)];

    let src = "";
    if (category.type === "troop") src = `https://assets.clashk.ing/troops/${entity}/icon.webp`;
    if (category.type === "hero") src = `https://assets.clashk.ing/heroes/${entity}/icon.webp`;
    if (category.type === "pet") src = `https://assets.clashk.ing/pets/${entity}/icon.webp`;
    if (category.type === "equipment") src = `https://assets.clashk.ing/equipment/${entity}.webp`;
    if (category.type === "building") src = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${entity}.webp`;

    return {
      id: i,
      src,
      size: Math.floor(Math.random() * 180) + 120,
      top: `${Math.floor(Math.random() * 100)}%`,
      left: `${Math.floor(Math.random() * 100)}%`,
      depth: Math.random() * 2 + 0.5,
      rotation: Math.floor(Math.random() * 60) - 30,
      pulseDuration: Math.random() * 4 + 3,
      pulseDelay: Math.random() * 10 + 1,
    };
  });
};

function SpatialAsset({ asset, mouseX, mouseY }) {
  const smoothX = useSpring(mouseX, { damping: 100, stiffness: 20, mass: 2 });
  const smoothY = useSpring(mouseY, { damping: 100, stiffness: 20, mass: 2 });

  const x = useTransform(smoothX, [0, 1920], [asset.depth * -60, asset.depth * 60]);
  const y = useTransform(smoothY, [0, 1080], [asset.depth * -60, asset.depth * 60]);

  return (
    <motion.div
      style={{ x, y, top: asset.top, left: asset.left, width: asset.size, height: asset.size }}
      initial={{ opacity: 0, rotateZ: asset.rotation, y: 50 }}
      animate={{ opacity: 1, rotateZ: asset.rotation + (asset.depth > 1.5 ? -15 : 15), y: -50 }}
      transition={{
        opacity: { duration: 3 },
        rotateZ: { duration: 40 + asset.depth * 10, repeat: Infinity, repeatType: "reverse", ease: "linear" },
        y: { duration: 30 + asset.depth * 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
      }}
      className="absolute pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
    >
      <img
        src={asset.src}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ filter: "grayscale(100%) brightness(0.3) contrast(1.2)" }}
        onError={(e) => (e.target.style.display = "none")}
      />
      <motion.img
        src={asset.src}
        className="absolute inset-0 w-full h-full object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: asset.pulseDuration, repeat: Infinity, repeatDelay: asset.pulseDelay, ease: "easeInOut" }}
        onError={(e) => (e.target.style.display = "none")}
      />
    </motion.div>
  );
}

export default function Login() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserProfile } = useVillage();

  // Modes: 'login' | 'register' | 'forgot' | 'reset' | 'verifying'
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const backgroundAssets = useMemo(() => generateAssets(8), []);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle /verify-email/:token and /reset-password/:token routes automatically
  useEffect(() => {
    if (location.pathname.startsWith("/verify-email/") && token) {
      setMode("verifying");
      setLoading(true);
      axios
        .get(`/api/auth/verify-email/${token}`)
        .then(async (res) => {
          if (res.data.token) {
            localStorage.setItem("coc_token", res.data.token);
            await fetchUserProfile();
            navigate("/dashboard");
          } else {
            setSuccessMsg(res.data.message || "Email verified! Please sign in.");
            setMode("login");
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Verification link expired or invalid.");
          setMode("login");
        })
        .finally(() => setLoading(false));
    } else if (location.pathname.startsWith("/reset-password/") && token) {
      setMode("reset");
    }
  }, [location.pathname, token, navigate, fetchUserProfile]);

  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await axios.post("/api/auth/login", { email, password });
        localStorage.setItem("coc_token", res.data.token);
        await fetchUserProfile();
        navigate("/dashboard");
      } else if (mode === "register") {
        const res = await axios.post("/api/auth/register", { email, password });
        setSuccessMsg(res.data.message || "Account created! Check your email to verify.");
        setPassword("");
      } else if (mode === "forgot") {
        const res = await axios.post("/api/auth/forgot-password", { email });
        setSuccessMsg(res.data.message || "Password reset link sent to your email.");
      } else if (mode === "reset") {
        const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
        setSuccessMsg(res.data.message || "Password updated! You can now sign in.");
        setMode("login");
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] bg-[#030304] overflow-hidden selection:bg-neutral-600/40"
    >
      {/* Cinematic Noir Film Grain */}
      <div
        className="absolute inset-0 z-50 pointer-events-none opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* Background Assets Field */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {backgroundAssets.map((asset) => (
          <SpatialAsset key={asset.id} asset={asset} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* The Dual-Layout Container */}
      <div className="relative z-10 w-full h-full min-h-[100dvh] max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between pt-12 lg:pt-0">
        {/* LEFT SECTION: Branding & Project Info */}
        <motion.div
          initial={isMobile ? { opacity: 0, y: -30 } : { opacity: 0, x: -60 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex-1 w-full px-8 sm:px-12 pb-12 lg:pb-0 flex flex-col justify-center max-w-2xl"
        >
          <div className="flex items-center gap-5 mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-[#0a0a0c] border border-neutral-800 flex items-center justify-center shadow-[inset_0_2px_20px_rgba(255,255,255,0.03)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-700/30 to-transparent opacity-50" />
              <Castle className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-300 relative z-10" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-[0.25em] uppercase font-serif">
                The Monolith
              </h1>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 tracking-[0.4em] uppercase font-semibold mt-1">
                Clan Intelligence
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1] tracking-tight">
              Track your <br />
              <span className="text-neutral-500 italic">Villages & Clans.</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
              A unified command terminal for multi-account progression tracking, building ETM calculations, and permanent Clan War League archives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 pt-6">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">MULTI-VILLAGE SYNC</span>
              </div>
              <div className="flex items-center gap-3">
                <Network className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">CWL INTERCEPTOR</span>
              </div>
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">ROLLING SNAPSHOTS</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">BUILDER ETM ENGINE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SECTION: The Authentication Form */}
        <motion.div
          initial={isMobile ? { opacity: 0, y: 100 } : { opacity: 0, x: 60 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={`w-full lg:w-[480px] z-10 ${isMobile ? "mt-auto" : "px-8"}`}
        >
          <div
            className={`w-full backdrop-blur-[40px] bg-[#08080a]/80 border border-neutral-800/60 p-8 sm:p-10 ${
              isMobile
                ? "rounded-t-[2.5rem] border-b-0 pb-12 shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.8)]"
                : "rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,1)]"
            }`}
          >
            {isMobile && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-800 rounded-full" />
            )}

            <div className="text-center mb-8 mt-2 sm:mt-0 relative z-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0a0a0c] border border-neutral-800/80 flex items-center justify-center shadow-[inset_0_2px_15px_rgba(255,255,255,0.02)]">
                <Swords className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                {mode === "login" && "Commander Access"}
                {mode === "register" && "Register Identity"}
                {mode === "forgot" && "Account Recovery"}
                {mode === "reset" && "Set New Password"}
                {mode === "verifying" && "Verifying Email..."}
              </h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-semibold mt-1.5">
                {mode === "login" && "Sign in to your syndicate profile"}
                {mode === "register" && "Link multiple villages under one account"}
                {mode === "forgot" && "Receive a reset link via email"}
                {mode === "reset" && "Enter your new security key"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {(mode === "login" || mode === "register") && (
              <div className="grid grid-cols-2 p-1 mb-6 bg-[#0a0a0c] border border-neutral-800/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                  className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    mode === "login" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                  className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    mode === "register" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-[#0a0a0c] border border-red-900/40 rounded-2xl flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0 animate-pulse" />
                <p className="text-[12px] text-red-300 font-medium">{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-[#0a0a0c] border border-emerald-900/40 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-emerald-300 font-medium">{successMsg}</p>
              </motion.div>
            )}

            {mode !== "verifying" && (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {mode !== "reset" && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-neutral-600 group-focus-within:text-neutral-300 transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="EMAIL ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-neutral-800/80 rounded-[1.25rem] pl-14 pr-4 py-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-500 focus:bg-[#0f0f12] transition-all font-mono text-[12px] tracking-wider shadow-inner"
                      required
                    />
                  </div>
                )}

                {mode !== "forgot" && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-neutral-600 group-focus-within:text-neutral-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      placeholder={mode === "reset" ? "NEW PASSWORD" : "PASSWORD"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-neutral-800/80 rounded-[1.25rem] pl-14 pr-4 py-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-500 focus:bg-[#0f0f12] transition-all font-mono text-[12px] tracking-wider shadow-inner"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-widest font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {mode === "forgot" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-widest font-bold"
                    >
                      &larr; Back to Sign In
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full h-[3.5rem] rounded-[1.25rem] overflow-hidden bg-white text-black font-bold text-[11px] uppercase tracking-[0.25em] hover:bg-neutral-200 disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === "login" && "Connect"}
                            {mode === "register" && "Create Profile"}
                            {mode === "forgot" && "Send Reset Link"}
                            {mode === "reset" && "Update Password"}
                          </span>
                          <ChevronRight className="h-3 w-3 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
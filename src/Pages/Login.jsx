import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Shield,
  Key,
  ChevronRight,
  Swords,
  Castle,
  Database,
  Network,
  History,
  Lock,
} from "lucide-react";
import axios from "axios";

// 1. The Procedural Asset Generator
const generateAssets = (count) => {
  const categories = [
    {
      type: "troop",
      pool: [
        "barbarian",
        "archer",
        "giant",
        "goblin",
        "balloon",
        "wizard",
        "dragon",
        "pekka",
        "electro_dragon",
        "yeti",
        "ice_golem",
      ],
    },
    {
      type: "hero",
      pool: [
        "barbarian_king",
        "archer_queen",
        "grand_warden",
        "royal_champion",
      ],
    },
    {
      type: "pet",
      pool: [
        "lassi",
        "electro_owl",
        "mighty_yak",
        "unicorn",
        "frosty",
        "diggy",
        "poison_lizard",
        "phoenix",
      ],
    },
    {
      type: "equipment",
      pool: ["giant_gauntlet", "frozen_arrow", "fireball", "rocket_backpack"],
    },
    { type: "building", pool: ["12", "13", "14", "15", "16"] },
  ];

  return Array.from({ length: count }).map((_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const entity =
      category.pool[Math.floor(Math.random() * category.pool.length)];

    let src = "";
    if (category.type === "troop")
      src = `https://assets.clashk.ing/troops/${entity}/icon.webp`;
    if (category.type === "hero")
      src = `https://assets.clashk.ing/heroes/${entity}/icon.webp`;
    if (category.type === "pet")
      src = `https://assets.clashk.ing/pets/${entity}/icon.webp`;
    if (category.type === "equipment")
      src = `https://assets.clashk.ing/equipment/${entity}.webp`;
    if (category.type === "building")
      src = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${entity}.webp`;

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

// 2. Autonomous Pulsing Spatial Asset
function SpatialAsset({ asset, mouseX, mouseY }) {
  const smoothX = useSpring(mouseX, { damping: 100, stiffness: 20, mass: 2 });
  const smoothY = useSpring(mouseY, { damping: 100, stiffness: 20, mass: 2 });

  const x = useTransform(
    smoothX,
    [0, 1920],
    [asset.depth * -60, asset.depth * 60],
  );
  const y = useTransform(
    smoothY,
    [0, 1080],
    [asset.depth * -60, asset.depth * 60],
  );

  return (
    <motion.div
      style={{
        x,
        y,
        top: asset.top,
        left: asset.left,
        width: asset.size,
        height: asset.size,
      }}
      initial={{ opacity: 0, rotateZ: asset.rotation, y: 50 }}
      animate={{
        opacity: 1,
        rotateZ: asset.rotation + (asset.depth > 1.5 ? -15 : 15),
        y: -50,
      }}
      transition={{
        opacity: { duration: 3 },
        rotateZ: {
          duration: 40 + asset.depth * 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        },
        y: {
          duration: 30 + asset.depth * 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
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
        transition={{
          duration: asset.pulseDuration,
          repeat: Infinity,
          repeatDelay: asset.pulseDelay,
          ease: "easeInOut",
        }}
        onError={(e) => (e.target.style.display = "none")}
      />
    </motion.div>
  );
}

export default function Login() {
  const [playerTag, setPlayerTag] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const backgroundAssets = useMemo(() => generateAssets(8), []);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0,
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  );

  const handleMouseMove = (e) => {
    if (isMobile) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        playerTag,
        apiToken,
      });

      // 1. Log the exact response to your browser console
      console.log("Backend Login Response:", response.data);

      // 2. Intelligently hunt for the token using common backend naming conventions
      const actualToken =
        response.data.token ||
        response.data.accessToken ||
        response.data.jwt ||
        (response.data.data && response.data.data.token) ||
        (typeof response.data === "string" ? response.data : null);

      if (!actualToken) {
        throw new Error(
          "Login successful, but frontend couldn't find the token in the response. Check console!",
        );
      }

      // 3. Save the valid token and route to dashboard
      localStorage.setItem("coc_token", actualToken);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          "Access Denied. Check credentials.",
      );
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
          <SpatialAsset
            key={asset.id}
            asset={asset}
            mouseX={mouseX}
            mouseY={mouseY}
          />
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
          {/* Logo Assembly */}
          <div className="flex items-center gap-5 mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-[#0a0a0c] border border-neutral-800 flex items-center justify-center shadow-[inset_0_2px_20px_rgba(255,255,255,0.03)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-700/30 to-transparent opacity-50" />
              <Castle
                className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-300 relative z-10"
                strokeWidth={1.5}
              />
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

          {/* Project Body */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1] tracking-tight">
              Track your <br />
              <span className="text-neutral-500 italic">Village & Clan.</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
              A secure, immutable Progressive Web Application designed for
              advanced clan management. Bypass standard REST restrictions and
              permanently archive your progression data.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 pt-6">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">
                  IMMUTABLE REGISTRY
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Network className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">
                  CWL INTERCEPTOR
                </span>
              </div>
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">
                  PROGRESSION SNAPSHOTS
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-neutral-600" />
                <span className="text-[11px] text-neutral-300 tracking-[0.1em] font-semibold">
                  JWT ENCRYPTION
                </span>
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
            {/* Mobile Pull Indicator */}
            {isMobile && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-800 rounded-full" />
            )}

            <div className="text-center mb-10 mt-2 sm:mt-0 relative z-10">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#0a0a0c] border border-neutral-800/80 flex items-center justify-center shadow-[inset_0_2px_15px_rgba(255,255,255,0.02)]">
                <Swords
                  className="w-6 h-6 text-neutral-400"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                Chief Identity
              </h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-semibold mt-2">
                Verify Village Link
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-[#0a0a0c] border border-red-900/30 rounded-2xl flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 animate-pulse" />
                <p className="text-[12px] text-neutral-400 font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-neutral-600 group-focus-within:text-neutral-300 transition-colors duration-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="PLAYER TAG (#XXXX)"
                    value={playerTag}
                    onChange={(e) => setPlayerTag(e.target.value.toUpperCase())}
                    className="w-full bg-[#0a0a0c] border border-neutral-800/80 rounded-[1.25rem] pl-14 pr-4 py-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-500 focus:bg-[#0f0f12] transition-all font-mono text-[12px] tracking-widest shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-neutral-600 group-focus-within:text-neutral-300 transition-colors duration-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="API TOKEN"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-neutral-800/80 rounded-[1.25rem] pl-14 pr-4 py-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-500 focus:bg-[#0f0f12] transition-all font-mono text-[12px] tracking-widest shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
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
                        <span>Connect</span>
                        <ChevronRight className="h-3 w-3 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

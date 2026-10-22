import { useLocation } from 'react-router';
import { motion } from 'framer-motion';

const LANDSCAPE_BY_ROUTE = {
  '/dashboard': 'https://assets.clashk.ing/landscape/home-landscape.png',
  '/dashboard/war-stats': 'https://assets.clashk.ing/landscape/war-stats.png',
  '/dashboard/clan': 'https://assets.clashk.ing/landscape/clan-landscape.png',
  '/dashboard/wars': 'https://assets.clashk.ing/landscape/war-landscape.jpg',
  '/dashboard/cwl': 'https://assets.clashk.ing/landscape/cwl-landscape.png',
  '/dashboard/games': 'https://assets.clashk.ing/landscape/achievement-landscape.png',
  '/dashboard/capital': 'https://assets.clashk.ing/landscape/clan-capital-landscape.png'
};

export default function RouteLandscape() {
  const { pathname } = useLocation();
  const bgUrl =
    LANDSCAPE_BY_ROUTE[pathname] ||
    'https://assets.clashk.ing/landscape/home-landscape.png';

  return (
    <div className="fixed top-0 left-0 lg:left-[290px] right-0 h-[320px] sm:h-[440px] pointer-events-none z-0 overflow-hidden">
      <motion.div
        key={bgUrl}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 0.48, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full h-full bg-cover bg-center mix-blend-screen"
        style={{
          backgroundImage: `url('${bgUrl}')`,
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%)'
        }}
      />
    </div>
  );
}
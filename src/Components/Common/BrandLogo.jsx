import CL1 from '../../assets/Logos/CL1.webp';
import CL2 from '../../assets/Logos/CL2.webp';
import CL1Mobile from '../../assets/Logos/CL1Mobile.webp';
import CL2Mobile from '../../assets/Logos/CL2Mobile.webp';
import CLText from '../../assets/Logos/CLText.webp';

// Switch between 1 (Purple Flasks) and 2 (Gold Bars)
const ACTIVE_VARIANT = 1;

export const LOGO_ASSETS = {
  full: ACTIVE_VARIANT === 1 ? CL1 : CL2,
  monogram: ACTIVE_VARIANT === 1 ? CL1Mobile : CL2Mobile,
  text: CLText
};

export default function BrandLogo({
  variant = 'desktop', // 'desktop' | 'mobile-bar' | 'mobile-login'
  showMotto = true,
  className = ''
}) {
  if (variant === 'mobile-bar') {
    return (
      <div className={`flex items-center justify-between w-full ${className}`}>
        <div className="flex items-center gap-2">
          {/* <img
            src={LOGO_ASSETS.monogram}
            alt="CL"
            className="h-7 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
          /> */}
          <img
            src={LOGO_ASSETS.text}
            alt="ClashLab"
            className="h-4 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
          />
        </div>
        {showMotto && (
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-300/80">
            Clash Intel, Refined
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Cropped Monogram */}
      <img
        src={LOGO_ASSETS.monogram}
        alt="CL Monogram"
        className={
          variant === 'mobile-login'
            ? 'h-12 w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)]'
            : 'h-11 w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)]'
        }
      />
      {/* ClashLab Text Image (Wider/Bigger than Monogram on Desktop & Login) */}
      <img
        src={LOGO_ASSETS.text}
        alt="ClashLab"
        className={
          variant === 'mobile-login'
            ? 'h-6 w-auto object-contain mt-1.5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]'
            : 'h-7 sm:h-8 w-auto object-contain mt-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]'
        }
      />
      {showMotto && (
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.26em] text-cyan-300/85 mt-1.5">
          Clash Intel, Refined
        </p>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CONSUMER_BRAND_LOGO, logoFallback } from "@/shared/constants/brandLogo";

export const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation from 0 to 100% over ~2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] w-full h-full bg-white text-slate-900 flex flex-col justify-between items-center p-6 select-none overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-[440px] w-[440px] rounded-full bg-teal-100/40 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full bg-emerald-100/40 blur-[110px]" />
      </div>

      {/* Top Header Tag */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="pt-6 flex items-center gap-2 z-10"
      >
        <span className="h-0.5 w-6 rounded-full bg-teal-500" />
        <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-teal-700 font-montserrat">
          Reflect / Technology
        </span>
        <span className="h-0.5 w-6 rounded-full bg-teal-500" />
      </motion.div>

      {/* Center Hero Logo & Typography */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 0.6,
          }}
          className="mb-6 flex items-center justify-center"
        >
          <img
            alt="Appzeto"
            className="h-20 sm:h-24 w-auto max-w-[280px] object-contain drop-shadow-sm"
            src={CONSUMER_BRAND_LOGO}
            onError={logoFallback}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-montserrat font-bold text-sm sm:text-base text-slate-800 tracking-wide"
        >
          Everything in One App
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xs text-slate-500 mt-1 tracking-wide font-medium"
        >
          Food • Rides • Hotels • Tours
        </motion.p>
      </div>

      {/* Bottom Progress Bar & Skip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-6"
      >
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>

        <div className="w-full flex justify-between items-center text-xs text-slate-500 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
            Loading Appzeto...
          </span>

          <button
            onClick={() => onFinish && onFinish()}
            className="text-teal-600 hover:text-teal-700 font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer"
          >
            Skip →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

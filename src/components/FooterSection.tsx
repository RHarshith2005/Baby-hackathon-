import React, { useSyncExternalStore } from 'react';
import { formatOdometerDigits } from '../game/packetRules';
import { subscribeHellos, getHellosSnapshot } from '../utils/hellosStore';

export const FooterSection: React.FC = React.memo(() => {
  const hellosDelivered = useSyncExternalStore(subscribeHellos, getHellosSnapshot, () => 4042);
  const digits = formatOdometerDigits(hellosDelivered, 6);

  const handleScrollToWishWall = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const wishWallEl = document.getElementById('wish-wall') || document.getElementById('work');
    if (wishWallEl) {
      wishWallEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#1B1B3A] text-[#FFF8EE] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-t-4 border-[#1B1B3A] relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Retro-Web Touch #3: Hit-Counter Odometer ("Hellos delivered") */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-[#282854] px-6 py-4 rounded-3xl border-3 border-[#9FF3D3]/60 shadow-xl">
          <span className="font-rounded font-bold text-sm sm:text-base uppercase tracking-wider text-[#9FF3D3]">
            HELLOS DELIVERED
          </span>
          <div
            className="flex items-center gap-1.5"
            aria-label={`${hellosDelivered} hellos delivered`}
          >
            {digits.map((d, idx) => (
              <span
                key={idx}
                className="w-9 h-11 sm:w-10 sm:h-12 rounded-xl bg-[#12122B] border-2 border-[#FFF0B3] font-mono-retro font-bold text-xl sm:text-2xl text-[#FFF0B3] flex items-center justify-center shadow-inner"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Giant Stacked "PINGLET" */}
        <div>
          <h2 className="font-display text-7xl sm:text-9xl md:text-[10.5rem] leading-[0.84] tracking-tight text-[#9FF3D3] uppercase select-none">
            PINGLET
          </h2>
          <p className="font-rounded font-semibold text-lg sm:text-xl text-[#FFC9A8] mt-2">
            &ldquo;I carry little hellos across the wires.&rdquo;
          </p>
        </div>

        {/* Normal "Send a hello" Button (Scrolls to Wish Wall) */}
        <div>
          <a
            href="#wish-wall"
            onClick={handleScrollToWishWall}
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#9FF3D3] hover:bg-[#88efd0] text-[#1B1B3A] font-rounded font-bold text-sm sm:text-base uppercase tracking-wider border-3 border-[#1B1B3A] toy-button-gloss cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#9FF3D3]"
          >
            💌 SEND A HELLO
          </a>
        </div>

        {/* Concise Credits */}
        <div className="border-t border-white/15 pt-6 text-xs sm:text-sm font-rounded text-[#FFF8EE]/80 space-y-1.5">
          <p>
            <strong>Fonts:</strong> Bebas Neue, Fredoka &amp; Space Mono ·{' '}
            <strong>Libraries:</strong> React, Tailwind CSS, Framer Motion &amp; Web Audio API
          </p>
          <p className="text-[#FFF0B3] font-semibold">
            Character art generated with Gemini · Original character Pinglet (#0404)
          </p>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';

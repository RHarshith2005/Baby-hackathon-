import React from 'react';
import { Heart, Globe, Sparkles, ExternalLink, Mail, Disc } from 'lucide-react';
import { audioSystem } from '../utils/audioSynth';

interface FooterSectionProps {
  onTriggerEasterEgg: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onTriggerEasterEgg,
}) => {
  return (
    <footer className="w-full bg-[#121224] text-[#FFF8EE] p-8 sm:p-12 md:p-16 border-t-4 border-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Giant PINGLET Heading */}
        <div className="text-center">
          <span className="font-mono-retro text-xs sm:text-sm text-[#9FF3D3] uppercase tracking-widest block mb-2">
            // TERMINAL SESSION TERMINATION // #0404
          </span>
          <h2 className="font-display text-7xl sm:text-9xl md:text-[11rem] leading-[0.85] tracking-tight text-[#9FF3D3] select-none hover:text-[#B9A7FF] transition-colors">
            PINGLET
          </h2>
          <p className="font-mono-retro text-sm sm:text-base text-[#FFF8EE]/70 mt-4">
            &ldquo;I carry little hellos across the wires.&rdquo;
          </p>
        </div>

        {/* Retro Webring Box */}
        <div className="bg-[#1B1B3A] p-6 rounded-2xl border-3 border-[#B9A7FF]/40 max-w-2xl mx-auto text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B9A7FF] text-[#1B1B3A] text-xs font-mono-retro font-bold uppercase rounded-sm">
            <Globe className="w-3.5 h-3.5" /> [ - THE RETRO PACKET WEBRING - ]
          </div>
          <p className="font-body text-xs sm:text-sm text-[#FFF8EE]/85 max-w-md mx-auto">
            You are currently visiting Site <strong>#0404</strong> of the Old Web Courier Ring. Connecting vintage attic modems and forgotten telephone lines since 1999.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono-retro text-xs font-bold pt-1">
            <button
              onClick={() => {
                audioSystem.playTone(392, 0.1, 'sine');
                alert('Navigating to previous webring node: #0403 (BBS Attic Archives)');
              }}
              className="px-4 py-2 bg-[#26264d] hover:bg-[#343466] border border-white/20 rounded-lg text-[#9FF3D3] transition-all cursor-pointer"
            >
              ◄ PREV NODE
            </button>
            <span className="px-4 py-2 bg-[#9FF3D3] text-[#1B1B3A] rounded-lg shadow-xs">
              PACKET-RING #0404
            </span>
            <button
              onClick={() => {
                audioSystem.playTone(523.25, 0.1, 'sine');
                alert('Navigating to next webring node: #0405 (Dial-Up Lullaby Station)');
              }}
              className="px-4 py-2 bg-[#26264d] hover:bg-[#343466] border border-white/20 rounded-lg text-[#9FF3D3] transition-all cursor-pointer"
            >
              NEXT NODE ►
            </button>
            <button
              onClick={onTriggerEasterEgg}
              className="px-3 py-2 bg-[#FFB088] hover:bg-[#ffa072] text-[#1B1B3A] rounded-lg transition-all cursor-pointer"
              title="Trigger dial-up hug surprise"
            >
              ✉ RANDOM MAIL
            </button>
          </div>
        </div>

        {/* 88x31 Retro Web Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Badge 1 */}
          <div className="w-[120px] h-[36px] bg-black border-2 border-zinc-500 flex items-center justify-between px-2 font-mono-retro text-[9px] text-white">
            <span className="text-[#9FF3D3] font-bold">800x600</span>
            <span className="text-zinc-400">BEST VIEW</span>
          </div>

          {/* Badge 2 */}
          <div className="w-[120px] h-[36px] bg-[#1B1B3A] border-2 border-[#9FF3D3] flex items-center justify-center px-1 font-mono-retro text-[9px] text-[#9FF3D3] font-bold">
            CRT GLOW OK
          </div>

          {/* Badge 3 */}
          <div className="w-[120px] h-[36px] bg-[#3B1C52] border-2 border-[#B9A7FF] flex items-center justify-center px-1 font-mono-retro text-[9px] text-[#B9A7FF] font-bold">
            56K DIAL-UP READY
          </div>

          {/* Badge 4 */}
          <div className="w-[120px] h-[36px] bg-[#2E3B1C] border-2 border-[#9FF3D3] flex items-center justify-center px-1 font-mono-retro text-[9px] text-[#9FF3D3] font-bold">
            ZERO BIT-ROT
          </div>

          {/* Badge 5 */}
          <div className="w-[120px] h-[36px] bg-[#471E1E] border-2 border-[#FFB088] flex items-center justify-center px-1 font-mono-retro text-[9px] text-[#FFB088] font-bold">
            NO SPIDERS ALLOWED
          </div>
        </div>

        {/* Credits Section */}
        <div className="border-t border-white/10 pt-8 grid sm:grid-cols-3 gap-6 text-xs font-mono-retro text-[#FFF8EE]/70">
          <div>
            <span className="text-[#9FF3D3] font-bold block mb-1 uppercase">TYPOGRAPHY</span>
            <p>Bebas Neue (Headings) & Space Mono (Courier Data) via Google Fonts.</p>
          </div>

          <div>
            <span className="text-[#B9A7FF] font-bold block mb-1 uppercase">3D & GRAPHICS</span>
            <p>Three.js procedural soft-clay vinyl PBR rendering, Studio RoomEnvironment & inline SVG.</p>
          </div>

          <div>
            <span className="text-[#FFB088] font-bold block mb-1 uppercase">SYNTHESIS & AUDIO</span>
            <p>Web Audio API pentatonic sine/triangle procedural generator. Zero audio sample files.</p>
          </div>
        </div>

        {/* Bottom copyright / sign-off */}
        <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-retro text-[#FFF8EE]/50">
          <span>Pinglet the Ghost © 1999–2026. Hand-delivering little hellos.</span>
          <span>BORN AT 3:00 AM • TRANSMISSION COMPLETE</span>
        </div>
      </div>
    </footer>
  );
};

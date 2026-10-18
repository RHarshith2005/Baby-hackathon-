import React, { useState, useEffect } from 'react';
import { Send, Heart, Stamp, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { audioSystem } from '../utils/audioSynth';

interface WishMessage {
  id: string;
  sender: string;
  message: string;
  stamp: string;
  timestamp: string;
}

const DEFAULT_MESSAGES: WishMessage[] = [
  {
    id: 'm-1',
    sender: 'dialup_dreamer',
    message: 'I stayed up waiting for your AIM away message to change into lyric quotes.',
    stamp: '56K-STAMP',
    timestamp: '3:04 AM',
  },
  {
    id: 'm-2',
    sender: 'attic_phosphor',
    message: 'Mom, please do not pick up the telephone! I am downloading a 320x240 image!',
    stamp: 'CRT-GLOW',
    timestamp: '3:12 AM',
  },
  {
    id: 'm-3',
    sender: 'quiet_stars',
    message: 'To whoever is reading this in the dark: Pinglet is keeping your little hello safe.',
    stamp: 'MIDNIGHT',
    timestamp: '3:29 AM',
  },
];

export const WishWall: React.FC = () => {
  const [messages, setMessages] = useState<WishMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pinglet_wishes');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEFAULT_MESSAGES;
        }
      }
    }
    return DEFAULT_MESSAGES;
  });

  const [inputSender, setInputSender] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedStamp, setSelectedStamp] = useState('56K-STAMP');
  const [justSent, setJustSent] = useState(false);

  const stamps = [
    { id: '56K-STAMP', label: '56k Modem', icon: '📞' },
    { id: 'CRT-GLOW', label: 'CRT Glow', icon: '📺' },
    { id: 'MIDNIGHT', label: 'Midnight Attic', icon: '🌙' },
    { id: 'BABY-GHOST', label: 'Pinglet Hug', icon: '👻' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: WishMessage = {
      id: `w-${Date.now()}`,
      sender: inputSender.trim() || 'Anonymous Courier',
      message: inputMessage.trim(),
      stamp: selectedStamp,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pinglet_wishes', JSON.stringify(updated.slice(0, 30)));
    }

    setInputMessage('');
    setInputSender('');
    setJustSent(true);
    audioSystem.playTone(523.25, 0.2, 'triangle');
    setTimeout(() => audioSystem.playTone(659.25, 0.35, 'sine'), 100);

    setTimeout(() => setJustSent(false), 3500);
  };

  return (
    <div className="w-full bg-[#1B1B3A] text-[#FFF8EE] rounded-3xl p-5 sm:p-7 md:p-8 border-4 border-[#FFB088]/40 shadow-2xl relative overflow-hidden">
      {/* Corner retro tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-mono-retro tracking-widest uppercase">
        <span className="px-3 py-1 bg-[#FFB088] text-[#1B1B3A] font-bold rounded-sm flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> [ - WORK 03 : THE WISH WALL - ]
        </span>
        <span className="text-[#9FF3D3] bg-[#1B1B3A] px-3 py-1 border border-[#9FF3D3]/30 rounded-sm">
          UNSENT HELLOS PROTOCOL OK
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-[#24244a] p-5 sm:p-6 rounded-2xl border border-white/10">
          <h3 className="font-display text-3xl sm:text-4xl text-[#FFB088] mb-1">
            HAND-DELIVER AN UNSENT HELLO
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#FFF8EE]/80 mb-4">
            Type a quiet thought, an old unsent draft, or a gentle hello into Pinglet&apos;s courier pouch.
          </p>

          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label htmlFor="courier-name" className="block text-[11px] font-mono-retro uppercase tracking-wider text-[#9FF3D3] mb-1">
                Your Handle / Alias (optional)
              </label>
              <input
                id="courier-name"
                type="text"
                value={inputSender}
                onChange={(e) => setInputSender(e.target.value)}
                placeholder="e.g. wire_wanderer"
                maxLength={25}
                className="w-full px-3 py-2 bg-[#12122b] border border-white/20 rounded-lg text-sm font-mono-retro text-white focus:outline-hidden focus:border-[#9FF3D3]"
              />
            </div>

            <div>
              <label htmlFor="courier-message" className="block text-[11px] font-mono-retro uppercase tracking-wider text-[#B9A7FF] mb-1">
                Unsent Message / Hello
              </label>
              <textarea
                id="courier-message"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Write your hello here..."
                required
                rows={3}
                maxLength={180}
                className="w-full px-3 py-2 bg-[#12122b] border border-white/20 rounded-lg text-sm font-body text-white focus:outline-hidden focus:border-[#B9A7FF] resize-none"
              />
              <span className="text-[10px] font-mono-retro text-white/40 float-right">
                {180 - inputMessage.length} chars left
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-mono-retro uppercase tracking-wider text-[#FFB088] mb-1.5">
                Postal Seal Stamp
              </span>
              <div className="grid grid-cols-2 gap-2">
                {stamps.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStamp(st.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono-retro flex items-center gap-1.5 border cursor-pointer transition-all ${
                      selectedStamp === st.id
                        ? 'bg-[#FFB088] text-[#1B1B3A] border-[#FFF8EE] font-bold shadow-xs'
                        : 'bg-[#181836] text-[#FFF8EE]/80 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span className="truncate">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-[#FFB088] hover:bg-[#ffa072] text-[#1B1B3A] font-display text-2xl tracking-wider rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-5 h-5 fill-current" /> DISPATCH TO WIRES
            </button>

            {justSent && (
              <div className="p-3 bg-[#9FF3D3]/20 border border-[#9FF3D3] text-[#9FF3D3] rounded-lg text-xs font-mono-retro flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Pinglet folded your message and set off into the attic!</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Stream Column */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3 text-xs font-mono-retro text-[#9FF3D3]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFB088]" />
              <span>LIVE PACKET STREAM ({messages.length} HELLOS)</span>
            </span>
            <span className="text-[#FFF8EE]/50">3:00 AM BUFFER</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className="bg-[#212142] p-4 rounded-xl border border-white/10 hover:border-[#9FF3D3]/40 transition-all relative overflow-hidden"
              >
                {/* Vintage postal stamp in top-right */}
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#FFF8EE] text-[#1B1B3A] text-[10px] font-mono-retro font-bold rounded-xs border border-dashed border-[#1B1B3A]/40 uppercase shadow-xs">
                  {m.stamp}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9FF3D3]" />
                  <span className="font-mono-retro font-bold text-xs text-[#9FF3D3]">
                    @{m.sender}
                  </span>
                  <span className="text-[10px] font-mono-retro text-white/40">
                    • {m.timestamp}
                  </span>
                </div>

                <p className="font-body text-sm text-[#FFF8EE]/90 leading-relaxed pr-16">
                  &ldquo;{m.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

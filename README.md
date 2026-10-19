# 👻 Pinglet — Junior Packet Courier of the Old Web

> *"I carry little hellos across the wires."*

[![Node.js Tests](https://img.shields.io/badge/tests-11%20passed-9FF3D3?style=flat-square&logo=node.js&logoColor=1B1B3A)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/react-19.0-B9A7FF?style=flat-square&logo=react&logoColor=1B1B3A)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-FFC9A8?style=flat-square&logo=three.js&logoColor=1B1B3A)](https://threejs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-9FF3D3?style=flat-square&logo=tailwindcss&logoColor=1B1B3A)](https://tailwindcss.com)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural%20Synth-FFF0B3?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

A mobile-first, scroll-driven character portfolio and interactive web experience for **Pinglet**: an original designer-toy baby ghost made of static, CRT glow, and translucent mint-to-lavender jelly resin. Pinglet hand-delivers lost messages and unsent hellos across forgotten phone lines.

---

## 🎨 Visual Identity & Toy Aesthetic

- **Soft-Clay Vinyl Look**: Pillowy rounded forms, translucent gradient materials, soft studio lighting, subtle drop shadows, and oversized glossy anime eyes with twin white specular highlights.
- **Color Palette**:
  - `Mint` `#9FF3D3` — Primary body glow & signature panels
  - `Lavender` `#B9A7FF` — Translucent rim shading & evening sky
  - `Cream` `#FFF8EE` — Parchment paper, dossiers, and wish cards
  - `Midnight Navy` `#1B1B3A` — CRT dark mode, chassis, and crisp retro borders
  - `Peach` `#FFC9A8` & `Butter Yellow` `#FFF0B3` — Candy stars & warm sunset accents
  - `Raspberry` `#E86FA0` — Pixel heart blush cheeks and wax seals
- **Typography**:
  - **Bebas Neue** — Giant stacked uppercase condensed headings
  - **Fredoka** — Friendly pillowy captions under 15 words
  - **Space Mono** — Retro modem headers, odometer readouts, and dossier specs

---

## 📦 Sections & Features

### 1. Hero Section
- Oversized ghosted background word `HELLO` with giant stacked condensed `PINGLET` title.
- **Interactive Three.js 3D Model**: Soft-clay baby ghost with antenna LED tufts, wavy ghost skirt, and glossy eyes that track the cursor (or touch tap on mobile).
- Real-time mood switcher that updates Pinglet's 3D pose, antenna glow, and blush expressions.

### 2. Meet Pinglet (Dossier & Character Sheet)
- A collectible blind-box style dossier card detailing Pinglet's 5 core attributes:
  1. **Name**: Pinglet (`/pɪŋ-lɪt/`)
  2. **Identity**: Baby ghost made of static and CRT glow
  3. **Role**: Junior Packet Courier (Badge #0404)
  4. **Story**: Born at 3:00 a.m. when a dial-up handshake echoed through an attic computer
  5. **Tagline**: *"I carry little hellos across the wires."*
- Includes a live 6-digit odometer tracking "Hellos Delivered".

### 3. Moods Showcase
- Four alternating color-blocked toy panels:
  - 🙈 **SHY**: Peeking behind pale circular arcs with soft lavender lighting
  - ✨ **EXCITED**: Arms raised in celebration surrounded by floating candy stars
  - 💤 **SLEEPY**: Resting with closed eyes and rhythmic breathing pulses
  - ⚡ **GLITCHY**: Static scanlines, RGB chromatic aberration split, and modem noise
- Direct interactive buttons to activate any mood on the primary 3D model.

### 4. Interactive Work Panels
- 🎵 **Dial-Up Lullaby**:
  - Procedural soundboard and automatic melody box synthesized entirely via the **Web Audio API**.
  - Uses pure sine and triangle blips on a pentatonic scale (`C4`, `D4`, `E4`, `G4`, `A4`, `C5`).
  - Zero external MP3/audio files; strictly user-gesture activated.
- 🍬 **Catch the Packets (Mini-Game)**:
  - 20-second touch-friendly tap game with falling candy-wrapped data envelopes (`HELLO`, `56K`, `ACK`, `PING`).
  - Live scoring, streak combo multipliers, and reactive mood changes.
  - **Canvas-based Data-Packet Particle System**: Completing a round triggers a vibrant celebratory burst of data-packet icons (candy envelopes, datagrams, microchips, and glossy 3D stars).
- 💌 **The Wish Wall**:
  - Visitors can type unsent hellos, select a vintage postal stamp (`56K Handshake`, `Attic Sparkle`, `Baud Heart`), and pin them to a persistent sticker board saved to `localStorage`.

### 5. Story Chapters (Parallax Scroll)
- Four scroll-driven narrative vignettes:
  - *Chapter 01: The Forgotten Attic*
  - *Chapter 02: The Handshake*
  - *Chapter 03: The First Hello*
  - *Chapter 04: Across the Glowing Town*
- Dynamic gradient transition moving from warm twilight dusk to midnight CRT glow.

### 6. Retro Web Footer & Easter Egg
- Giant stacked `PINGLET` footer with retro 88x31 GIF-style badges (*"Best viewed in 800x600"*, *"No Spiders Allowed"*).
- Classic **Junior Web Courier Ring** with Prev / Random / Next controls.
- 🕵️ **Hidden Easter Egg**: Tap the blinking modem status LED in the header 3 times to trigger a dial-up handshake glitch sequence and reveal a secret letter: *"You've got mail: a hug."*

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 (`@import "tailwindcss";`, `@theme` tokens) |
| **3D Rendering** | Three.js PBR materials, procedural geometry, `RoomEnvironment` |
| **Vector Fallback** | Inline SVG with radial gradients, inner highlights, and drop shadows |
| **Audio Engine** | Web Audio API procedural synthesis (`sine` / `triangle` oscillators) |
| **Particles** | HTML5 2D Canvas with sub-pixel DPR scaling & delta-time physics |
| **Testing** | Node.js 22 built-in test runner (`node:test`, `node:assert/strict`) |

### 7. Extras & Advanced Features
- 📖 **Courier Passport**: Bottom-left badge tracking collected postal stamps. Awards stamps for talking, petting, poking, feeding, switching to night mode, achieving high scores in Catch Packets, pinning wishes, finishing the story, and finding the secret Easter egg. Collecting all 10 unlocks a Master Courier certificate PNG renderer!
- 🍬 **Pocket-Pet Care & Greeting**: Tummy, Cozy, and Joy care meters that decay on load based on timestamps. Feeding, petting, and playing fills the meters and triggers sparkle auras, returning-visitor greetings, and haptic feedback.
- 💌 **Hello Card Postcard Creator**: Modal allowing visitors to type a custom hello (up to 70 chars), choose a vintage postal stamp, and render a high-resolution 1080x1350 postcard with PNG download and Web Share support.
- 🎹 **Lullaby Composer**: Extended Dial-Up Lullaby panel featuring an 8-step by 6-note pentatonic grid composer, tempo slider, and shareable URL hash encoding.
- 📺 **Dial-Up Boot Screen**: First-visit-only CRT-style 56K connection boot overlay with progress bar and skip button.
- 🦗 **Night Sounds**: Ambient crickets and wind synthesizer toggle for sleepy/night moods.

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pinglet-portfolio

# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server on http://localhost:3000
npm run dev
```

### Run Unit Tests

All pure calculations, game rules, scoring multipliers, particle physics, and audio scale frequencies are decoupled and covered by unit tests using Node's native test runner:

```bash
node --test
```

### Production Build

```bash
# Build production bundle
npm run build
```

---

## ♿ Accessibility & Performance

- **Prefers-Reduced-Motion**: Automatically disables 3D bobbing, minimizes particle count and spread velocity, and simplifies CSS transitions for sensitive users.
- **Audio Controls**: Global accessible mute toggle in the navigation header with instant audio cut-off.
- **Touch-Friendly Targets**: All tappable packets, stamps, and buttons adhere to minimum 48px touch guidelines.
- **Zero Audio Footprint**: 100% procedurally synthesized Web Audio blips for zero bandwidth overhead.

---

## 📜 Credits & License

- **Character Concept & Direction**: Pinglet — Junior Packet Courier of the Old Web
- **Art & Procedural Visuals**: 3D clay-render procedural Three.js shaders & inline SVG vector art
- **Audio**: Web Audio API Pentatonic Synthesizer
- **Fonts**: *Bebas Neue*, *Fredoka*, and *Space Mono* (via Google Fonts)
- **License**: Apache-2.0

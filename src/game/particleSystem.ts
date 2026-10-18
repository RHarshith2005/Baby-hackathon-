/**
 * Pure physics and state updates for the data-packet particle system.
 * Decoupled from canvas and DOM for deterministic unit testing.
 */

export type PacketIconType = 'envelope' | 'datagram' | 'star' | 'chip';

export interface DataPacketParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  alpha: number;
  life: number;     // 0 to 1 (1 = fresh, 0 = expired)
  maxLife: number;  // total lifespan in seconds
  age: number;      // current age in seconds
  color: string;
  accentColor: string;
  type: PacketIconType;
  label: string;
  width: number;
  height: number;
}

export const PACKET_LABELS = ['HELLO', '56K', 'ACK', 'SYN', 'PING', '0101', 'DAT', 'TXT'];
export const PACKET_COLORS = ['#9FF3D3', '#B9A7FF', '#FFC9A8', '#FFF0B3', '#E86FA0'];

export function createPacketBurst(
  count: number,
  originX: number,
  originY: number,
  spreadSpeed: number = 400
): DataPacketParticle[] {
  const particles: DataPacketParticle[] = [];

  for (let i = 0; i < count; i++) {
    // Angle in radians (full 360 or biased upwards)
    const angle = (Math.PI * 2 * (i / count)) + ((Math.random() - 0.5) * 0.5);
    // Upward bias
    const speed = (0.4 + Math.random() * 0.8) * spreadSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - (120 + Math.random() * 150);

    const typeRoll = Math.random();
    let type: PacketIconType = 'envelope';
    if (typeRoll < 0.45) {
      type = 'envelope';
    } else if (typeRoll < 0.75) {
      type = 'datagram';
    } else if (typeRoll < 0.9) {
      type = 'star';
    } else {
      type = 'chip';
    }

    const color = PACKET_COLORS[i % PACKET_COLORS.length];
    const accent = PACKET_COLORS[(i + 2) % PACKET_COLORS.length];
    const label = PACKET_LABELS[i % PACKET_LABELS.length];
    const maxLife = 1.6 + Math.random() * 1.2;

    particles.push({
      id: `p-${Date.now()}-${i}`,
      x: originX,
      y: originY,
      vx,
      vy,
      rotation: (Math.random() - 0.5) * Math.PI,
      vRot: (Math.random() - 0.5) * 6,
      scale: 0.65 + Math.random() * 0.55,
      alpha: 1,
      life: 1,
      maxLife,
      age: 0,
      color,
      accentColor: accent,
      type,
      label,
      width: type === 'envelope' ? 38 : type === 'datagram' ? 44 : 26,
      height: type === 'envelope' ? 24 : type === 'datagram' ? 22 : 26,
    });
  }

  return particles;
}

/**
 * Updates a single particle physics state. Returns false if expired.
 */
export function updateParticle(
  particle: DataPacketParticle,
  dt: number,
  gravity: number = 320,
  drag: number = 0.96
): boolean {
  particle.age += dt;
  if (particle.age >= particle.maxLife) {
    particle.life = 0;
    particle.alpha = 0;
    return false;
  }

  // Update lifespan ratio
  particle.life = 1 - particle.age / particle.maxLife;

  // Fade out smoothly in the last 40% of life
  if (particle.life < 0.4) {
    particle.alpha = particle.life / 0.4;
  } else {
    // Pop in smoothly at start
    particle.alpha = Math.min(1, particle.age / 0.15);
  }

  // Apply physics
  particle.vy += gravity * dt;
  particle.vx *= Math.pow(drag, dt * 60);
  particle.vy *= Math.pow(drag, dt * 60);

  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;
  particle.rotation += particle.vRot * dt;

  return true;
}

/**
 * Updates an array of particles and removes expired ones.
 */
export function updateParticleSystem(
  particles: DataPacketParticle[],
  dt: number,
  gravity?: number,
  drag?: number
): DataPacketParticle[] {
  return particles.filter((p) => updateParticle(p, dt, gravity, drag));
}

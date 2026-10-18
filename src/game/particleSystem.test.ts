import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPacketBurst,
  updateParticle,
  updateParticleSystem,
  PACKET_LABELS,
  PACKET_COLORS,
} from './particleSystem.ts';

test('createPacketBurst generates requested count and valid particles', () => {
  const burst = createPacketBurst(15, 200, 300);
  assert.equal(burst.length, 15);

  for (const p of burst) {
    assert.equal(p.x, 200);
    assert.equal(p.y, 300);
    assert.ok(p.maxLife > 1);
    assert.ok(p.life === 1);
    assert.ok(p.alpha > 0);
    assert.ok(PACKET_COLORS.includes(p.color));
    assert.ok(PACKET_LABELS.includes(p.label));
    assert.ok(['envelope', 'datagram', 'star', 'chip'].includes(p.type));
  }
});

test('updateParticle moves particle and decays life', () => {
  const [p] = createPacketBurst(1, 100, 100);
  const initialY = p.y;
  const initialVx = p.vx;

  const alive = updateParticle(p, 0.1);
  assert.equal(alive, true);
  assert.ok(p.age > 0);
  assert.ok(p.life < 1);
  assert.notEqual(p.y, initialY);

  // Advance past maxLife
  const dead = updateParticle(p, p.maxLife + 1);
  assert.equal(dead, false);
  assert.equal(p.life, 0);
  assert.equal(p.alpha, 0);
});

test('updateParticleSystem filters out dead particles', () => {
  const burst = createPacketBurst(5, 50, 50);
  // Advance slightly
  const aliveAfterSmallDt = updateParticleSystem(burst, 0.1);
  assert.equal(aliveAfterSmallDt.length, 5);

  // Advance by 10 seconds -> all should be expired
  const aliveAfterLongDt = updateParticleSystem(burst, 10);
  assert.equal(aliveAfterLongDt.length, 0);
});

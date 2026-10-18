import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { PingletMood } from '../game/packetRules';

interface Pinglet3DProps {
  mood?: PingletMood;
  interactive?: boolean;
  className?: string;
  onBounce?: () => void;
  lookAtTarget?: { x: number; y: number } | null;
}

export const Pinglet3D: React.FC<Pinglet3DProps> = ({
  mood = 'shy',
  interactive = true,
  className = 'w-full h-full min-h-[380px]',
  onBounce,
  lookAtTarget,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<PingletMood>(mood);
  const targetPointerRef = useRef({ x: 0, y: 0 });
  const onBounceRef = useRef(onBounce);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    onBounceRef.current = onBounce;
  }, [onBounce]);

  useEffect(() => {
    if (lookAtTarget) {
      targetPointerRef.current = { ...lookAtTarget };
    }
  }, [lookAtTarget]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Headless / low-power detection
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean(navigator.webdriver) || /HeadlessChrome/i.test(navigator.userAgent));

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.8, 3.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    if (!isHeadless) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.appendChild(renderer.domElement);

    // Procedural RoomEnvironment for Studio PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lights
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(2.5, 4, 3);
    if (!isHeadless) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 512;
      keyLight.shadow.mapSize.height = 512;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xb9a7ff, 0x9ff3d3, 1.1);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x9ff3d3, 1.3);
    rimLight.position.set(-3, 2, -2.5);
    scene.add(rimLight);

    // Pinglet Main Group
    const pingletGroup = new THREE.Group();
    pingletGroup.position.set(0, 0, 0);
    scene.add(pingletGroup);

    // Procedural Mint-Lavender Gradient Canvas Texture for Soft-Clay Vinyl
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#9FF3D3'); // Mint top
    gradient.addColorStop(0.5, '#C4B5FD'); // Lavender mid
    gradient.addColorStop(1, '#B9A7FF'); // Rich lavender skirt
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle vinyl shine lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(128, 80, 60, 0, Math.PI * 2);
    ctx.fill();

    const bodyTexture = new THREE.CanvasTexture(canvas);
    bodyTexture.colorSpace = THREE.SRGBColorSpace;

    // Body Material: Glossy vinyl soft-clay finish
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      map: bodyTexture,
      roughness: 0.2,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      transmission: 0.25,
      ior: 1.45,
      thickness: 0.7,
      attenuationColor: new THREE.Color(0xb9a7ff),
      attenuationDistance: 2.0,
    });

    // 1. Primary Silhouette: Procedural Baby Ghost Body (Lathe Geometry for pillowy ghost shape)
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 1.3)); // Top crown
    points.push(new THREE.Vector2(0.32, 1.26));
    points.push(new THREE.Vector2(0.62, 1.08));
    points.push(new THREE.Vector2(0.80, 0.78)); // Cheek bulge
    points.push(new THREE.Vector2(0.78, 0.48)); // Belly
    points.push(new THREE.Vector2(0.84, 0.22)); // Flaring skirt
    points.push(new THREE.Vector2(0.89, 0.06)); // Skirt hem
    points.push(new THREE.Vector2(0.75, 0.0));  // Underside curl
    points.push(new THREE.Vector2(0, 0.0));

    const bodyGeometry = new THREE.LatheGeometry(points, 64);
    // Add procedural scalloped soft clay waves along the bottom hem
    const posAttr = bodyGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      if (y < 0.18) {
        const angle = Math.atan2(z, x);
        const wave = Math.sin(angle * 6) * 0.025;
        posAttr.setY(i, Math.max(0, y + wave));
      }
    }
    bodyGeometry.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = !isHeadless;
    bodyMesh.receiveShadow = !isHeadless;
    pingletGroup.add(bodyMesh);

    // 2. Eyes: Huge glossy vinyl eyes with anime kawaii highlights
    const eyeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1b1b3a,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    });

    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const eyeGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), eyeMaterial);
      eyeGlobe.scale.set(1, 1.2, 0.6);
      eyeGroup.add(eyeGlobe);

      // Main big glossy highlight
      const hlBig = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), highlightMat);
      hlBig.position.set(0.03, 0.05, 0.07);
      eyeGroup.add(hlBig);

      // Secondary tiny highlight dot
      const hlSmall = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), highlightMat);
      hlSmall.position.set(-0.04, -0.04, 0.07);
      eyeGroup.add(hlSmall);

      eyeGroup.position.set(isLeft ? -0.28 : 0.28, 0.72, 0.74);
      return eyeGroup;
    };

    const leftEye = createEye(true);
    const rightEye = createEye(false);
    pingletGroup.add(leftEye);
    pingletGroup.add(rightEye);

    // 3. Pixel-style blush cheeks
    const blushCanvas = document.createElement('canvas');
    blushCanvas.width = 64;
    blushCanvas.height = 64;
    const bCtx = blushCanvas.getContext('2d')!;
    bCtx.fillStyle = '#FFA07A';
    // 3 cute retro pixel blocks
    bCtx.fillRect(8, 20, 16, 14);
    bCtx.fillRect(24, 16, 16, 18);
    bCtx.fillRect(40, 20, 16, 14);

    const blushTex = new THREE.CanvasTexture(blushCanvas);
    blushTex.colorSpace = THREE.SRGBColorSpace;

    const blushMat = new THREE.MeshBasicMaterial({
      map: blushTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    const blushGeo = new THREE.PlaneGeometry(0.18, 0.14);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.46, 0.54, 0.65);
    leftBlush.rotation.set(-0.15, -0.4, 0);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.46, 0.54, 0.65);
    rightBlush.rotation.set(-0.15, 0.4, 0);

    pingletGroup.add(leftBlush);
    pingletGroup.add(rightBlush);

    // 4. Arms (Stubby soft clay arms)
    const armMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9ff3d3,
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.8,
    });

    const armGeo = new THREE.CapsuleGeometry(0.09, 0.22, 16, 16);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.7, 0.52, 0.25);
    const leftArmMesh = new THREE.Mesh(armGeo, armMaterial);
    leftArmMesh.position.set(0, -0.1, 0);
    leftArmGroup.add(leftArmMesh);
    pingletGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.7, 0.52, 0.25);
    const rightArmMesh = new THREE.Mesh(armGeo, armMaterial);
    rightArmMesh.position.set(0, -0.1, 0);
    rightArmGroup.add(rightArmMesh);
    pingletGroup.add(rightArmGroup);

    // 5. Dual LED Antenna Tufts
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b3a,
      roughness: 0.4,
      metalness: 0.8,
    });

    const createAntenna = (isLeft: boolean) => {
      const antennaGroup = new THREE.Group();
      antennaGroup.position.set(isLeft ? -0.18 : 0.18, 1.28, 0);

      // Curved stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.028, 0.28, 12);
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(0, 0.14, 0);
      stemMesh.rotation.z = isLeft ? 0.35 : -0.35;
      antennaGroup.add(stemMesh);

      // Glowing LED tip orb
      const ledMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x9ff3d3 : 0xb9a7ff,
        emissive: isLeft ? 0x9ff3d3 : 0xb9a7ff,
        emissiveIntensity: 1.8,
        roughness: 0.1,
      });

      const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), ledMat);
      ledMesh.position.set(isLeft ? -0.09 : 0.09, 0.29, 0);
      antennaGroup.add(ledMesh);

      return { group: antennaGroup, ledMesh, ledMat };
    };

    const leftAntenna = createAntenna(true);
    const rightAntenna = createAntenna(false);
    pingletGroup.add(leftAntenna.group);
    pingletGroup.add(rightAntenna.group);

    // 6. Contact Drop Shadow Plane directly beneath Pinglet
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const shadowGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
    shadowGrad.addColorStop(0, 'rgba(27, 27, 58, 0.45)');
    shadowGrad.addColorStop(0.5, 'rgba(27, 27, 58, 0.2)');
    shadowGrad.addColorStop(1, 'rgba(27, 27, 58, 0)');
    sCtx.fillStyle = shadowGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.08, 0);
    scene.add(shadowMesh);

    // Warm-up compilation
    renderer.compile(scene, camera);

    // Animation & Kinematics state
    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsedTime = 0;
    let bounceTime = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    // Pointer events for eye & head tracking
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointerRef.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      };
    };

    // Click bounce reaction
    const handleClick = () => {
      bounceTime = 1.0;
      if (onBounceRef.current) {
        onBounceRef.current();
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      elapsedTime += delta;
      const time = elapsedTime;
      const currentMood = moodRef.current;

      // Smooth pointer damping
      const targetX = targetPointerRef.current.x;
      const targetY = targetPointerRef.current.y;
      currentLookX += (targetX - currentLookX) * Math.min(1, delta * 8);
      currentLookY += (targetY - currentLookY) * Math.min(1, delta * 8);

      // Floating undulation
      const floatOffset = Math.sin(time * 2.2) * 0.08;
      const bounceOffset = bounceTime > 0 ? Math.sin((1 - bounceTime) * Math.PI) * 0.25 : 0;
      if (bounceTime > 0) {
        bounceTime = Math.max(0, bounceTime - delta * 2.5);
      }

      pingletGroup.position.y = 0.12 + floatOffset + bounceOffset;

      // Drop shadow expands and contracts with float
      const shadowScale = 1 - floatOffset * 2.5;
      shadowMesh.scale.set(shadowScale, shadowScale, 1);
      shadowMat.opacity = 0.45 - floatOffset * 1.5;

      // Rotate body slightly toward pointer
      pingletGroup.rotation.y = currentLookX * 0.35;
      pingletGroup.rotation.x = -currentLookY * 0.2;

      // Eye tracking & Expression according to mood
      if (currentMood === 'sleepy') {
        // Closed / sleepy eyes
        leftEye.scale.set(1, 0.2, 0.8);
        rightEye.scale.set(1, 0.2, 0.8);
        leftEye.position.y = 0.68;
        rightEye.position.y = 0.68;
        // Drooping arms
        leftArmGroup.rotation.set(0.1, 0, -0.2);
        rightArmGroup.rotation.set(0.1, 0, 0.2);
        // Dim slow antenna pulse
        const pulse = 0.6 + Math.sin(time * 1.5) * 0.4;
        leftAntenna.ledMat.emissiveIntensity = pulse;
        rightAntenna.ledMat.emissiveIntensity = pulse;
      } else if (currentMood === 'excited') {
        // Wide joyful eyes, looking around eagerly
        leftEye.scale.set(1.15, 1.25, 0.8);
        rightEye.scale.set(1.15, 1.25, 0.8);
        leftEye.rotation.set(currentLookY * 0.4, currentLookX * 0.5, 0);
        rightEye.rotation.set(currentLookY * 0.4, currentLookX * 0.5, 0);
        // Arms cheerfully raised up!
        leftArmGroup.rotation.set(0, 0, 2.1 + Math.sin(time * 6) * 0.2);
        rightArmGroup.rotation.set(0, 0, -2.1 - Math.sin(time * 6) * 0.2);
        // Fast blinking LED antennas
        const pulse = 2.0 + Math.sin(time * 10) * 1.0;
        leftAntenna.ledMat.emissiveIntensity = pulse;
        rightAntenna.ledMat.emissiveIntensity = pulse;
      } else if (currentMood === 'glitchy') {
        // Fast jitter & RGB split twitch
        const jitterX = (Math.random() - 0.5) * 0.05;
        const jitterY = (Math.random() - 0.5) * 0.05;
        pingletGroup.position.x = jitterX;
        pingletGroup.position.z = jitterY;
        leftEye.scale.set(1.1, 0.8 + Math.random() * 0.4, 0.8);
        rightEye.scale.set(0.9, 1.2, 0.8);
        // Arms trembling
        leftArmGroup.rotation.set(0.5, 0, 1.2 + (Math.random() - 0.5) * 0.4);
        rightArmGroup.rotation.set(0.5, 0, -1.2 + (Math.random() - 0.5) * 0.4);
        // Strobe LEDs
        leftAntenna.ledMat.emissiveIntensity = Math.random() > 0.3 ? 3.5 : 0.2;
        rightAntenna.ledMat.emissiveIntensity = Math.random() > 0.3 ? 3.5 : 0.2;
      } else {
        // Shy: Peeking slightly, arms held inward
        leftEye.scale.set(1.0, 1.15, 0.8);
        rightEye.scale.set(1.0, 1.15, 0.8);
        leftEye.rotation.set(currentLookY * 0.35, currentLookX * 0.45, 0);
        rightEye.rotation.set(currentLookY * 0.35, currentLookX * 0.45, 0);
        // Shy arms tucked in front
        leftArmGroup.rotation.set(0.6, 0.4, 0.8);
        rightArmGroup.rotation.set(0.6, -0.4, -0.8);
        // Gentle steady antenna glow
        const pulse = 1.4 + Math.sin(time * 3) * 0.4;
        leftAntenna.ledMat.emissiveIntensity = pulse;
        rightAntenna.ledMat.emissiveIntensity = pulse;
        pingletGroup.position.x = 0;
        pingletGroup.position.z = 0;
      }

      // Gentle skirt wave motion
      for (let i = 0; i < posAttr.count; i++) {
        const y = posAttr.getY(i);
        if (y < 0.25) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          const angle = Math.atan2(z, x);
          const wave = Math.sin(angle * 6 + time * 3.5) * 0.035;
          posAttr.setY(i, 0.05 + wave);
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 400;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);

      // Resource disposal
      scene.clear();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      bodyTexture.dispose();
      blushGeo.dispose();
      blushMat.dispose();
      blushTex.dispose();
      armGeo.dispose();
      armMaterial.dispose();
      eyeMaterial.dispose();
      highlightMat.dispose();
      stemMat.dispose();
      leftAntenna.ledMat.dispose();
      rightAntenna.ledMat.dispose();
      shadowMesh.geometry.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-pointer select-none ${className}`}
      data-testid="pinglet-3d-canvas"
      aria-label={`Interactive 3D Pinglet character currently in ${mood} mood`}
      role="img"
    />
  );
};

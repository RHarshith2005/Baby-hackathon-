import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface KineticTitleProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  accentWord?: string;
  accentClass?: string;
}

export const KineticTitle: React.FC<KineticTitleProps> = React.memo(({
  children,
  className = '',
  as: Component = 'h2',
  accentWord,
  accentClass = 'text-[#9FF3D3]',
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const words = children.split(' ');

  if (reducedMotion) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 140,
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {words.map((word, wIdx) => {
          const isAccent = accentWord && word.toUpperCase() === accentWord.toUpperCase();
          return (
            <span key={wIdx} className={`inline-flex ${isAccent ? accentClass : ''}`}>
              {word.split('').map((char, cIdx) => (
                <motion.span
                  key={cIdx}
                  variants={letterVariants}
                  whileHover={{
                    scale: 1.18,
                    rotate: (cIdx % 2 === 0 ? 1 : -1) * 7,
                    y: -4,
                    transition: { type: 'spring', stiffness: 350, damping: 10 },
                  }}
                  className="inline-block cursor-default select-none"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          );
        })}
      </motion.span>
    </Component>
  );
});

KineticTitle.displayName = 'KineticTitle';

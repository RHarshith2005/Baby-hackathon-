import React from 'react';

export type DividerVariant = 'scallop' | 'ticket' | 'cloud';

interface PlayfulDividerProps {
  variant?: DividerVariant;
  fillColor?: string;
  borderColor?: string;
  className?: string;
  flip?: boolean;
}

export const PlayfulDivider: React.FC<PlayfulDividerProps> = React.memo(({
  variant = 'scallop',
  fillColor = '#FFF8EE',
  borderColor = '#1B1B3A',
  className = '',
  flip = false,
}) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none relative z-20 ${
        flip ? 'rotate-180 -mb-[1px]' : '-mt-[1px]'
      } ${className}`}
      aria-hidden="true"
    >
      {variant === 'scallop' && (
        <svg
          viewBox="0 0 1200 36"
          className="w-full h-7 sm:h-9 block"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Scalloped Pillowy Wave Border */}
          <path
            d="M 0,0 
               C 50,28 100,28 150,0 
               C 200,28 250,28 300,0 
               C 350,28 400,28 450,0 
               C 500,28 550,28 600,0 
               C 650,28 700,28 750,0 
               C 800,28 850,28 900,0 
               C 950,28 1000,28 1050,0 
               C 1100,28 1150,28 1200,0 
               L 1200,36 L 0,36 Z"
            fill={fillColor}
            stroke={borderColor}
            strokeWidth="3.5"
          />
        </svg>
      )}

      {variant === 'ticket' && (
        <svg
          viewBox="0 0 1200 28"
          className="w-full h-5 sm:h-7 block"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Perforated Ticket / Stamp Teeth Edge */}
          <path
            d="M 0,0 
               L 40,0 A 14,14 0 0,0 68,0 
               L 120,0 A 14,14 0 0,0 148,0 
               L 200,0 A 14,14 0 0,0 228,0 
               L 280,0 A 14,14 0 0,0 308,0 
               L 360,0 A 14,14 0 0,0 388,0 
               L 440,0 A 14,14 0 0,0 468,0 
               L 520,0 A 14,14 0 0,0 548,0 
               L 600,0 A 14,14 0 0,0 628,0 
               L 680,0 A 14,14 0 0,0 708,0 
               L 760,0 A 14,14 0 0,0 788,0 
               L 840,0 A 14,14 0 0,0 868,0 
               L 920,0 A 14,14 0 0,0 948,0 
               L 1000,0 A 14,14 0 0,0 1028,0 
               L 1080,0 A 14,14 0 0,0 1108,0 
               L 1160,0 A 14,14 0 0,0 1188,0 
               L 1200,0 L 1200,28 L 0,28 Z"
            fill={fillColor}
            stroke={borderColor}
            strokeWidth="3.5"
          />
        </svg>
      )}

      {variant === 'cloud' && (
        <svg
          viewBox="0 0 1200 44"
          className="w-full h-8 sm:h-11 block"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Puffy Soft Cloud Curve Divider */}
          <path
            d="M 0,0 
               Q 100,42 200,10 
               Q 300,44 400,12 
               Q 500,42 600,10 
               Q 700,44 800,12 
               Q 900,42 1000,10 
               Q 1100,44 1200,12 
               L 1200,44 L 0,44 Z"
            fill={fillColor}
            stroke={borderColor}
            strokeWidth="3.5"
          />
        </svg>
      )}
    </div>
  );
});

PlayfulDivider.displayName = 'PlayfulDivider';

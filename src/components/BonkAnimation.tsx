'use client';

interface BonkAnimationProps {
  by: string;
}

export default function BonkAnimation({ by }: BonkAnimationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-bonk-shake">
      <div className="text-center animate-bonk-text">
        {/* Club SVG */}
        <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100" fill="none">
          <ellipse cx="55" cy="25" rx="25" ry="20" fill="#8B6914" stroke="#5C4A0A" strokeWidth="3"/>
          <ellipse cx="50" cy="20" rx="8" ry="6" fill="#A07818" opacity="0.5"/>
          <rect x="44" y="42" width="12" height="45" rx="4" fill="#6B4E0A" stroke="#5C4A0A" strokeWidth="2"/>
          <ellipse cx="50" cy="87" rx="8" ry="4" fill="#5C4A0A"/>
          {/* Bumps on club */}
          <circle cx="38" cy="20" r="6" fill="#7A5C12" stroke="#5C4A0A" strokeWidth="2"/>
          <circle cx="65" cy="15" r="5" fill="#7A5C12" stroke="#5C4A0A" strokeWidth="2"/>
          <circle cx="55" cy="10" r="7" fill="#7A5C12" stroke="#5C4A0A" strokeWidth="2"/>
        </svg>
        <div className="text-8xl font-black text-bonk-red drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
          style={{ textShadow: '4px 4px 0 #7f1d1d, -2px -2px 0 #7f1d1d' }}>
          BONK!
        </div>
        <div className="text-xl text-cave-muted mt-2">
          {by} say NO!
        </div>
      </div>
    </div>
  );
}

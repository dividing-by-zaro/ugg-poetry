'use client';

import Timer from './Timer';
import ScoreBoard from './ScoreBoard';

interface OpposingTeamViewProps {
  card: { partial: string; full: string } | null;
  secondsLeft: number | null;
  scores: { red: number; blue: number };
  activeTeam: 'red' | 'blue';
  onBonk: () => void;
  lastScore: { points: number; by: string } | null;
  roundNumber: number;
  totalRounds: number;
}

export default function OpposingTeamView({
  card,
  secondsLeft,
  scores,
  activeTeam,
  onBonk,
  lastScore,
  roundNumber,
  totalRounds,
}: OpposingTeamViewProps) {
  const opposingTeam = activeTeam === 'red' ? 'blue' : 'red';

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
      {/* Role Badge */}
      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
        opposingTeam === 'red' ? 'bg-team-red/20 text-team-red border border-team-red/40' : 'bg-team-blue/20 text-team-blue border border-team-blue/40'
      }`}>
        You watch for cheats!
      </div>

      <div className="text-sm text-cave-muted">Round {roundNumber} of {totalRounds}</div>

      {/* Timer */}
      <Timer secondsLeft={secondsLeft} />

      {/* Card (shown for policing) */}
      {card && (
        <div className="w-full bg-cave-surface border-2 border-cave-muted/30 rounded-2xl p-6 text-center opacity-80">
          <div className="text-xs uppercase tracking-widest text-cave-muted mb-2">They trying to say:</div>
          <div className="text-3xl font-bold text-cave-light/70 mb-4">
            {card.partial}
          </div>
          <div className="border-t border-cave-muted/20 pt-3">
            <div className="text-xs uppercase tracking-widest text-cave-muted mb-1">Full thing:</div>
            <div className="text-2xl font-bold text-cave-gold/70">
              {card.full}
            </div>
          </div>
        </div>
      )}

      {/* BONK Button */}
      <button
        onClick={onBonk}
        className="w-full py-6 rounded-2xl text-3xl font-black bg-bonk-red text-white hover:bg-bonk-red/80 transition-all active:scale-95 shadow-xl shadow-bonk-red/20 uppercase tracking-wider"
      >
        BONK!
      </button>
      <div className="text-sm text-cave-muted text-center -mt-2">
        Hit BONK if they use big word or say the thing!
      </div>

      {/* Score */}
      <ScoreBoard scores={scores} activeTeam={activeTeam} lastScore={lastScore} />
    </div>
  );
}

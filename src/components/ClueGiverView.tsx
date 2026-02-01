'use client';

import Timer from './Timer';
import ScoreBoard from './ScoreBoard';

interface ClueGiverViewProps {
  card: { partial: string; full: string } | null;
  secondsLeft: number | null;
  scores: { red: number; blue: number };
  activeTeam: 'red' | 'blue';
  onScorePartial: () => void;
  onScoreFull: () => void;
  onPass: () => void;
  lastScore: { points: number; by: string } | null;
  roundNumber: number;
  totalRounds: number;
}

export default function ClueGiverView({
  card,
  secondsLeft,
  scores,
  activeTeam,
  onScorePartial,
  onScoreFull,
  onPass,
  lastScore,
  roundNumber,
  totalRounds,
}: ClueGiverViewProps) {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
      {/* Role Badge */}
      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
        activeTeam === 'red' ? 'bg-team-red/20 text-team-red border border-team-red/40' : 'bg-team-blue/20 text-team-blue border border-team-blue/40'
      }`}>
        You give clues!
      </div>

      <div className="text-sm text-cave-muted">Round {roundNumber} of {totalRounds}</div>

      {/* Timer */}
      <Timer secondsLeft={secondsLeft} />

      {/* Card */}
      {card && (
        <div className="w-full bg-cave-card border-2 border-cave-gold/40 rounded-2xl p-8 text-center animate-card-flip shadow-lg shadow-black/40">
          <div className="text-sm uppercase tracking-widest text-cave-muted mb-2">+1 Point</div>
          <div className="text-4xl font-bold text-cave-light mb-6">
            {card.partial}
          </div>
          <div className="border-t border-cave-muted/20 pt-4">
            <div className="text-sm uppercase tracking-widest text-cave-gold mb-2">+3 Points</div>
            <div className="text-3xl font-bold text-cave-gold">
              {card.full}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-3 gap-3 mt-2">
        <button
          onClick={onScorePartial}
          className="py-5 rounded-xl text-xl font-bold bg-cave-green text-white hover:bg-cave-green/80 transition-all active:scale-95 shadow-lg"
        >
          +1
        </button>
        <button
          onClick={onScoreFull}
          className="py-5 rounded-xl text-xl font-bold bg-cave-gold text-cave-bg hover:bg-cave-gold/80 transition-all active:scale-95 shadow-lg"
        >
          +3
        </button>
        <button
          onClick={onPass}
          className="py-5 rounded-xl text-xl font-bold bg-cave-muted/30 text-cave-muted hover:bg-cave-muted/40 transition-all active:scale-95 shadow-lg"
        >
          Pass
        </button>
      </div>

      {/* Score */}
      <ScoreBoard scores={scores} activeTeam={activeTeam} lastScore={lastScore} />
    </div>
  );
}

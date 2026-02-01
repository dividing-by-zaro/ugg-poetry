'use client';

import Timer from './Timer';
import ScoreBoard from './ScoreBoard';

interface GuesserViewProps {
  secondsLeft: number | null;
  scores: { red: number; blue: number };
  activeTeam: 'red' | 'blue';
  clueGiverName: string;
  lastScore: { points: number; by: string } | null;
  roundNumber: number;
  totalRounds: number;
}

export default function GuesserView({
  secondsLeft,
  scores,
  activeTeam,
  clueGiverName,
  lastScore,
  roundNumber,
  totalRounds,
}: GuesserViewProps) {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
      {/* Role Badge */}
      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
        activeTeam === 'red' ? 'bg-team-red/20 text-team-red border border-team-red/40' : 'bg-team-blue/20 text-team-blue border border-team-blue/40'
      }`}>
        Your tribe guesses!
      </div>

      <div className="text-sm text-cave-muted">Round {roundNumber} of {totalRounds}</div>

      {/* Timer */}
      <Timer secondsLeft={secondsLeft} />

      {/* Guessing indicator */}
      <div className="w-full bg-cave-surface border-2 border-cave-muted/20 rounded-2xl p-10 text-center">
        <div className="text-6xl mb-4">
          {activeTeam === 'red' ? '🔴' : '🔵'}
        </div>
        <div className="text-2xl font-bold text-cave-light mb-3">
          Listen to {clueGiverName}!
        </div>
        <div className="text-lg text-cave-muted">
          They use cave words to tell you thing.
          <br />
          You say what thing is!
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cave-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 rounded-full bg-cave-gold animate-bounce" style={{ animationDelay: '200ms' }} />
          <span className="w-3 h-3 rounded-full bg-cave-gold animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>
      </div>

      {/* Score */}
      <ScoreBoard scores={scores} activeTeam={activeTeam} lastScore={lastScore} />
    </div>
  );
}

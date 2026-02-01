'use client';

import ScoreBoard from './ScoreBoard';
import type { TeamColor } from '@/lib/types';

interface BetweenTurnsProps {
  scores: { red: number; blue: number };
  nextClueGiver: string;
  nextTeam: TeamColor;
  roundNumber: number;
  totalRounds: number;
  isHost: boolean;
  onNextTurn: () => void;
}

export default function BetweenTurns({
  scores,
  nextClueGiver,
  nextTeam,
  roundNumber,
  totalRounds,
  isHost,
  onNextTurn,
}: BetweenTurnsProps) {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
      <div className="text-2xl font-bold text-cave-gold uppercase tracking-wider">
        Turn Done!
      </div>

      <ScoreBoard scores={scores} />

      <div className="w-full bg-cave-surface rounded-2xl p-8 text-center border border-cave-muted/20">
        <div className="text-cave-muted text-sm mb-2">Round {roundNumber} of {totalRounds}</div>
        <div className="text-lg text-cave-muted mb-2">Next cave speaker:</div>
        <div className={`text-3xl font-bold ${nextTeam === 'red' ? 'text-team-red' : 'text-team-blue'}`}>
          {nextClueGiver}
        </div>
        <div className={`text-sm mt-1 ${nextTeam === 'red' ? 'text-team-red-light' : 'text-team-blue-light'}`}>
          {nextTeam === 'red' ? 'Red' : 'Blue'} Tribe
        </div>
      </div>

      {isHost ? (
        <button
          onClick={onNextTurn}
          className="w-full py-4 rounded-xl text-xl font-bold bg-cave-green text-white hover:bg-cave-green/80 transition-all active:scale-95 animate-pulse-glow uppercase tracking-wider"
        >
          Next Turn!
        </button>
      ) : (
        <div className="text-cave-muted text-center">
          Waiting for Chief to start next turn...
        </div>
      )}
    </div>
  );
}

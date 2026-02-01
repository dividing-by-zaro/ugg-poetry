'use client';

import ScoreBoard from './ScoreBoard';
import type { TeamColor } from '@/lib/types';

interface GameOverProps {
  scores: { red: number; blue: number };
  winner: TeamColor | 'tie';
}

export default function GameOver({ scores, winner }: GameOverProps) {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
      {/* Winner Announcement */}
      <div className="text-center">
        <div className="text-6xl mb-4 animate-celebration">
          {winner === 'tie' ? '🤝' : '🏆'}
        </div>
        {winner === 'tie' ? (
          <div className="text-4xl font-black text-cave-gold">
            TIE GAME!
          </div>
        ) : (
          <>
            <div className={`text-4xl font-black ${winner === 'red' ? 'text-team-red' : 'text-team-blue'}`}>
              {winner === 'red' ? 'RED' : 'BLUE'} TRIBE WINS!
            </div>
          </>
        )}
        <div className="text-cave-muted text-lg mt-2">
          {winner === 'tie' ? 'Both tribes equal strong!' : 'Best cave talkers in all the land!'}
        </div>
      </div>

      {/* Final Scores */}
      <div className="w-full bg-cave-surface rounded-2xl p-8 border border-cave-gold/30">
        <div className="text-center text-sm uppercase tracking-widest text-cave-gold mb-4">
          Final Score
        </div>
        <ScoreBoard scores={scores} />
      </div>

      {/* Play Again */}
      <div className="text-cave-muted text-center text-sm">
        Share the room code to play again with same group!
      </div>
    </div>
  );
}

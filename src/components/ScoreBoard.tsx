'use client';

interface ScoreBoardProps {
  scores: { red: number; blue: number };
  activeTeam?: 'red' | 'blue';
  lastScore?: { points: number; by: string } | null;
}

export default function ScoreBoard({ scores, activeTeam, lastScore }: ScoreBoardProps) {
  return (
    <div className="flex justify-center gap-8 py-3">
      <div className={`text-center px-6 py-3 rounded-lg border-2 transition-all ${
        activeTeam === 'red' ? 'border-team-red bg-team-red-bg scale-105' : 'border-team-red/30 bg-team-red-bg/30'
      }`}>
        <div className="text-sm uppercase tracking-wider text-team-red-light">Red Team</div>
        <div className={`text-4xl font-bold text-team-red ${lastScore ? 'animate-score-pop' : ''}`}>
          {scores.red}
        </div>
      </div>
      <div className={`text-center px-6 py-3 rounded-lg border-2 transition-all ${
        activeTeam === 'blue' ? 'border-team-blue bg-team-blue-bg scale-105' : 'border-team-blue/30 bg-team-blue-bg/30'
      }`}>
        <div className="text-sm uppercase tracking-wider text-team-blue-light">Blue Team</div>
        <div className={`text-4xl font-bold text-team-blue ${lastScore ? 'animate-score-pop' : ''}`}>
          {scores.blue}
        </div>
      </div>
    </div>
  );
}

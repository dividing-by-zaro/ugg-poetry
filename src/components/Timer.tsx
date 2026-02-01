'use client';

interface TimerProps {
  secondsLeft: number | null;
}

export default function Timer({ secondsLeft }: TimerProps) {
  if (secondsLeft === null) return null;

  const isUrgent = secondsLeft <= 10;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = minutes > 0
    ? `${minutes}:${secs.toString().padStart(2, '0')}`
    : `${secs}`;

  return (
    <div className={`text-center ${isUrgent ? 'animate-timer-urgency' : ''}`}>
      <div className={`text-6xl font-bold tabular-nums ${isUrgent ? 'text-bonk-red' : 'text-cave-gold'}`}>
        {display}
      </div>
      {isUrgent && secondsLeft <= 5 && (
        <div className="text-sm text-bonk-red mt-1 uppercase tracking-widest">
          Time runs out!
        </div>
      )}
    </div>
  );
}

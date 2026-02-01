'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import Lobby from '@/components/Lobby';
import ClueGiverView from '@/components/ClueGiverView';
import GuesserView from '@/components/GuesserView';
import OpposingTeamView from '@/components/OpposingTeamView';
import BetweenTurns from '@/components/BetweenTurns';
import GameOver from '@/components/GameOver';
import BonkAnimation from '@/components/BonkAnimation';

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const {
    gameState,
    card,
    secondsLeft,
    bonkEvent,
    error,
    lastScore,
    turnEnd,
    gameOver: gameOverData,
    pickTeam,
    startGame,
    scorePartial,
    scoreFull,
    pass,
    bonk: doBonk,
    nextTurn,
    socketId,
  } = useGame();

  const [showBonk, setShowBonk] = useState<{ by: string } | null>(null);

  useEffect(() => {
    if (bonkEvent) {
      setShowBonk({ by: bonkEvent.by });
      const timer = setTimeout(() => setShowBonk(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [bonkEvent]);

  // Determine the player's role
  const myPlayer = gameState?.players.find(p => p.socketId === socketId);
  const isClueGiver = gameState?.currentClueGiver === myPlayer?.username;
  const isOnActiveTeam = myPlayer?.team === gameState?.activeTeam;
  const isOnOpposingTeam = myPlayer?.team !== null && myPlayer?.team !== gameState?.activeTeam;

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-cave-gold mb-4 animate-bounce">🦴</div>
          <div className="text-xl text-cave-muted">Finding cave...</div>
          <div className="text-sm text-cave-muted/50 mt-2">Room: {code}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 pt-6 ${showBonk ? 'animate-bonk-shake' : ''}`}>
      {/* Bonk Overlay */}
      {showBonk && <BonkAnimation by={showBonk.by} />}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 p-3 bg-bonk-red/90 rounded-lg text-white text-sm shadow-lg">
          {error}
        </div>
      )}

      {/* Last Score Toast */}
      {lastScore && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 p-3 bg-cave-green/90 rounded-lg text-white text-sm shadow-lg animate-score-pop">
          +{lastScore.points} point{lastScore.points > 1 ? 's' : ''}!
        </div>
      )}

      {/* Phase Rendering */}
      {gameState.phase === 'lobby' && (
        <Lobby
          gameState={gameState}
          onPickTeam={pickTeam}
          onStartGame={startGame}
          socketId={socketId}
        />
      )}

      {gameState.phase === 'playing' && isClueGiver && (
        <ClueGiverView
          card={card}
          secondsLeft={secondsLeft}
          scores={gameState.scores}
          activeTeam={gameState.activeTeam}
          onScorePartial={scorePartial}
          onScoreFull={scoreFull}
          onPass={pass}
          lastScore={lastScore}
          roundNumber={gameState.roundNumber}
          totalRounds={gameState.totalRounds}
        />
      )}

      {gameState.phase === 'playing' && !isClueGiver && isOnActiveTeam && (
        <GuesserView
          secondsLeft={secondsLeft}
          scores={gameState.scores}
          activeTeam={gameState.activeTeam}
          clueGiverName={gameState.currentClueGiver || ''}
          lastScore={lastScore}
          roundNumber={gameState.roundNumber}
          totalRounds={gameState.totalRounds}
        />
      )}

      {gameState.phase === 'playing' && isOnOpposingTeam && (
        <OpposingTeamView
          card={card}
          secondsLeft={secondsLeft}
          scores={gameState.scores}
          activeTeam={gameState.activeTeam}
          onBonk={doBonk}
          lastScore={lastScore}
          roundNumber={gameState.roundNumber}
          totalRounds={gameState.totalRounds}
        />
      )}

      {gameState.phase === 'between_turns' && turnEnd && (
        <BetweenTurns
          scores={gameState.scores}
          nextClueGiver={turnEnd.nextClueGiver}
          nextTeam={turnEnd.nextTeam}
          roundNumber={turnEnd.roundNumber}
          totalRounds={gameState.totalRounds}
          isHost={gameState.isHost}
          onNextTurn={nextTurn}
        />
      )}

      {gameState.phase === 'game_over' && gameOverData && (
        <GameOver
          scores={gameOverData.scores}
          winner={gameOverData.winner}
        />
      )}

      {/* Fallback for between_turns without turnEnd data */}
      {gameState.phase === 'between_turns' && !turnEnd && (
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6 mt-10">
          <div className="text-2xl font-bold text-cave-gold">Turn over!</div>
          <div className="text-cave-muted">Waiting for next turn...</div>
          {gameState.isHost && (
            <button
              onClick={nextTurn}
              className="py-4 px-8 rounded-xl text-xl font-bold bg-cave-green text-white hover:bg-cave-green/80 transition-all"
            >
              Next Turn!
            </button>
          )}
        </div>
      )}

      {/* Fallback for game_over without gameOverData */}
      {gameState.phase === 'game_over' && !gameOverData && (
        <GameOver
          scores={gameState.scores}
          winner={gameState.scores.red > gameState.scores.blue ? 'red' : gameState.scores.blue > gameState.scores.red ? 'blue' : 'tie'}
        />
      )}
    </div>
  );
}

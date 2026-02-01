'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { ClientGameState, TeamColor } from '@/lib/types';

interface CardData {
  partial: string;
  full: string;
}

interface BonkEvent {
  by: string;
  timestamp: number;
}

export function useGame() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [bonk, setBonk] = useState<BonkEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState<{ points: number; by: string } | null>(null);
  const [turnEnd, setTurnEnd] = useState<{ nextClueGiver: string; nextTeam: TeamColor; roundNumber: number } | null>(null);
  const [gameOver, setGameOver] = useState<{ scores: { red: number; blue: number }; winner: TeamColor | 'tie' } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onRoomState = (state: ClientGameState) => {
      setGameState(state);
      if (state.phase === 'lobby' || state.phase === 'game_over') {
        setCard(null);
        setSecondsLeft(null);
        setTurnEnd(null);
      }
      if (state.phase === 'between_turns') {
        setCard(null);
      }
    };

    const onCardRevealed = (data: CardData) => {
      setCard(data);
    };

    const onTimerTick = (data: { secondsLeft: number }) => {
      setSecondsLeft(data.secondsLeft);
    };

    const onScoreUpdate = (data: { scores: { red: number; blue: number }; pointsJustScored: number; by: string }) => {
      setLastScore({ points: data.pointsJustScored, by: data.by });
      setTimeout(() => setLastScore(null), 1500);
    };

    const onBonkTriggered = (data: { by: string }) => {
      setBonk({ by: data.by, timestamp: Date.now() });
      setTimeout(() => setBonk(null), 1500);
    };

    const onTurnEnd = (data: { scores: { red: number; blue: number }; nextClueGiver: string; nextTeam: TeamColor; roundNumber: number }) => {
      setTurnEnd({ nextClueGiver: data.nextClueGiver, nextTeam: data.nextTeam, roundNumber: data.roundNumber });
      setCard(null);
      setSecondsLeft(null);
    };

    const onGameOver = (data: { scores: { red: number; blue: number }; winner: TeamColor | 'tie' }) => {
      setGameOver(data);
      setCard(null);
      setSecondsLeft(null);
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('room-state', onRoomState);
    socket.on('card-revealed', onCardRevealed);
    socket.on('timer-tick', onTimerTick);
    socket.on('score-update', onScoreUpdate);
    socket.on('bonk-triggered', onBonkTriggered);
    socket.on('turn-end', onTurnEnd);
    socket.on('game-over', onGameOver);
    socket.on('error', onError);

    // Request current state on mount (handles page navigation race condition)
    socket.emit('request-state');

    return () => {
      socket.off('room-state', onRoomState);
      socket.off('card-revealed', onCardRevealed);
      socket.off('timer-tick', onTimerTick);
      socket.off('score-update', onScoreUpdate);
      socket.off('bonk-triggered', onBonkTriggered);
      socket.off('turn-end', onTurnEnd);
      socket.off('game-over', onGameOver);
      socket.off('error', onError);
    };
  }, [socket]);

  const createRoom = useCallback((username: string) => {
    socket.emit('create-room', { username });
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, username: string) => {
    socket.emit('join-room', { roomCode, username });
  }, [socket]);

  const pickTeam = useCallback((team: TeamColor) => {
    socket.emit('pick-team', { team });
  }, [socket]);

  const startGameAction = useCallback((timerSeconds?: number, totalRounds?: number) => {
    socket.emit('start-game', { timerSeconds, totalRounds });
  }, [socket]);

  const scorePartial = useCallback(() => {
    socket.emit('score-partial');
  }, [socket]);

  const scoreFull = useCallback(() => {
    socket.emit('score-full');
  }, [socket]);

  const pass = useCallback(() => {
    socket.emit('pass');
  }, [socket]);

  const doBonk = useCallback(() => {
    socket.emit('bonk');
  }, [socket]);

  const nextTurn = useCallback(() => {
    socket.emit('next-turn');
  }, [socket]);

  return {
    gameState,
    card,
    secondsLeft,
    bonkEvent: bonk,
    error,
    lastScore,
    turnEnd,
    gameOver,
    createRoom,
    joinRoom,
    pickTeam,
    startGame: startGameAction,
    scorePartial,
    scoreFull,
    pass,
    bonk: doBonk,
    nextTurn,
    socketId: socket.id,
  };
}

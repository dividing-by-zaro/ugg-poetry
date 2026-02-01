'use client';

import { useState } from 'react';
import type { ClientGameState, TeamColor } from '@/lib/types';

interface LobbyProps {
  gameState: ClientGameState;
  onPickTeam: (team: TeamColor) => void;
  onStartGame: (timerSeconds?: number, totalRounds?: number) => void;
  socketId: string | undefined;
}

export default function Lobby({ gameState, onPickTeam, onStartGame, socketId }: LobbyProps) {
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [totalRounds, setTotalRounds] = useState(10);

  const redPlayers = gameState.players.filter(p => p.team === 'red');
  const bluePlayers = gameState.players.filter(p => p.team === 'blue');
  const unassigned = gameState.players.filter(p => p.team === null);
  const myPlayer = gameState.players.find(p => p.socketId === socketId);
  const canStart = gameState.isHost && redPlayers.length > 0 && bluePlayers.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Room Code */}
      <div className="text-center mb-8">
        <div className="text-sm uppercase tracking-widest text-cave-muted mb-1">Room Code</div>
        <div className="text-5xl font-bold tracking-[0.3em] text-cave-gold">
          {gameState.roomCode}
        </div>
        <div className="text-sm text-cave-muted mt-2">
          Share this code with your cave friends
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Red Team */}
        <div className="bg-team-red-bg/50 border-2 border-team-red/40 rounded-xl p-4">
          <h3 className="text-center text-team-red font-bold text-lg mb-3 uppercase tracking-wider">
            Red Tribe
          </h3>
          <div className="space-y-2 min-h-[80px]">
            {redPlayers.map(p => (
              <div key={p.socketId} className="text-center py-1 px-3 bg-team-red/10 rounded text-team-red-light">
                {p.username} {p.socketId === gameState.players.find(pp => pp.username === gameState.hostUsername)?.socketId ? '(Chief)' : ''}
              </div>
            ))}
            {redPlayers.length === 0 && (
              <div className="text-center text-cave-muted/50 py-4 text-sm">No cave people yet</div>
            )}
          </div>
          <button
            onClick={() => onPickTeam('red')}
            className={`w-full mt-3 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              myPlayer?.team === 'red'
                ? 'bg-team-red text-white cursor-default'
                : 'btn-stone text-team-red-light hover:bg-team-red/20'
            }`}
            disabled={myPlayer?.team === 'red'}
          >
            {myPlayer?.team === 'red' ? 'You here!' : 'Join Red'}
          </button>
        </div>

        {/* Blue Team */}
        <div className="bg-team-blue-bg/50 border-2 border-team-blue/40 rounded-xl p-4">
          <h3 className="text-center text-team-blue font-bold text-lg mb-3 uppercase tracking-wider">
            Blue Tribe
          </h3>
          <div className="space-y-2 min-h-[80px]">
            {bluePlayers.map(p => (
              <div key={p.socketId} className="text-center py-1 px-3 bg-team-blue/10 rounded text-team-blue-light">
                {p.username} {p.socketId === gameState.players.find(pp => pp.username === gameState.hostUsername)?.socketId ? '(Chief)' : ''}
              </div>
            ))}
            {bluePlayers.length === 0 && (
              <div className="text-center text-cave-muted/50 py-4 text-sm">No cave people yet</div>
            )}
          </div>
          <button
            onClick={() => onPickTeam('blue')}
            className={`w-full mt-3 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              myPlayer?.team === 'blue'
                ? 'bg-team-blue text-white cursor-default'
                : 'btn-stone text-team-blue-light hover:bg-team-blue/20'
            }`}
            disabled={myPlayer?.team === 'blue'}
          >
            {myPlayer?.team === 'blue' ? 'You here!' : 'Join Blue'}
          </button>
        </div>
      </div>

      {/* Unassigned Players */}
      {unassigned.length > 0 && (
        <div className="text-center mb-6 text-cave-muted">
          <span className="text-sm">Wandering cave people: </span>
          {unassigned.map(p => p.username).join(', ')}
        </div>
      )}

      {/* Host Controls */}
      {gameState.isHost && (
        <div className="bg-cave-surface rounded-xl p-6 border border-cave-muted/20">
          <h3 className="text-center text-cave-gold font-bold mb-4 uppercase tracking-wider">
            Chief&apos;s Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-cave-muted mb-1">Timer (seconds)</label>
              <select
                value={timerSeconds}
                onChange={e => setTimerSeconds(Number(e.target.value))}
                className="w-full bg-cave-card border border-cave-muted/30 rounded-lg px-3 py-2 text-cave-light"
              >
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
                <option value={90}>90s</option>
                <option value={120}>120s</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-cave-muted mb-1">Rounds</label>
              <select
                value={totalRounds}
                onChange={e => setTotalRounds(Number(e.target.value))}
                className="w-full bg-cave-card border border-cave-muted/30 rounded-lg px-3 py-2 text-cave-light"
              >
                <option value={4}>4 rounds</option>
                <option value={6}>6 rounds</option>
                <option value={8}>8 rounds</option>
                <option value={10}>10 rounds</option>
                <option value={14}>14 rounds</option>
                <option value={20}>20 rounds</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => onStartGame(timerSeconds, totalRounds)}
            disabled={!canStart}
            className={`w-full py-4 rounded-xl text-xl font-bold uppercase tracking-wider transition-all ${
              canStart
                ? 'bg-cave-green text-white hover:bg-cave-green/80 animate-pulse-glow'
                : 'bg-cave-muted/20 text-cave-muted cursor-not-allowed'
            }`}
          >
            {canStart ? 'START HUNT!' : 'Need players on both tribes'}
          </button>
        </div>
      )}

      {!gameState.isHost && (
        <div className="text-center text-cave-muted">
          Waiting for {gameState.hostUsername} (the Chief) to start the hunt...
        </div>
      )}
    </div>
  );
}

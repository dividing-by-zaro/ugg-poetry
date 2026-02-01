import { GameState, Player, Card, TeamColor, ClientGameState } from './types';
import { cards as allCards } from './cards';

const games = new Map<string, GameState>();
const socketToRoom = new Map<string, string>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function shuffleDeck(): Card[] {
  const deck = [...allCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createRoom(hostSocketId: string, username: string): GameState {
  let code = generateRoomCode();
  while (games.has(code)) {
    code = generateRoomCode();
  }

  const game: GameState = {
    roomCode: code,
    phase: 'lobby',
    players: [{ socketId: hostSocketId, username, team: null }],
    scores: { red: 0, blue: 0 },
    activeTeam: 'red',
    clueGiverIndex: { red: 0, blue: 0 },
    currentCard: null,
    deck: [],
    timerSeconds: 60,
    timerEndTime: null,
    roundNumber: 0,
    totalRounds: 10,
    hostSocketId,
  };

  games.set(code, game);
  socketToRoom.set(hostSocketId, code);
  return game;
}

export function joinRoom(roomCode: string, socketId: string, username: string): GameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game) return null;

  const existingPlayer = game.players.find(p => p.socketId === socketId);
  if (existingPlayer) return game;

  const nameTaken = game.players.find(p => p.username.toLowerCase() === username.toLowerCase());
  if (nameTaken) return null;

  game.players.push({ socketId: socketId, username, team: null });
  socketToRoom.set(socketId, roomCode.toUpperCase());
  return game;
}

export function pickTeam(socketId: string, team: TeamColor): GameState | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game || game.phase !== 'lobby') return null;

  const player = game.players.find(p => p.socketId === socketId);
  if (!player) return null;

  player.team = team;
  return game;
}

export function getTeamPlayers(game: GameState, team: TeamColor): Player[] {
  return game.players.filter(p => p.team === team);
}

export function getCurrentClueGiver(game: GameState): Player | null {
  const teamPlayers = getTeamPlayers(game, game.activeTeam);
  if (teamPlayers.length === 0) return null;
  const index = game.clueGiverIndex[game.activeTeam] % teamPlayers.length;
  return teamPlayers[index];
}

export function startGame(socketId: string, timerSeconds?: number, totalRounds?: number): GameState | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game) return null;
  if (game.hostSocketId !== socketId) return null;
  if (game.phase !== 'lobby') return null;

  const redTeam = getTeamPlayers(game, 'red');
  const blueTeam = getTeamPlayers(game, 'blue');
  if (redTeam.length === 0 || blueTeam.length === 0) return null;

  game.timerSeconds = timerSeconds || 60;
  game.totalRounds = totalRounds || 10;
  game.scores = { red: 0, blue: 0 };
  game.activeTeam = 'red';
  game.clueGiverIndex = { red: 0, blue: 0 };
  game.roundNumber = 1;
  game.deck = shuffleDeck();
  game.phase = 'playing';

  drawCard(game);
  return game;
}

export function drawCard(game: GameState): Card | null {
  if (game.deck.length === 0) {
    game.deck = shuffleDeck();
  }
  const card = game.deck.pop()!;
  game.currentCard = card;
  return card;
}

export function scorePartial(socketId: string): { game: GameState; card: Card | null } | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game || game.phase !== 'playing') return null;

  const clueGiver = getCurrentClueGiver(game);
  if (!clueGiver || clueGiver.socketId !== socketId) return null;

  game.scores[game.activeTeam] += 1;
  const card = drawCard(game);
  return { game, card };
}

export function scoreFull(socketId: string): { game: GameState; card: Card | null } | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game || game.phase !== 'playing') return null;

  const clueGiver = getCurrentClueGiver(game);
  if (!clueGiver || clueGiver.socketId !== socketId) return null;

  game.scores[game.activeTeam] += 3;
  const card = drawCard(game);
  return { game, card };
}

export function passCard(socketId: string): { game: GameState; card: Card | null } | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game || game.phase !== 'playing') return null;

  const clueGiver = getCurrentClueGiver(game);
  if (!clueGiver || clueGiver.socketId !== socketId) return null;

  const card = drawCard(game);
  return { game, card };
}

export function endTurn(game: GameState): { nextClueGiver: string; nextTeam: TeamColor; gameOver: boolean } {
  // Advance clue giver index for the team that just played
  game.clueGiverIndex[game.activeTeam]++;

  // Switch teams
  const previousTeam = game.activeTeam;
  game.activeTeam = game.activeTeam === 'red' ? 'blue' : 'red';

  // If we switched from blue back to red, that's a full round
  if (previousTeam === 'blue') {
    game.roundNumber++;
  }

  // Check if game is over
  if (game.roundNumber > game.totalRounds) {
    game.phase = 'game_over';
    game.currentCard = null;
    game.timerEndTime = null;

    const nextTeamPlayers = getTeamPlayers(game, game.activeTeam);
    const nextIndex = game.clueGiverIndex[game.activeTeam] % Math.max(nextTeamPlayers.length, 1);
    return {
      nextClueGiver: nextTeamPlayers[nextIndex]?.username || '',
      nextTeam: game.activeTeam,
      gameOver: true,
    };
  }

  game.phase = 'between_turns';
  game.currentCard = null;
  game.timerEndTime = null;

  const nextTeamPlayers = getTeamPlayers(game, game.activeTeam);
  const nextIndex = game.clueGiverIndex[game.activeTeam] % nextTeamPlayers.length;
  return {
    nextClueGiver: nextTeamPlayers[nextIndex]?.username || '',
    nextTeam: game.activeTeam,
    gameOver: false,
  };
}

export function startNextTurn(socketId: string): GameState | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game || game.phase !== 'between_turns') return null;
  if (game.hostSocketId !== socketId) return null;

  game.phase = 'playing';
  drawCard(game);
  return game;
}

export function getClientState(game: GameState, forSocketId: string): ClientGameState {
  const clueGiver = getCurrentClueGiver(game);
  const host = game.players.find(p => p.socketId === game.hostSocketId);

  return {
    roomCode: game.roomCode,
    phase: game.phase,
    players: game.players,
    scores: game.scores,
    activeTeam: game.activeTeam,
    currentClueGiver: clueGiver?.username || null,
    timerSeconds: game.timerSeconds,
    secondsLeft: game.timerEndTime ? Math.max(0, Math.ceil((game.timerEndTime - Date.now()) / 1000)) : null,
    roundNumber: game.roundNumber,
    totalRounds: game.totalRounds,
    hostUsername: host?.username || '',
    isHost: forSocketId === game.hostSocketId,
  };
}

export function removePlayer(socketId: string): { game: GameState; username: string } | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game) return null;

  const player = game.players.find(p => p.socketId === socketId);
  if (!player) return null;

  game.players = game.players.filter(p => p.socketId !== socketId);
  socketToRoom.delete(socketId);

  // If host left, assign new host
  if (game.hostSocketId === socketId && game.players.length > 0) {
    game.hostSocketId = game.players[0].socketId;
  }

  // If room is empty, clean up
  if (game.players.length === 0) {
    games.delete(roomCode);
    return null;
  }

  return { game, username: player.username };
}

export function getGame(roomCode: string): GameState | null {
  return games.get(roomCode.toUpperCase()) || null;
}

export function getGameBySocket(socketId: string): GameState | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  return games.get(roomCode) || null;
}

export function resetGame(socketId: string): GameState | null {
  const roomCode = socketToRoom.get(socketId);
  if (!roomCode) return null;
  const game = games.get(roomCode);
  if (!game) return null;
  if (game.hostSocketId !== socketId) return null;

  game.phase = 'lobby';
  game.scores = { red: 0, blue: 0 };
  game.activeTeam = 'red';
  game.clueGiverIndex = { red: 0, blue: 0 };
  game.currentCard = null;
  game.deck = [];
  game.timerEndTime = null;
  game.roundNumber = 0;

  return game;
}

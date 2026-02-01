export interface Card {
  partial: string;
  full: string;
}

export type TeamColor = 'red' | 'blue';
export type GamePhase = 'lobby' | 'playing' | 'between_turns' | 'game_over';

export interface Player {
  socketId: string;
  username: string;
  team: TeamColor | null;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  scores: { red: number; blue: number };
  activeTeam: TeamColor;
  clueGiverIndex: { red: number; blue: number };
  currentCard: Card | null;
  deck: Card[];
  timerSeconds: number;
  timerEndTime: number | null;
  roundNumber: number;
  totalRounds: number;
  hostSocketId: string;
}

// What clients receive (no deck, no card for guessers)
export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  scores: { red: number; blue: number };
  activeTeam: TeamColor;
  currentClueGiver: string | null; // username
  timerSeconds: number;
  secondsLeft: number | null;
  roundNumber: number;
  totalRounds: number;
  hostUsername: string;
  isHost: boolean;
}

// Events: Client -> Server
export interface ClientToServerEvents {
  'create-room': (data: { username: string }) => void;
  'join-room': (data: { roomCode: string; username: string }) => void;
  'pick-team': (data: { team: TeamColor }) => void;
  'start-game': (data: { timerSeconds?: number; totalRounds?: number }) => void;
  'score-partial': () => void;
  'score-full': () => void;
  'pass': () => void;
  'bonk': () => void;
  'next-turn': () => void;
  'request-state': () => void;
}

// Events: Server -> Client
export interface ServerToClientEvents {
  'room-created': (data: { roomCode: string }) => void;
  'room-state': (data: ClientGameState) => void;
  'card-revealed': (data: { partial: string; full: string }) => void;
  'timer-tick': (data: { secondsLeft: number }) => void;
  'score-update': (data: { scores: { red: number; blue: number }; pointsJustScored: number; by: string }) => void;
  'bonk-triggered': (data: { by: string }) => void;
  'turn-end': (data: { scores: { red: number; blue: number }; nextClueGiver: string; nextTeam: TeamColor; roundNumber: number }) => void;
  'game-over': (data: { scores: { red: number; blue: number }; winner: TeamColor | 'tie' }) => void;
  'error': (data: { message: string }) => void;
  'player-joined': (data: { username: string }) => void;
  'player-left': (data: { username: string }) => void;
}

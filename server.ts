import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import {
  createRoom,
  joinRoom,
  pickTeam,
  startGame,
  scorePartial,
  scoreFull,
  passCard,
  endTurn,
  startNextTurn,
  getClientState,
  removePlayer,
  getGame,
  getGameBySocket,
  getCurrentClueGiver,
  getTeamPlayers,
  drawCard,
  resetGame,
} from './src/lib/gameState';
import type { ClientToServerEvents, ServerToClientEvents } from './src/lib/types';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const timers = new Map<string, NodeJS.Timeout>();

function clearRoomTimer(roomCode: string) {
  const timer = timers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    timers.delete(roomCode);
  }
}

nextApp.prepare().then(() => {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : undefined,
      methods: ['GET', 'POST'],
    },
  });

  function broadcastRoomState(roomCode: string) {
    const game = getGame(roomCode);
    if (!game) return;
    for (const player of game.players) {
      const clientState = getClientState(game, player.socketId);
      io.to(player.socketId).emit('room-state', clientState);
    }
  }

  function emitCardToViewers(roomCode: string) {
    const game = getGame(roomCode);
    if (!game || !game.currentCard) return;

    const clueGiver = getCurrentClueGiver(game);
    if (!clueGiver) return;

    // Send card to clue giver
    io.to(clueGiver.socketId).emit('card-revealed', {
      partial: game.currentCard.partial,
      full: game.currentCard.full,
    });

    // Send card to opposing team
    const opposingTeam = game.activeTeam === 'red' ? 'blue' : 'red';
    const opposingPlayers = getTeamPlayers(game, opposingTeam);
    for (const player of opposingPlayers) {
      io.to(player.socketId).emit('card-revealed', {
        partial: game.currentCard.partial,
        full: game.currentCard.full,
      });
    }
  }

  function startTurnTimer(roomCode: string) {
    const game = getGame(roomCode);
    if (!game) return;

    clearRoomTimer(roomCode);

    game.timerEndTime = Date.now() + game.timerSeconds * 1000;

    const interval = setInterval(() => {
      const g = getGame(roomCode);
      if (!g || g.phase !== 'playing' || !g.timerEndTime) {
        clearRoomTimer(roomCode);
        return;
      }

      const secondsLeft = Math.max(0, Math.ceil((g.timerEndTime - Date.now()) / 1000));

      for (const player of g.players) {
        io.to(player.socketId).emit('timer-tick', { secondsLeft });
      }

      if (secondsLeft <= 0) {
        clearRoomTimer(roomCode);
        const result = endTurn(g);

        if (result.gameOver) {
          const winner = g.scores.red > g.scores.blue ? 'red' : g.scores.blue > g.scores.red ? 'blue' : 'tie';
          for (const player of g.players) {
            io.to(player.socketId).emit('game-over', { scores: g.scores, winner });
          }
        } else {
          for (const player of g.players) {
            io.to(player.socketId).emit('turn-end', {
              scores: g.scores,
              nextClueGiver: result.nextClueGiver,
              nextTeam: result.nextTeam,
              roundNumber: g.roundNumber,
            });
          }
        }

        broadcastRoomState(roomCode);
      }
    }, 1000);

    timers.set(roomCode, interval);
  }

  io.on('connection', (socket) => {
    socket.on('create-room', ({ username }) => {
      if (!username || username.trim().length === 0) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }

      const game = createRoom(socket.id, username.trim());
      socket.join(game.roomCode);
      socket.emit('room-created', { roomCode: game.roomCode });
      broadcastRoomState(game.roomCode);
    });

    socket.on('join-room', ({ roomCode, username }) => {
      if (!username || username.trim().length === 0) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }
      if (!roomCode || roomCode.trim().length === 0) {
        socket.emit('error', { message: 'Room code is required' });
        return;
      }

      const game = joinRoom(roomCode.trim().toUpperCase(), socket.id, username.trim());
      if (!game) {
        socket.emit('error', { message: 'Room not found or username already taken' });
        return;
      }

      socket.join(game.roomCode);
      // Notify others
      for (const player of game.players) {
        if (player.socketId !== socket.id) {
          io.to(player.socketId).emit('player-joined', { username: username.trim() });
        }
      }
      broadcastRoomState(game.roomCode);
    });

    socket.on('pick-team', ({ team }) => {
      const game = pickTeam(socket.id, team);
      if (!game) {
        socket.emit('error', { message: 'Could not pick team' });
        return;
      }
      broadcastRoomState(game.roomCode);
    });

    socket.on('start-game', ({ timerSeconds, totalRounds }) => {
      const game = startGame(socket.id, timerSeconds, totalRounds);
      if (!game) {
        socket.emit('error', { message: 'Cannot start game. Need at least 1 player per team.' });
        return;
      }
      broadcastRoomState(game.roomCode);
      emitCardToViewers(game.roomCode);
      startTurnTimer(game.roomCode);
    });

    socket.on('score-partial', () => {
      const result = scorePartial(socket.id);
      if (!result) return;

      const { game, card } = result;
      const clueGiver = getCurrentClueGiver(game);

      for (const player of game.players) {
        io.to(player.socketId).emit('score-update', {
          scores: game.scores,
          pointsJustScored: 1,
          by: clueGiver?.username || '',
        });
      }

      if (card) {
        emitCardToViewers(game.roomCode);
      }
      broadcastRoomState(game.roomCode);
    });

    socket.on('score-full', () => {
      const result = scoreFull(socket.id);
      if (!result) return;

      const { game, card } = result;
      const clueGiver = getCurrentClueGiver(game);

      for (const player of game.players) {
        io.to(player.socketId).emit('score-update', {
          scores: game.scores,
          pointsJustScored: 3,
          by: clueGiver?.username || '',
        });
      }

      if (card) {
        emitCardToViewers(game.roomCode);
      }
      broadcastRoomState(game.roomCode);
    });

    socket.on('pass', () => {
      const result = passCard(socket.id);
      if (!result) return;

      const { game, card } = result;
      if (card) {
        emitCardToViewers(game.roomCode);
      }
      broadcastRoomState(game.roomCode);
    });

    socket.on('bonk', () => {
      const game = getGameBySocket(socket.id);
      if (!game || game.phase !== 'playing') return;

      const player = game.players.find(p => p.socketId === socket.id);
      if (!player) return;

      // Only opposing team can bonk
      if (player.team === game.activeTeam) return;

      for (const p of game.players) {
        io.to(p.socketId).emit('bonk-triggered', { by: player.username });
      }
    });

    socket.on('next-turn', () => {
      const game = startNextTurn(socket.id);
      if (!game) return;

      broadcastRoomState(game.roomCode);
      emitCardToViewers(game.roomCode);
      startTurnTimer(game.roomCode);
    });

    socket.on('request-state', () => {
      const game = getGameBySocket(socket.id);
      if (!game) return;
      const clientState = getClientState(game, socket.id);
      socket.emit('room-state', clientState);
    });

    socket.on('disconnect', () => {
      const result = removePlayer(socket.id);
      if (result) {
        const { game, username } = result;
        for (const player of game.players) {
          io.to(player.socketId).emit('player-left', { username });
        }
        broadcastRoomState(game.roomCode);
      }
    });
  });

  // Let Next.js handle all other routes
  app.all('{*path}', (req, res) => {
    return nextHandler(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Caveman Poetry ready on http://localhost:${port}`);
  });
});

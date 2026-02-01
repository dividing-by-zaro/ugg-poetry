# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server (full stack):** `npx tsx server.ts` — runs Express + Next.js + Socket.IO on port 3000
- **Dev server (Next.js only):** `npm run dev` — no Socket.IO, won't work for gameplay
- **Build:** `npm run build`
- **Lint:** `npx eslint`
- **No test suite exists**

## Architecture

This is a real-time multiplayer word-guessing party game built on a single hybrid server.

**Server (`server.ts`):** Express wraps Next.js and Socket.IO on one HTTP server. All game logic runs server-side with in-memory state (no database). The server is the single source of truth — clients receive filtered state via `broadcastRoomState()` which calls `getClientState()` to strip the deck and hide cards from unauthorized players.

**Client:** Next.js 16 (React 19) with two routes:
- `/` — create or join a room (emits socket events, navigates on success)
- `/room/[code]` — all gameplay, renders different components based on player role and game phase

**Real-time layer:** Socket.IO with typed events (`ClientToServerEvents` / `ServerToClientEvents` in `src/lib/types.ts`). A singleton socket (`src/lib/socket.ts`) persists across page navigations. The `useGame` hook (`src/hooks/useGame.ts`) is the single interface between React and Socket.IO — it subscribes to all events and exposes state + action methods.

## Key patterns

**State flow:** Client emits action → server mutates `GameState` in `src/lib/gameState.ts` → server broadcasts `ClientGameState` to all room players → `useGame` hook updates React state.

**Role-based rendering:** The room page determines the player's role (clue giver, guesser, opposing team) and renders the corresponding component. Card visibility is enforced both server-side (filtered in `getClientState`) and client-side (different components).

**Card visibility rules:** Clue giver and opposing team see both partial (+1 point) and full (+3 points) words. Guessers see neither.

**Timer:** Server-side `setInterval` ticks every second, emitting `timer-tick` to all players. Timer auto-ends the turn when it hits zero.

**State recovery:** Clients emit `request-state` on mount to handle page navigation race conditions and reconnections.

## Deployment

Deployed on Railway. Config in `railway.toml` — Nixpacks builder, starts with `npx tsx server.ts`. Node.js >=20.9.0 required (Next.js 16 constraint, set in `engines` field of `package.json`).

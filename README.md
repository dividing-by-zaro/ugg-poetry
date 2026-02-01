## Caveman Poetry

A real-time multiplayer word-guessing party game. Teams take turns giving clues using simple "caveman" language to help teammates guess words.

## How to play

1. Create a cave or join one with a 4-letter room code
2. Pick a team (Red Tribe or Blue Tribe)
3. The clue giver sees a word and describes it using simple language
4. Teammates guess — partial match scores 1 point, full match scores 3
5. The opposing team can see the answer and BONK if the clue giver cheats
6. Team with the most points after all rounds wins

## Development

```bash
npm install
npx tsx server.ts
```

Open http://localhost:3000

## Tech stack

- Next.js 16 / React 19 / TypeScript
- Express + Socket.IO (real-time multiplayer)
- Tailwind CSS 4

## Deployment

Deployed on Railway. Requires Node.js >= 20.9.0.

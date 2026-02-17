# ⚡ FLASHBACK

**Moments That Changed Everything**

---

## What is this?

This folder is your entire game. When you put it on the internet,
people can play FlashBack on their phones.

## How do I put it on the internet?

You need ONE free account: **Vercel** (vercel.com).
Then follow the click-by-click instructions from Claude.

## How do puzzles get added?

You ask Claude in your chat:
> "Generate puzzles for March 2026"

Claude gives you the puzzles. You upload them.
That's it.

## What's in this folder?

```
app/page.js          ← The game itself
app/api/puzzle/      ← Serves today's puzzle to players
app/api/score/       ← Saves scores when someone finishes
app/api/leaderboard/ ← Rankings
app/api/player/      ← Player stats
app/api/setup/       ← Creates the database (run once)
app/api/puzzle/upload/ ← Adds new puzzles
lib/db.js            ← Talks to the database
lib/api-client.js    ← How the game talks to the backend
puzzles/             ← Test puzzles for local development
```

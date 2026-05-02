# Larp till you're Larped

`Larp till you're Larped` is a dark premium browser strategy game about faking online success without getting exposed.

The player picks an internet persona, competes against an AI rival called `The Algorithm's Favourite`, and tries to survive 12 months of growth, monetization, drama, trust decay, burnout, and scandal pressure.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion
- lucide-react
- localStorage save system
- Secure server-side `/api/generate` OpenAI route with fallback data

## What’s In The MVP

- Cinematic landing page
- Persona category selection
- Sub-persona selection
- AI/fallback profile generation for player and rival
- Premium dark game dashboard with:
  - top HUD
  - left action sidebar
  - versus clout bar
  - split player/rival empire panels
  - isometric social-media empire boards
- Monthly loop:
  - narrative setup
  - choose actions
  - run month
  - rival actions
  - random event
  - month summary
  - crisis handling
- Final wrapped-style recap
- Save / continue / restart flow via localStorage

## Run It

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Environment

Create a local `.env` file if you want live OpenAI flavor generation:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If the API key is missing or generation fails, the game automatically falls back to local structured content so the full loop still works.

## Verification

The current implementation passes:

```bash
npm run check
npm run build
```

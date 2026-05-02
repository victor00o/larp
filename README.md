# Larp

Larp is a satirical browser strategy game about building an internet persona, chasing clout, and trying not to get exposed.

## Inspiration

Larp was inspired by internet persona culture and the way people perform success online. Across social media, people build identities around startups, fitness, trading, beauty, productivity, and luxury. Some of those identities are real. Some are exaggerated. Some are pure engagement bait.

We wanted to turn that into a satirical strategy game:
**Can you grow an online persona without getting exposed?**

The project also draws from tycoon games, simulation dashboards, and the strange tension between followers, trust, money, and reputation on the internet.

## What It Does

**Larp** is an AI-powered internet persona simulator where players choose a persona and try to survive 12 months of internet growth.

Players can become personas such as:

- Dropshipper
- Day Trader
- Reseller
- Startup Founder
- Agency Owner
- Corporate Bro
- Fake Finance Bro
- Fitness Influencer
- Beauty Influencer
- Wellness Creator

Each run also includes an AI rival known as **The Algorithm's Favourite**.

Each month, the game generates a short narrative setup and 3 possible moves. The player picks 1 move, runs the month, reacts to a random event, and watches their persona evolve. Those choices affect core stats such as:

- Followers
- Engagement
- Money
- Trust
- Exposure Risk
- Burnout
- Credibility

AI is used to generate custom profiles, monthly narratives, random internet events, rival actions, and final recaps. That makes each playthrough feel funny, dynamic, and replayable, while the actual scoring and stat rules stay deterministic.

The goal is to achieve the highest clout score while surviving the chaos of the internet.

## How We Built It

We built Larp as a browser-based strategy game with a strong focus on UI, game feel, and clarity.

The frontend was built using:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui-style components**
- **Framer Motion**
- **lucide-react**

The current game uses a dark, polished dashboard inspired by strategy and simulation games, but with a simpler and more student-friendly layout. The interface is centered around one clear monthly decision loop instead of a dense analytics dashboard.

We also built a compact isometric-style social media empire board using CSS transforms, gradients, and shadows to make the game feel more visual and game-like without overwhelming the player.

AI generation is handled through a backend API route so that API keys are not exposed on the frontend. The AI generates structured JSON for player profiles, rival profiles, events, action cards, and recaps, while the app itself controls the actual game logic and stat calculations.

Game progress is saved using localStorage, allowing players to continue or restart their run.

## Challenges We Ran Into

One of the biggest challenges was balancing AI-generated content with consistent game logic. If AI controlled too much, the game could become unpredictable or unfair. To solve this, we let AI generate the flavor, story, and descriptions, while the app controls the stats, rules, scoring, and progression.

Another challenge was making the UI feel like a real game instead of a basic web form. We spent a lot of time refining the dashboard layout, action interactions, stat cards, animations, and board visuals so the experience felt polished while still being easy to understand quickly.

We also had to think carefully about safety. Since some personas involve trading, fitness, beauty, and business, we made sure the game stays fictional and satirical, avoiding real financial advice, medical advice, or harmful recommendations.

## Accomplishments That We're Proud Of

We are proud that Larp feels more like a real browser game than a simple AI wrapper. The game has a clear loop, a polished interface, meaningful stats, AI-generated replayability, and a strong satirical identity.

Some accomplishments we are especially proud of:

- Creating a polished dark game UI with a cleaner and more readable layout
- Building a 12-month simulation loop
- Adding an AI rival to make each run feel competitive
- Using AI to generate funny and contextual events
- Designing stats that create real trade-offs between growth, trust, burnout, and exposure
- Creating a final recap that makes each playthrough feel memorable and shareable
- Turning internet culture into an actual game mechanic

The game is funny, but it also reflects something real about how people perform success online.

## What We Learned

We learned that AI works best in games when it supports the experience rather than replacing the entire game system. By separating AI-generated flavor from deterministic game logic, we were able to keep the game both creative and playable.

We also learned how important UI polish is for making a project feel complete. Small details like animated stats, glowing borders, hover states, motion, and clean layout choices made a huge difference in how the game felt.

Most importantly, we learned that a strong concept matters. Once we had the core idea of internet persona simulator, every feature, stat, and event became easier to design around.

## What's Next For Larp

Next, we want to expand Larp into a deeper and more replayable simulation.

Future features could include:

- More personas and rival archetypes
- More random events and crisis scenarios
- Unlockable abilities based on playstyle
- Different endings and achievement badges
- Shareable final recap cards
- Leaderboards for clout score
- Multiplayer mode where friends compete as different personas
- AI-generated avatars and profile pages
- More detailed social media empire upgrades
- A larger event system with scandals, sponsorships, collaborations, and viral moments

Eventually, we want Larp to feel like a full satirical internet career simulator where every run tells a different story of clout, ambition, chaos, and questionable branding.

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

## Current MVP

- Start screen with persona category selection
- Sub-persona selection
- AI or fallback profile generation
- Simplified monthly dashboard
- 3 generated action choices per month
- 1 action per month gameplay loop
- AI rival turns
- Random event system
- Month summary modal
- Crisis handling
- Final recap screen
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

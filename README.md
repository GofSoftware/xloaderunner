# xLode Runner

A small game built from scratch on top of the classic *Lode Runner* — not a straight clone, but a
reimagining that keeps the core run/climb/dig loop and adds its own mechanics on top (see
[Gameplay](#gameplay)). It's also an exercise in writing a tiny game engine on top of Angular, without
leaning on any existing game framework.

The whole game renders into a single fixed-resolution 256×192 pixel "screen" (ZX-Spectrum-like), drawn
onto an HTML canvas that scales up to fill the browser window while keeping its pixel-art look crisp.

## Gameplay

- **Arrow keys** — run, climb stairs, and swing across crossbars. Walking off a ledge next to lava
  gives you a brief moment to reconsider before you fall in.
- **Collect gold** to raise your score, shown in the top-right HUD alongside your remaining lives.
- **Build your own path**: press `1`, `2`, or `3` to arm a Brick, Stairs, or Crossbar (press the same
  number again to cancel), then press an arrow key to place it in the empty cell in that direction.
- Falling into lava costs a life; running out of lives ends the game.

## Getting started

```bash
npm install
npm start
```

Then open `http://localhost:4200` — the dev server live-reloads on file changes.

Other useful commands:

```bash
npm run build   # production build, output to dist/lr
npm run watch   # development build in watch mode
npm test        # unit tests (Vitest, jsdom environment)
```

## How it's built

`src/app/` is split by what depends on Angular and what doesn't:

- **`engine/`** — a small, framework-agnostic game engine: a `GameObject`/`Script` component system
  (Unity-`MonoBehaviour`-style), a game loop, math primitives, and the pixel screen buffer the engine
  draws into. Nothing in this folder knows Angular exists.
  - `engine/game-object/` — `GameObject` and the `Script` base class.
  - `engine/screen/` — the pixel screen buffer and its drawing helpers.
  - `engine/scripts/` — the concrete building blocks of the game: the tile map and its collision rules,
    player state/animation/input, gold collection, lives, the runtime tile builder, sound/music
    playback, and renderers.
- **`ui/`** — the Angular side: a handful of standalone components (no `NgModule`s, zoneless) whose only
  job is to size a `<canvas>` and hand frame buffers from the engine to it.
- **`data/`** — hand-authored pixel art and level layout as plain `number[][]`/`TileType[][]` literals —
  no parsing step, no logic.

The engine and UI layers only talk to each other through one callback: the engine hands the UI layer a
finished pixel buffer to paint, once per frame. Everything else — physics, collision, input, state — lives
entirely in the engine layer and is unit-testable without a browser.

See [`CLAUDE.md`](./CLAUDE.md) for a more detailed architecture write-up, including the `GameObject`
lifecycle, the tile map's per-cell collision/object registry, and testing conventions.

## Testing

Unit tests run under Vitest in jsdom:

```bash
npm test                                                              # full suite
npm test -- --include src/app/engine/screen/screen-buffer.spec.ts     # a single file
npm test -- --filter "ScreenBuffer"                                   # by suite/test name
```

jsdom doesn't implement a real canvas 2D context, so canvas-drawing code is verified visually in a real
browser rather than through jsdom-based tests.

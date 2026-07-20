# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server (`ng serve`, default port 4200, live reload on file changes)
- `npm run build` — production build to `dist/lr`
- `npm run watch` — dev-mode build in watch mode
- `npm test` — unit tests (`ng test`, Vitest runner in a jsdom environment)
  - Single file: `npm test -- --include src/app/engine/screen/screen-buffer.spec.ts`
  - Filter by suite/test name: `npm test -- --filter "ScreenBuffer"`
- `npx ng generate component <name>` / `npx ng generate service <name>` — scaffold new pieces; this repo generates first, then hand-edits, so prefer this over writing boilerplate by hand.

No lint script/config is set up in this repo.

Formatting: Prettier (`.prettierrc`) — 100-char print width, single quotes, Angular parser for `.html`.

## Project layout

`src/app/` is split by what depends on Angular and what doesn't:

- **`src/app/ui/`** — all Angular-bound code (components, anything using `@Component`/signals tied to the DOM). New components go under `src/app/ui/components/<name>/`. This is the *only* place Angular-specific code should live.
- **`src/app/engine/`** — framework-agnostic game code: the `Engine` game loop, game actions, timers, animation stepping, and the screen/buffer primitives it drives (`src/app/engine/screen/`). Nothing in here knows Angular exists — it's plain TypeScript classes, no DI, no `@Component`/`@Service`.
- **`src/app/data/`** — plain data: pixel-art constants (`glyphs.ts`, `sprites.ts`). No logic, no Angular, no engine dependencies — just literal `number[][]` arrays.

## Architecture

This is an Angular 22 app, **zoneless** (no `zone.js`) and **moduleless** (standalone components only, no `NgModule`s anywhere). File/class naming follows the 2025 Angular style guide: no type suffixes (`app.ts` exports `App`, `header.ts` exports `Header`). Angular services (where still used, e.g. none currently in the engine layer) use the newer `@Service()` decorator rather than `@Injectable({ providedIn: 'root' })`.

The app renders a tiny fixed-resolution pixel "screen" (256×192, a ZX-Spectrum-like resolution) that auto-scales to fill the browser window width while preserving aspect ratio. The engine and UI layers are deliberately decoupled — the engine drives frames and owns pixel data; the UI layer only knows how to paint a buffer snapshot to canvas:

- **`Engine`** (`src/app/engine/engine.ts`) is a plain-TypeScript singleton (private constructor, lazily created via the static `Engine.instance` getter). It owns a `ScreenBuffer` (created via `ScreenBuffer.create()`) and drives the game loop:
  - `start()` / `stop()` toggle an internal `started` flag.
  - `setRender(uiRender)` lets any UI layer register a callback of shape `(buffer: Readonly<number[][]>) => void` — this is the *only* connection between Engine and the UI; Engine never imports anything Angular.
  - A private `render()` computes `deltaTime`, calls `ScreenBuffer.copy()` to draw the current scene's sprites into the buffer, invokes the registered `uiRender` callback with the buffer, and reschedules itself via `setTimeout(() => this.render(), FRAME_RATE)` (`FRAME_RATE` is currently `0`, i.e. "as fast as the timer allows" — a placeholder, not a real frame-rate limiter yet).
- **`ScreenBuffer`** (`src/app/engine/screen/screen-buffer.ts`) is now a plain class, not Angular DI — construct it via the static `ScreenBuffer.create()`. It just holds a private `number[][]` pixel buffer, exposes it read-only via a `buffer` getter, and `copy(source, x, y)` to blit sprite data into it (delegating to `ScreenHelper.copy`, which mutates in place). It has no knowledge of canvases or rendering.
- **`ScreenHelper`** (`src/app/engine/screen/screen.helper.ts`) is a static-method helper class (this repo's convention: group pure/stateless logic in `*Helper` classes rather than free functions) with `unpackRgba`, `defaultPixels` (blank transparent buffer), and `copy` (the mutating blit primitive).
- **`screen.constants.ts`** (same folder) defines `SCREEN_WIDTH`/`SCREEN_HEIGHT` and single-letter packed-pixel constants — `_` (transparent), `W`/`R`/`G`/`B` (white/red/green/blue) — deliberately short so literal sprite arrays read as a recognizable pixel-art grid in source.
- **`Screen`** (`src/app/ui/components/screen/screen.ts`) is the only place canvas-drawing code lives now. It sizes itself from `window.innerWidth` (via a `(window:resize)` host binding), computes `scale = windowWidth / SCREEN_WIDTH`, and emits that via a `scaleChange` output. In `afterNextRender()` it registers its own `render(buffer)` method with `Engine.instance.setRender(...)` — every Engine tick calls back into `Screen` with the latest buffer, and `Screen` does the `ImageData`/`putImageData` work to paint it.
- **`Header`** (`src/app/ui/components/header/`) just displays the current scale (`{{ scale().toFixed(2) }}x`) — no controls.
- **`App`** (`src/app/app.ts`) is the composition root: it holds the `scale` signal (fed by `Screen`'s `scaleChange`, displayed by `Header`) and kicks off everything by calling `Engine.instance.start()` in its constructor.

`src/app/data/glyphs.ts` / `sprites.ts` hold hand-authored `number[][]` pixel art (e.g. `LETTER_A`; `MAN_STANDING_FRAME_1/2/3`; `OBJECT_EMPTY`/`OBJECT_BRICK`/`OBJECT_STAIRS`), each built directly from `screen.constants.ts`'s pixel constants (no parsing/decoding step). `Engine.render()` currently redraws this same fixed demo scene every tick.

### Known issues (as of the last engine/UI split)

- **The render loop doesn't actually start.** `Engine.start()` only sets `started = true` and records `previousFrameTime` — nothing ever calls `render()` for the first time (it's only ever invoked recursively from inside itself via `setTimeout`). Confirmed live: the canvas stays at its default 300×150 size with nothing drawn. `start()` needs to kick off the first `render()` call. (Not yet fixed — deliberately deferred.)

### Testing notes

jsdom does not implement a real canvas 2D context — `canvas.getContext('2d')` logs "not implemented" and returns `null`. When testing canvas-drawing code (currently in `Screen`), stub `getContext` with a minimal fake context object that records what gets passed to `putImageData`, so tests assert on real rendered pixel output.

### Browser verification

A Playwright MCP server is configured (`.mcp.json`) specifically because canvas rendering can't be verified through jsdom-based unit tests — use it to visually confirm rendering/resizing behavior in a real browser when changing anything under `src/app/ui/components/screen/` or `src/app/engine/`.

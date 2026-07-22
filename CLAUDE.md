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

Formatting: Prettier (`.prettierrc`) — 140-char print width, single quotes, Angular parser for `.html`.

## Project layout

`src/app/` is split by what depends on Angular and what doesn't:

- **`src/app/ui/`** — all Angular-bound code (components, anything using `@Component`/signals tied to the DOM). New components go under `src/app/ui/components/<name>/`. This is the *only* place Angular-specific code should live.
- **`src/app/engine/`** — framework-agnostic game code: the `Engine` game loop, the `GameObject`/`Script` component system, math primitives, and the screen/buffer primitives the engine drives. Nothing in here knows Angular exists — it's plain TypeScript classes, no DI, no `@Component`/`@Service`. Subfolders:
  - `engine/game-object/` — `GameObject` and the `Script` base class.
  - `engine/math/` — `Vector2`.
  - `engine/screen/` — `ScreenBuffer`, `ScreenHelper`, `screen.constants.ts`.
  - `engine/scripts/` — concrete `Script` subclasses (renderers, behaviors).
  - Naming convention in this layer differs from `ui/`: interfaces are prefixed `I` (`IGameObject`, `IScript`, `IVector2`, `IEngineState`), and classes with a static `create()` factory keep their constructor `private` (`GameObject`, `Vector2`, `ScreenBuffer`).
- **`src/app/data/`** — plain data: pixel-art constants (`glyphs.ts`, `sprites.ts`). No logic, no Angular, no engine dependencies — just literal `number[][]` arrays.

## Architecture

This is an Angular 22 app, **zoneless** (no `zone.js`) and **moduleless** (standalone components only, no `NgModule`s anywhere). File/class naming follows the 2025 Angular style guide: no type suffixes (`app.ts` exports `App`, `header.ts` exports `Header`). Angular services (where still used, e.g. none currently in the engine layer) use the newer `@Service()` decorator rather than `@Injectable({ providedIn: 'root' })`.

The app renders a tiny fixed-resolution pixel "screen" (256×192, a ZX-Spectrum-like resolution) that auto-scales to fill the browser window width while preserving aspect ratio. The engine and UI layers are deliberately decoupled — the engine drives frames and owns pixel data; the UI layer only knows how to paint a buffer snapshot to canvas.

### Engine and the GameObject/Script component system

- **`Engine`** (`src/app/engine/engine.ts`) is a plain-TypeScript singleton (private constructor, lazily created via the static `Engine.instance` getter) and implements `IEngineState` (see below). It owns a `ScreenBuffer` and a `gameObjects: GameObject[]` list, and drives the game loop:
  - `start()` records `previousFrameTime`, sets `started = true`, calls `initLevel()` to build the scene's `GameObject`s (calling `.start()` on each), and then calls `render()` directly to kick off the loop.
  - `stop()` clears `started` and calls `.destroy()` on every game object.
  - `setRender(uiRender)` lets any UI layer register a callback of shape `(buffer: Readonly<number[][]>) => void` — this is the *only* connection between Engine and the UI; Engine never imports anything Angular.
  - A private `render()` computes `deltaTime` (in seconds), calls `.update()` on every game object (which is what actually mutates `ScreenBuffer` — see below), invokes the registered `uiRender` callback with the buffer, and reschedules itself via `setTimeout(() => this.render(), FRAME_RATE)` (`FRAME_RATE` is currently `0`, i.e. "as fast as the timer allows" — a placeholder, not a real frame-rate limiter yet).
  - `initLevel()` hardcodes the current demo scene as a list of `GameObject.create(engineState, position, scriptFactories)` calls (the letter, brick/stair tiles, and an animated standing man) — this is where new game content currently gets added.
- **`IEngineState`** (`src/app/engine/i-engine-state.ts`) is the interface `Engine` implements and the only thing a `GameObject`/`Script` sees of it: `{ screenBuffer: ScreenBuffer; deltaTime: number }`. This is how engine-driven code reaches the buffer and frame timing without depending on the `Engine` class itself.
- **`GameObject`** (`src/app/engine/game-object/game-object.ts`) is a Unity-style entity: an `IEngineState` reference, a `position` (`Vector2`), and a list of `Script` instances. Constructed via `GameObject.create(engineState, position, scriptFactories)`, where each `scriptFactory` is `(gameObject: GameObject) => Script` — factories (not script instances) are passed in so each script can receive a reference to the `GameObject` that owns it. `start()`/`update()`/`destroy()` just fan out to every attached script's same-named lifecycle method.
- **`Script`** (`src/app/engine/game-object/script.ts`) is a base class with no-op `start()`/`update()`/`destroy()` methods, meant to be subclassed (Unity `MonoBehaviour`-style). `IScript` (`i-script.ts`) exists alongside it but is currently an empty marker interface that `Script` doesn't implement — not yet wired up to anything.
- **`BitmapRenderer`** (`src/app/engine/scripts/bitmap-renderer.ts`) is a `Script` that copies a single static `number[][]` bitmap onto `ScreenBuffer` at its `GameObject`'s position every `update()`.
- **`BitmapSpriteRenderer`** (`src/app/engine/scripts/bitmap-sprite-renderer.ts`) is a `Script` that cycles through an array of bitmap frames: each `update()` advances `spriteIndexTime` by `framesPerSecond * deltaTime` and draws `bitmap[Math.floor(spriteIndexTime)]`.
- **`Vector2`** (`src/app/engine/math/vector-2.ts`) implements `IVector2` (`{ x: number; y: number }`) and is constructed via `Vector2.create(x, y)`.

### Screen buffer and rendering

- **`ScreenBuffer`** (`src/app/engine/screen/screen-buffer.ts`) is a plain class — construct it via the static `ScreenBuffer.create()`. It just holds a private `number[][]` pixel buffer, exposes it read-only via a `buffer` getter, and `copy(source, x, y)` to blit sprite data into it (delegating to `ScreenHelper.copy`, which mutates in place). It has no knowledge of canvases or rendering.
- **`ScreenHelper`** (`src/app/engine/screen/screen.helper.ts`) is a static-method helper class (this repo's convention: group pure/stateless logic in `*Helper` classes rather than free functions) with `unpackRgba`, `defaultPixels` (blank transparent buffer), and `copy` (the mutating blit primitive).
- **`screen.constants.ts`** (same folder) defines `SCREEN_WIDTH`/`SCREEN_HEIGHT` and single-letter packed-pixel constants — `_` (transparent), `W`/`R`/`G`/`B` (white/red/green/blue) — deliberately short so literal sprite arrays read as a recognizable pixel-art grid in source.
- **`Screen`** (`src/app/ui/components/screen/screen.ts`) is the only place canvas-drawing code lives. It sizes itself from `window.innerWidth` (via a `(window:resize)` host binding), computes `scale = windowWidth / SCREEN_WIDTH`, and emits that via a `scaleChange` output. In `afterNextRender()` it registers its own `render(buffer)` method with `Engine.instance.setRender(...)` — every Engine tick calls back into `Screen` with the latest buffer, and `Screen` does the `ImageData`/`putImageData` work to paint it.
- **`Header`** (`src/app/ui/components/header/`) just displays the current scale (`{{ scale().toFixed(2) }}x`) — no controls.
- **`App`** (`src/app/app.ts`) is the composition root: it holds the `scale` signal (fed by `Screen`'s `scaleChange`, displayed by `Header`) and kicks off everything by calling `Engine.instance.start()` in its constructor.

`src/app/data/glyphs.ts` / `sprites.ts` hold hand-authored `number[][]` pixel art (e.g. `LETTER_A`; `MAN_STANDING_FRAME_1..4`; `OBJECT_EMPTY`/`OBJECT_BRICK`/`OBJECT_STAIRS`), each built directly from `screen.constants.ts`'s pixel constants (no parsing/decoding step).

### Known issues (found while reviewing the GameObject/Script addition)

- **`Vector2.create(x, y)` always produces `(0, 0)`.** Its private constructor takes `x`/`y` params but never assigns them (`this.x`/`this.y` stay at their field-initializer default of `0`). Currently dormant — nothing in the codebase calls `Vector2.create()`; `GameObject` positions are passed as plain `{ x, y }` object literals instead, which happen to structurally satisfy the `Vector2` type. Will bite as soon as something actually uses the factory.
- **`BitmapSpriteRenderer`'s frame-wrap logic looks wrong.** When `spriteIndexTime >= bitmap.length`, it resets via `spriteIndexTime - Math.floor(spriteIndexTime)`, which is just the fractional part of the number (equivalent to `% 1`), not `% bitmap.length`. For any animation with more than one frame this snaps the animation back to indexes 0–1 instead of looping through all frames.

### Testing notes

jsdom does not implement a real canvas 2D context — `canvas.getContext('2d')` logs "not implemented" and returns `null`. When testing canvas-drawing code (currently in `Screen`), stub `getContext` with a minimal fake context object that records what gets passed to `putImageData`, so tests assert on real rendered pixel output.

### Browser verification

A Playwright MCP server is configured (`.mcp.json`) specifically because canvas rendering can't be verified through jsdom-based unit tests — use it to visually confirm rendering/resizing behavior in a real browser when changing anything under `src/app/ui/components/screen/` or `src/app/engine/`.
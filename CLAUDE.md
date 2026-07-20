# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server (`ng serve`, default port 4200, live reload on file changes)
- `npm run build` — production build to `dist/lr`
- `npm run watch` — dev-mode build in watch mode
- `npm test` — unit tests (`ng test`, Vitest runner in a jsdom environment)
  - Single file: `npm test -- --include src/app/screen/screen-buffer.spec.ts`
  - Filter by suite/test name: `npm test -- --filter "ScreenBuffer"`
- `npx ng generate component <name>` / `npx ng generate service <name>` — scaffold new pieces; this repo generates first, then hand-edits, so prefer this over writing boilerplate by hand.

No lint script/config is set up in this repo.

Formatting: Prettier (`.prettierrc`) — 100-char print width, single quotes, Angular parser for `.html`.

## Architecture

This is an Angular 22 app, **zoneless** (no `zone.js`) and **moduleless** (standalone components only, no `NgModule`s anywhere). File/class naming follows the 2025 Angular style guide: no type suffixes (`app.ts` exports `App`, `header.ts` exports `Header`, not `*.component.ts` / `*ComponentPipe`, etc). Services use the newer `@Service()` decorator (auto-provided at root by default) rather than `@Injectable({ providedIn: 'root' })`.

The app renders a tiny fixed-resolution pixel "screen" (256×192, a ZX-Spectrum-like resolution) that auto-scales to fill the browser window width while preserving aspect ratio. The pieces, under `src/app/screen/`:

- **`ScreenBuffer`** (`screen-buffer.ts`, `@Service()`) is the single source of truth for the actual pixel data. It owns a private `number[][]` buffer (each cell a packed `0xRRGGBBAA` integer) and a reference to the `<canvas>` element, and is the *only* thing that ever draws to the canvas. Its API:
  - `init(canvas)` — registers the canvas (called once by `Screen`) and paints the current buffer.
  - `startUpdate()` / `stopUpdate()` — a nestable counter. `copy()` throws if called without an open `startUpdate()`. Only when `stopUpdate()` brings the counter back to zero does the buffer actually get repainted — this lets a caller batch many `copy()` calls (even across nested start/stop pairs) behind a single render.
  - `copy(source, x, y)` — blits an 8×8 (or any size) sprite array onto the buffer at `(x, y)`, clipped at the screen edges.
- **`Screen`** (`screen.ts`) is purely presentational: it sizes itself from `window.innerWidth` (via a `(window:resize)` host binding), computes `scale = windowWidth / SCREEN_WIDTH`, and emits that scale via a `scaleChange` output. It hands its `<canvas>` element to `ScreenBuffer` exactly once, via `afterNextRender()`, and has no drawing logic of its own.
- **`ScreenHelper`** (`screen.helper.ts`) is a static-method helper class (this repo's convention: group pure/stateless logic in `*Helper` classes rather than free functions) with `unpackRgba`, `defaultPixels` (blank transparent buffer), and `copy` (the mutating blit primitive `ScreenBuffer.copy` builds on).
- **`screen.constants.ts`** defines `SCREEN_WIDTH`/`SCREEN_HEIGHT` and single-letter packed-pixel constants — `_` (transparent), `W`/`R`/`G`/`B` (white/red/green/blue) — deliberately short so literal sprite arrays read as a recognizable pixel-art grid in source.
- **`glyphs.ts`** / **`sprites.ts`** hold hand-authored `number[][]` pixel art (e.g. `LETTER_A`; `MAN_STANDING_FRAME_1/2/3`; `OBJECT_EMPTY`/`OBJECT_BRICK`/`OBJECT_STAIRS`), each built directly from the constants above (no parsing/decoding step).
- **`Header`** just displays the current scale (`{{ scale().toFixed(2) }}x`) — it has no controls; it previously had +/- zoom buttons which were removed in favor of automatic window-driven scaling.
- **`App`** is the composition root: it holds the `scale` signal (fed by `Screen`'s `scaleChange`, displayed by `Header`) and injects `ScreenBuffer` directly to paint the initial demo scene via `startUpdate()`/`copy()`/`stopUpdate()`.

### Testing notes

jsdom does not implement a real canvas 2D context — `canvas.getContext('2d')` logs "not implemented" and returns `null`. `screen-buffer.spec.ts` works around this by stubbing `getContext` with a minimal fake context object that records what `render()` actually passes to `putImageData`, so tests assert on real rendered pixel output rather than reaching into `ScreenBuffer`'s private buffer.

### Browser verification

A Playwright MCP server is configured (`.mcp.json`) specifically because canvas rendering can't be verified through jsdom-based unit tests — use it to visually confirm rendering/resizing behavior in a real browser when changing anything under `src/app/screen/`.

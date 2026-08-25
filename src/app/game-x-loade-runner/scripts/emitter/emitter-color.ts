// Split out from emitter-script.ts/emitter-manager.ts so both can import it as a real (non-circular)
// dependency - EmitterScript needs the real EmitterManager class (for getScript), and EmitterManager
// needs the real EmitterColor values (as Record keys), so those two can't both import each other by value.
export enum EmitterColor {
  Green = 'Green',
  Blue = 'Blue',
}

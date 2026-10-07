/**
 * Returns a 2d drawing context for `canvas`, or a no-op stand-in when
 * the environment cannot provide one (e.g. jsdom).
 *
 * @param canvas - The canvas element to obtain a context from
 * @returns A real CanvasRenderingContext2D, or a duck-typed no-op
 */
export function getCanvasContext2D(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D;

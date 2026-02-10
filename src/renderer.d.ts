export function deferRender(callback: () => unknown): [number, number, () => unknown];
export function deferMeasure(callback: () => unknown): [number, number, () => unknown];
export function deferRenderNext(callback: () => unknown): [number, number, () => unknown];
export function deferMeasureNext(callback: () => unknown): [number, number, () => unknown];
export function combineDefer(
  ...args: ([number, number, () => unknown] | unknown)[]
): [number, number, () => unknown] | null;
export class Renderer {
  tasks: unknown[];
  constructor();
  getDependencyMap(): Map<unknown, unknown>;
  run(
    frame: number,
    phase: number,
    runnable: unknown,
    animations: unknown[],
    context: unknown
  ): number;
}
export function defineTask(
  phase: number,
  dependencies: unknown[],
  run: () => unknown,
  debug?: string
): unknown;
export function defineRender(
  dependencies: unknown[],
  run: () => unknown,
  debug?: string
): unknown;
export function defineRecalculation(
  dependencies: unknown[],
  run: () => unknown,
  debug?: string
): unknown;
export function defineMeasure(
  dependencies: unknown[],
  run: () => unknown,
  debug?: string
): unknown;
export function defineMultiPhaseRenderer(
  phase: number,
  dependencies: unknown[],
  run: () => unknown,
  debug?: string
): unknown;
export class RenderState {
  constructor();
}
export function getRenderers(Class: unknown): unknown[];

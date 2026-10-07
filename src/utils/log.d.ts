export function setConsole(
  next: { log?: Function; warn?: Function; error?: Function } | null
): void;
export function error(...args: unknown[]): void;
export function warn(...args: unknown[]): void;
export function log(...args: unknown[]): void;
export function printWidgetTree(w: unknown, depth?: number): void;

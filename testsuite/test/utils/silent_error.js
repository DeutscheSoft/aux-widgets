/**
 * Error that the testsuite console sink suppresses.
 * Use for throws that intentionally exercise library error paths.
 */
export class SilentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SilentError';
  }
}

function hasSilentError(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] instanceof SilentError) return true;
  }
  return false;
}

/**
 * Console-like sink that forwards to the real console except when any
 * argument is a {@link SilentError}.
 */
export const testConsole = {
  log(...args) {
    if (hasSilentError(args)) return;
    console.log(...args);
  },
  warn(...args) {
    if (hasSilentError(args)) return;
    console.warn(...args);
  },
  error(...args) {
    if (hasSilentError(args)) return;
    console.error(...args);
  },
};

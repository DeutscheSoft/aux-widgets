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

function formatArg(arg) {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.name + ': ' + arg.message;
  if (arg && typeof arg === 'object' && arg.constructor)
    return arg.constructor.name;
  return String(arg);
}

function unexpectedConsole(method, args) {
  const summary = Array.from(args, formatArg).join(' ');
  throw new Error('Unexpected console.' + method + ': ' + summary);
}

/**
 * Console-like sink for the library logger.
 * {@link SilentError} arguments are ignored; any other output fails the test.
 */
export const testConsole = {
  log(...args) {
    if (hasSilentError(args)) return;
    unexpectedConsole('log', args);
  },
  warn(...args) {
    if (hasSilentError(args)) return;
    unexpectedConsole('warn', args);
  },
  error(...args) {
    if (hasSilentError(args)) return;
    unexpectedConsole('error', args);
  },
};

/**
 * Timer handle - can be either a callback function or a Timer instance.
 */
export type ITimerHandle = (() => void) | Timer;

/**
 * This class represents a single timer. It is faster than manual setTimeout
 * in situations in which the timer is regularly delayed while it is running.
 */
export declare class Timer {
  /**
   * @param callback - The callback to be called when the timer expires.
   */
  constructor(callback: () => void);

  /** The callback function. */
  callback: () => void;
  /** Internal timer ID. */
  id: number | undefined;
  /** Target time in milliseconds. */
  time: number;

  /**
   * Start the timer with a given offset. Same as restart().
   * @param delta - Offset in milliseconds.
   */
  start(delta: number): void;

  /**
   * Set a new expiry time for the timer at the given number
   * of milliseconds from now.
   * @param delta - Offset in milliseconds.
   */
  restart(delta: number): void;

  /**
   * Check if the timer is currently active.
   */
  get active(): boolean;

  /**
   * Stop the timer.
   */
  stop(): void;
}

/**
 * ProximityTimers manages timers that are scheduled close together,
 * grouping callbacks that should fire at similar times.
 */
export declare class ProximityTimers {
  /**
   * @param accuracy - The accuracy in milliseconds for grouping timers. Defaults to 20.
   */
  constructor(accuracy?: number);

  /**
   * Schedule a method to be run at the given point in the future.
   * @param callback - The callback function to execute.
   * @param target - Target time in milliseconds (absolute time from performance.now()).
   */
  scheduleAt(callback: () => void, target: number): void;

  /**
   * Schedule a method to be run in the given number of milliseconds.
   * @param callback - The callback function to execute.
   * @param offset - Offset in milliseconds from now.
   */
  scheduleIn(callback: () => void, offset: number): void;
}

/**
 * Initialize a timer from a given callback. Returns the timer handle.
 * @param callback - The callback function.
 * @returns The callback function (timer handle).
 */
export function createTimer(callback: () => void): () => void;

/**
 * Reschedules the timer for the given timer handle. Returns the new timer handle.
 * If a function is provided, it will be converted to a Timer instance.
 * @param timer - The timer handle (function or Timer instance).
 * @param delta - Offset in milliseconds.
 * @returns The Timer instance.
 */
export function startTimer(timer: ITimerHandle, delta: number): Timer;

/**
 * Stops the timer for the given timer handle. Returns the new timer handle.
 * If a Timer instance is provided, it will be stopped and the callback function is returned.
 * If a function is provided, it is returned as-is.
 * @param timer - The timer handle (function or Timer instance).
 * @returns The callback function.
 */
export function destroyTimer(timer: ITimerHandle): () => void;

/**
 * Cancels the timer for the given timer handle. Returns the new timer handle.
 * If a Timer instance is provided, it will be stopped.
 * @param timer - The timer handle (function or Timer instance).
 * @returns The timer handle (function or Timer instance).
 */
export function cancelTimer(timer: ITimerHandle): ITimerHandle;

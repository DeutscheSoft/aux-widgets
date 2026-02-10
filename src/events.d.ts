/**
 * This class implements event handling.
 */
export declare class Events {
  constructor();

  /**
   * Register an event handler. If the same event handler is already
   * registered, an exception is thrown.
   * @param name - The event name.
   * @param callback - The event callback.
   */
  on(name: string, callback: (...args: unknown[]) => unknown): void;

  /**
   * Alias for on.
   * @param name - The event name.
   * @param callback - The event callback.
   */
  addEventListener(
    name: string,
    callback: (...args: unknown[]) => unknown
  ): void;

  /**
   * Removes an event handler.
   * @param name - The event name.
   * @param callback - The event callback.
   */
  off(name: string, callback: (...args: unknown[]) => unknown): void;

  /**
   * Alias for off.
   * @param name - The event name.
   * @param callback - The event callback.
   */
  removeEventListener(
    name: string,
    callback: (...args: unknown[]) => unknown
  ): void;

  /**
   * Returns true if the specified event handler is registered.
   * If no callback is specified, true is returned if any event
   * handler is installed for the given event name.
   * @param name - The event name.
   * @param callback - The event callback (optional).
   * @returns True if the event handler is registered.
   */
  hasEventListener(
    name: string,
    callback?: (...args: unknown[]) => unknown
  ): boolean;

  /**
   * Emit an event.
   *
   * Event processing stops when the first event handler returns
   * anything other than undefined.
   *
   * If an event handler throws an exception, it is logged to the
   * developer console.
   * @param name - The event name.
   * @param args - Event arguments.
   * @returns Returns the value returned by the last event handler
   *          called or undefined.
   */
  emit(name: string, ...args: unknown[]): unknown;

  /**
   * This method is similar to emit() except that it returns false
   * if an event handler stopped event processing.
   * @param name - The event name.
   * @param args - Event arguments.
   * @returns The return value is false, if an event
   *          handler cancelled the event processing
   *          by returning something other than undefined.
   *          Otherwise, the return value is true.
   */
  dispatchEvent(name: string, ...args: unknown[]): boolean;

  /**
   * Register an event handler. If the same event handler is already
   * registered, an exception is thrown.
   *
   * This method returns a function which removes the event handler.
   * @param event - The event name.
   * @param func - The event callback.
   * @returns The return value is a function which can
   *          be called to remove the event subscription.
   */
  subscribe(event: string, func: (...args: unknown[]) => unknown): () => void;

  /**
   * Register an event handler to be executed once.
   * @param name - The event name.
   * @param callback - The event callback.
   * @returns The return value is a function which can
   *          be called to remove the event subscription.
   */
  once(event: string, func: (...args: unknown[]) => unknown): () => void;

  /**
   * Removes all event handlers.
   */
  destroy(): void;
}

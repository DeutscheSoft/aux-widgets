/**
 * Installs and removes DOM event listeners on a global (or other shared)
 * target. Call `activate` / `deactivate` to arm and disarm the listener(s),
 * and `destroy` from widget `destroy()` so nothing is left attached after
 * teardown.
 */
export declare class GlobalEventHandler {
  /**
   * @param target - Element or document to listen on.
   * @param type - Event type, or list of types sharing one callback.
   * @param callback - Listener callback.
   * @param options - Options passed to `addEventListener` / `removeEventListener`.
   */
  constructor(
    target: EventTarget,
    type: string | string[],
    callback: EventListener,
    options?: boolean | AddEventListenerOptions
  );

  /** Whether the listener(s) are currently installed. */
  readonly active: boolean;

  /** Install the listener(s) if not already active. */
  activate(): void;

  /** Remove the listener(s) if currently active. */
  deactivate(): void;

  /** Activate or deactivate to match `on`. */
  setActive(on: boolean): void;

  /** Deactivate. Safe to call more than once. */
  destroy(): void;
}

/**
 * This file exists in both `@deutschesoft/aux-widgets` and `@deutschesoft/awml`
 * (`src/values.interface.d.ts`) and must be kept in sync.
 */

/**
 * Teardown returned from {@link ReadableValue.subscribe}.
 * Always a bare function — wrap RxJS Observables with `fromObservable`.
 */
export type Unsubscribe = () => void;

/**
 * A readable stream of values. Stateful implementations should emit the
 * current value (if any) synchronously to new subscribers, then emit updates.
 * There is no `replay` flag on `subscribe` — use an operator such as
 * `skipSync` when the initial synchronous delivery must be ignored.
 *
 * `subscribe` always returns an {@link Unsubscribe} function. RxJS
 * `Observable` / `Subject` are not {@link ReadableValue}s directly — use
 * `fromObservable` (receive) or `fromSubject` (duplex via `next` → `set`).
 */
export interface ReadableValue<T = unknown> {
  /**
   * Subscribe to the value.
   *
   * @param subscriber - Called with every value (including a synchronous
   *   current value when the source is stateful).
   * @returns Unsubscribe function.
   */
  subscribe(subscriber: (value: T) => void): Unsubscribe;
}

/**
 * A writable value sink. Orthogonal to {@link ReadableValue}: writable does
 * not imply readable.
 */
export interface WritableValue<T = unknown> {
  set(value: T): void | Promise<void>;
}

/**
 * A value that is both readable and writable.
 */
export type ReadwriteValue<T = unknown> = ReadableValue<T> & WritableValue<T>;

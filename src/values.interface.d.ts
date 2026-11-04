/**
 * Teardown returned from {@link ReadableValue.subscribe}.
 * A bare function or an RxJS-style subscription object are both accepted;
 * callers such as `bind` / `Subscriptions.add` normalize either form.
 */
export type Unsubscribe = (() => void) | { unsubscribe(): void };

/**
 * A readable stream of values. Stateful implementations should emit the
 * current value (if any) synchronously to new subscribers, then emit updates.
 * There is no `replay` flag on `subscribe` — use an operator such as
 * `skipSync` when the initial synchronous delivery must be ignored.
 *
 * `subscribe` may return either an unsubscribe function or
 * `{ unsubscribe() }` so RxJS `Observable` (and similar) can be used directly
 * as a {@link ReadableValue}. Duplex write still needs {@link WritableValue.set}
 * (e.g. `fromSubject` for a {@link SubjectLike}).
 */
export interface ReadableValue<T = unknown> {
  /**
   * Subscribe to the value.
   *
   * @param subscriber - Called with every value (including a synchronous
   *   current value when the source is stateful).
   * @returns Unsubscribe function or `{ unsubscribe(): void }`.
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

/**
 * Observable + push sink (RxJS `Subject` / `BehaviorSubject` shape).
 * Already a {@link ReadableValue}; use `fromSubject` to expose
 * {@link WritableValue.set} via `next`.
 */
export interface SubjectLike<T = unknown> extends ReadableValue<T> {
  next(value: T): void;
}

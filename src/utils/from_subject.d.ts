import type {
  Unsubscribe,
  ReadableValue,
  ReadwriteValue,
} from '../values.interface.js';

/**
 * Teardown returned by Observable-like `subscribe` (function or RxJS
 * `{ unsubscribe() }`). Normalized by {@link fromObservable} /
 * {@link fromSubject}.
 */
export type ObservableUnsubscribe = Unsubscribe | { unsubscribe(): void };

/**
 * Duck type for RxJS `Observable` (and similar): `subscribe` may return a
 * function or `{ unsubscribe() }`. Not a {@link ReadableValue} — wrap with
 * {@link fromObservable}.
 */
export interface ObservableLike<T = unknown> {
  subscribe(subscriber: (value: T) => void): ObservableUnsubscribe;
}

/**
 * Observable + push sink (RxJS `Subject` / `BehaviorSubject` shape).
 * Not a {@link ReadableValue} / {@link ReadwriteValue} — use
 * {@link fromSubject} (`set` → `next`) or {@link fromObservable} for
 * receive-only.
 */
export interface SubjectLike<T = unknown> extends ObservableLike<T> {
  next(value: T): void;
}

/**
 * Wraps an {@link ObservableLike} as a {@link ReadableValue} by normalizing
 * `subscribe` teardown to a function.
 */
export function fromObservable<T>(
  observable: ObservableLike<T>
): ReadableValue<T>;

/**
 * Wraps a {@link SubjectLike} as a {@link ReadwriteValue} by normalizing
 * subscribe teardown and mapping `set(value)` to `subject.next(value)`.
 */
export function fromSubject<T>(subject: SubjectLike<T>): ReadwriteValue<T>;

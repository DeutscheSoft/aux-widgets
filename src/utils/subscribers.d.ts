/**
 * Utilities for handling subscribers.
 *
 * Subscribers are represented as:
 * - `null` for an empty list
 * - A single function for one subscriber
 * - An array of functions for a small number of subscribers
 * - A `Set` of functions for a larger number of subscribers
 */

/**
 * Type representing a subscriber list.
 * Can be null (empty), a single function, an array of functions, or a Set of
 * functions.
 */
export type SubscriberList<
  T extends (...args: any[]) => void = (...args: any[]) => void
> = null | T | T[] | Set<T>;

/**
 * Initialize a list of subscribers.
 * Returns null representing an empty subscriber list.
 */
export function initSubscribers(): null;

/**
 * Returns true if the given subscribers are empty.
 */
export function subscribersIsEmpty(
  subscribers: SubscriberList
): subscribers is null;

/**
 * Returns true if the given callback is in the list of subscribers.
 *
 * @param subscribers - The subscriber list
 * @param cb - The callback function to look up
 * @throws {TypeError} If cb is not a function or subscribers is invalid
 */
export function hasSubscriber<T extends (...args: any[]) => void>(
  subscribers: SubscriberList<T>,
  cb: T
): boolean;

/**
 * Call callback for each subscriber.
 *
 * If callback returns a value other than undefined, iteration stops and that
 * value is returned.
 *
 * @param subscribers - The subscriber list
 * @param callback - Called once per subscriber
 */
export function forEachSubscriber<
  T extends (...args: any[]) => void,
  R = undefined
>(subscribers: SubscriberList<T>, callback: (cb: T) => R | void): R | undefined;

/**
 * Add a subscriber to the given subscribers. Returns the new subscribers.
 * Empty lists use `null`, a single subscriber is stored as the function
 * itself, a small number of subscribers as an array, and a larger number as a
 * `Set`.
 *
 * @param subscribers - The current subscriber list
 * @param cb - The callback function to add
 * @returns The new subscriber list
 * @throws {TypeError} If cb is not a function or subscribers is invalid
 * @throws {Error} If the subscriber is already present
 */
export function addSubscriber<T extends (...args: any[]) => void>(
  subscribers: SubscriberList<T>,
  cb: T
): SubscriberList<T>;

/**
 * Merge two subscriber lists. Returns a new list with the subscribers from
 * `a` followed by any subscribers from `b` that are not already present.
 * Neither argument is modified.
 *
 * @param a - The first subscriber list
 * @param b - The second subscriber list
 * @returns The merged subscriber list
 */
export function mergeSubscribers<T extends (...args: any[]) => void>(
  a: SubscriberList<T> | null | undefined,
  b: SubscriberList<T> | null | undefined
): SubscriberList<T>;

/**
 * Removes a subscriber callback from the list of subscribers and
 * returns the resulting list of subscribers.
 *
 * @param subscribers - The current subscriber list
 * @param cb - The callback function to remove
 * @returns The new subscriber list
 * @throws {TypeError} If cb is not a function or subscribers is invalid
 * @throws {Error} If the subscriber is not found
 */
export function removeSubscriber<T extends (...args: any[]) => void>(
  subscribers: SubscriberList<T>,
  cb: T
): SubscriberList<T>;

/**
 * Call the list of subscribers with the given arguments.
 * Exceptions thrown by subscribers are caught and logged via subscriberError.
 *
 * @param subscribers - The subscriber list to call
 * @param args - Arguments to pass to each subscriber
 */
export function callSubscribers<T extends (...args: any[]) => void>(
  subscribers: SubscriberList<T>,
  ...args: Parameters<T>
): void;

/**
 * Logs an error that occurred in a subscriber callback.
 * @internal
 */
export function subscriberError(err: unknown): void;

/**
 * A class for representing a list of subscribers.
 * Empty lists use `null`, a single subscriber is stored as the function
 * itself, a small number of subscribers as an array, and a larger number as a
 * `Set`.
 */
export class Subscribers<
  T extends (...args: any[]) => void = (...args: any[]) => void
> {
  /** @internal The subscriber list */
  subscribers: SubscriberList<T>;

  constructor();

  /**
   * Add a subscriber.
   * @param cb - The callback function to add
   * @throws {Error} If the subscriber is already present
   */
  add(cb: T): void;

  /**
   * Remove a subscriber.
   * @param cb - The callback function to remove
   * @throws {Error} If the subscriber is not found
   */
  remove(cb: T): void;

  /**
   * Call all subscribers with the given arguments.
   * @param args - Arguments to pass to each subscriber
   */
  call(...args: Parameters<T>): void;

  /**
   * Subscribe a new subscriber.
   * @param cb - The callback function to subscribe
   * @returns A function to unsubscribe
   */
  subscribe(cb: T): () => void;

  /**
   * Delete all subscribers.
   */
  destroy(): void;
}

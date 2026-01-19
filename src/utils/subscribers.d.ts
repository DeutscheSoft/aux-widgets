/**
 * Utilities for handling subscribers.
 *
 * Subscribers are represented as:
 * - `null` for an empty list
 * - A single function for one subscriber
 * - An array of functions for multiple subscribers
 */

/**
 * Type representing a subscriber list.
 * Can be null (empty), a single function, or an array of functions.
 */
export type SubscriberList<T extends (...args: any[]) => void = (...args: any[]) => void> =
  | null
  | T
  | T[];

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
 * Add a subscriber to the given subscribers. Returns the new subscribers.
 * The subscriber list is optimized: single subscribers are stored as a function,
 * multiple subscribers as an array.
 *
 * @param subscribers - The current subscriber list
 * @param cb - The callback function to add
 * @returns The new subscriber list
 * @throws {TypeError} If cb is not a function or subscribers is invalid
 */
export function addSubscriber<T extends (...args: any[]) => void>(
  subscribers: SubscriberList<T>,
  cb: T
): SubscriberList<T>;

/**
 * Removes a subscriber callback from the list of subscribers and
 * returns the resulting list of subscribers.
 *
 * @param subscribers - The current subscriber list
 * @param cb - The callback function to remove
 * @returns The new subscriber list (may be null, a function, or an array)
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
 * Optimizes storage: single subscribers are stored as a function,
 * multiple subscribers as an array.
 */
export class Subscribers<T extends (...args: any[]) => void = (...args: any[]) => void> {
  /** @internal The subscriber list */
  subscribers: SubscriberList<T>;

  constructor();

  /**
   * Add a subscriber.
   * @param cb - The callback function to add
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

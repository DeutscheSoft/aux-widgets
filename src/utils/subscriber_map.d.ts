import {
  SubscriberList,
  initSubscribers,
  addSubscriber,
  removeSubscriber,
  callSubscribers,
  subscribersIsEmpty,
} from './subscribers.js';

/**
 * A class for managing subscribers organized by keys.
 * Each key can have its own list of subscribers, which are optimized
 * similarly to the Subscribers class (null, function, or array).
 *
 * This is useful for event systems where different events (keys) have
 * different sets of subscribers.
 */
export class SubscriberMap<TKey = string, TSubscriber extends (...args: any[]) => void = (...args: any[]) => void> {
  /** @internal Map of keys to subscriber lists */
  subscribers: Map<TKey, SubscriberList<TSubscriber>>;

  constructor();

  /**
   * Add a subscriber for the given key.
   * @param key - The key to subscribe to
   * @param subscriber - The callback function to add
   */
  add(key: TKey, subscriber: TSubscriber): void;

  /**
   * Check if the given key has any subscribers.
   * @param key - The key to check
   * @returns True if the key has subscribers
   */
  has(key: TKey): boolean;

  /**
   * Remove all subscribers for the given key.
   * @param key - The key to clear
   */
  removeAll(key: TKey): void;

  /**
   * Remove a specific subscriber for the given key.
   * @param key - The key to remove from
   * @param subscriber - The callback function to remove
   */
  remove(key: TKey, subscriber: TSubscriber): void;

  /**
   * Call all subscribers for the given key with the given arguments.
   * @param key - The key to call subscribers for
   * @param args - Arguments to pass to each subscriber
   */
  call(key: TKey, ...args: Parameters<TSubscriber>): void;

  /**
   * Subscribe a new subscriber for the given key.
   * @param key - The key to subscribe to
   * @param cb - The callback function to subscribe
   * @returns A function to unsubscribe
   */
  subscribe(key: TKey, cb: TSubscriber): () => void;
}

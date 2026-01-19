/**
 * Utilities for handling subscriptions.
 *
 * Subscriptions are represented by callbacks (which return void).
 * This is usually used when grouping unsubscribe/cleanup functions.
 *
 * @module utils/subscriptions
 */

/**
 * A subscription callback function that performs cleanup/unsubscribe operations.
 * Returns void.
 */
export type SubscriptionCallback = () => void;

/**
 * A subscription can be:
 * - `null` (no subscription)
 * - A single callback function
 * - An array of callback functions
 * - An object with an `unsubscribe` method
 */
export type SubscriptionInput =
  | null
  | SubscriptionCallback
  | SubscriptionCallback[]
  | { unsubscribe: () => void };

/**
 * Internal representation of subscriptions.
 * Can be `null`, a single callback, or an array of callbacks.
 */
type SubscriptionsInternal =
  | null
  | SubscriptionCallback
  | SubscriptionCallback[];

/**
 * Initializes an empty subscriptions object.
 *
 * @returns `null` representing no subscriptions
 */
export function initSubscriptions(): null;

/**
 * Adds a subscription to the existing subscriptions.
 * This function may modify the first argument.
 *
 * @param subscriptions - The existing subscriptions (can be `null`, a function, or an array)
 * @param subscription - The subscription to add (can be `null`, a function, an array, or an object with `unsubscribe`)
 * @returns The updated subscriptions (may be the same reference as the first argument)
 */
export function addSubscription(
  subscriptions: SubscriptionsInternal,
  subscription: SubscriptionInput
): SubscriptionsInternal;

/**
 * Unsubscribes from all subscriptions by calling all callback functions.
 *
 * @param subscriptions - The subscriptions to unsubscribe from
 * @returns Always returns `null`
 */
export function unsubscribeSubscriptions(
  subscriptions: SubscriptionsInternal
): null;

/**
 * Represents a single subscription or a group of subscriptions.
 *
 * A subscription can be:
 * - A callback function
 * - An array of callback functions
 * - An object with an `unsubscribe` method (which will be bound)
 *
 * @example
 *      const subscription = new Subscription(() => {
 *        console.log('Cleanup');
 *      });
 *      // Later...
 *      subscription.unsubscribe();
 */
export class Subscription {
  /**
   * Creates a new Subscription instance.
   *
   * @param subscription - The subscription to wrap. If `undefined`, creates an empty subscription.
   *   Can be a function, array of functions, or an object with an `unsubscribe` method.
   * @throws {TypeError} If the subscription type is not supported
   */
  constructor(subscription?: SubscriptionInput);

  /**
   * Unsubscribes from all subscriptions.
   * After calling this, the subscription is closed.
   */
  unsubscribe(): void;

  /**
   * A binary flag which indicates that this subscription has
   * already been unsubscribed.
   */
  readonly closed: boolean;
}

/**
 * Represents a set of subscriptions that can be added to over time.
 *
 * Extends `Subscription` with the ability to add more subscriptions
 * after creation.
 *
 * @example
 *      const subscriptions = new Subscriptions();
 *      subscriptions.add(() => console.log('Cleanup 1'));
 *      subscriptions.add(() => console.log('Cleanup 2'));
 *      // Later...
 *      subscriptions.unsubscribe(); // Calls both cleanup functions
 */
export class Subscriptions extends Subscription {
  /**
   * Creates a new Subscriptions instance.
   *
   * @param subscription - Optional initial subscription(s)
   */
  constructor(subscription?: SubscriptionInput);

  /**
   * Adds a subscription to this set.
   *
   * @param subscription - The subscription to add. Can be a function,
   *   an array of functions, or an object with an `unsubscribe` method.
   */
  add(subscription: SubscriptionInput): void;
}

/**
 * Combines multiple subscriptions into a single unsubscribe function.
 *
 * @param args - Variable number of subscription inputs to combine
 * @returns A function that, when called, unsubscribes from all combined subscriptions
 *
 * @example
 *      const unsubscribe = combineSubscriptions(
 *        () => console.log('Cleanup 1'),
 *        () => console.log('Cleanup 2')
 *      );
 *      // Later...
 *      unsubscribe(); // Calls both cleanup functions
 */
export function combineSubscriptions(
  ...args: SubscriptionInput[]
): SubscriptionCallback;

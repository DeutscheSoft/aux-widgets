/**
 * This file exists in both `@deutschesoft/aux-widgets` and `@deutschesoft/awml`
 * (`src/utils/get_current_value.js`) and must be kept in sync.
 */

/**
 * Synchronously sample the current value of a {@link ReadableValue}.
 *
 * @module utils/get_current_value
 */

/**
 * Returns the value delivered synchronously during `subscribe`, or
 * `initialValue` if the source did not emit before `subscribe` returned.
 *
 * Stateful sources (e.g. AWML `DynamicValue`, RxJS `BehaviorSubject`) emit
 * their current value on subscribe; pure event streams typically do not.
 *
 * @template T
 * @param {{ subscribe: function }} readable
 * @param {T} [initialValue]
 * @returns {T|undefined}
 */
export function getCurrentValue(readable, initialValue) {
  let value = initialValue;

  const unsubscribe = readable.subscribe((next) => {
    value = next;
  });
  unsubscribe();

  return value;
}

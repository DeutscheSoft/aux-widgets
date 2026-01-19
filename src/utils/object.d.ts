/**
 * Collection of functions operating on objects.
 */

/**
 * Merge two or more objects. The second and all following objects
 * will be merged into the first one (mutates the first object).
 *
 * @param dst - The destination object to merge into (will be mutated)
 * @param sources - One or more source objects to merge from
 * @returns The destination object (same reference as dst)
 *
 * @example
 *      const obj = { a: 1 };
 *      merge(obj, { b: 2 }, { c: 3 });
 *      // obj is now { a: 1, b: 2, c: 3 }
 */
export function merge<T extends Record<string, any>>(
  dst: T,
  ...sources: Array<Record<string, any>>
): T;

/**
 * Filter an object via white list.
 * Returns a new object containing only the keys that exist in the filter object.
 *
 * @param orig - The object to filter
 * @param filter - The object containing the white list (keys to keep)
 * @returns A new object with only the whitelisted keys
 *
 * @example
 *      objectAnd({ a: 1, b: 2, c: 3 }, { a: true, c: true });
 *      // returns { a: 1, c: 3 }
 */
export function objectAnd<T extends Record<string, any>>(
  orig: T,
  filter: Record<string, any>
): Partial<T>;

/**
 * Filter an object via black list.
 * Returns a new object containing only the keys that do NOT exist in the filter object.
 *
 * @param orig - The object to filter
 * @param filter - The object containing the black list (keys to remove)
 * @returns A new object without the blacklisted keys
 *
 * @example
 *      objectSub({ a: 1, b: 2, c: 3 }, { b: true });
 *      // returns { a: 1, c: 3 }
 */
export function objectSub<T extends Record<string, any>>(
  orig: T,
  filter: Record<string, any>
): Partial<T>;

/**
 * Convert any collection (like NodeList) into an array.
 *
 * @param collection - The collection to convert into an array (must have length property and numeric indices)
 * @returns An array containing the elements from the collection
 *
 * @example
 *      const nodeList = document.querySelectorAll('div');
 *      const array = toArray(nodeList);
 */
export function toArray<T>(collection: ArrayLike<T>): T[];

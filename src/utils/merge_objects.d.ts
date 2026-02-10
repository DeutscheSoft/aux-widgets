/**
 * Merges multiple objects into a new object, with optimizations for no-op cases.
 *
 * This function intelligently merges objects by detecting when merging would be a no-op
 * (i.e., when one object completely shadows another). In such cases, it returns the
 * shadowing object directly without creating a new merged object. This optimization
 * makes caching easier when values have not changed, as the same object reference
 * is returned.
 *
 * The function filters out null and empty objects before merging. If all objects are
 * filtered out, it returns an empty object.
 *
 * @param args - One or more objects to merge. Null and empty objects are filtered out.
 * @returns A new merged object, one of the original objects if merging is a no-op, or an empty object if all inputs are filtered out
 * @throws {Error} If no arguments are provided
 * @throws {TypeError} If any argument is not an object
 *
 * @example
 *      // Basic merge
 *      mergeObjects({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 *
 *      // Optimization: if b shadows a, returns b directly
 *      const a = { x: 1 };
 *      const b = { x: 1, y: 2 };
 *      mergeObjects(a, b); // returns b (same reference, no merge needed)
 *
 *      // Filters null/empty
 *      mergeObjects(null, { a: 1 }, null, { b: 2 }); // { a: 1, b: 2 }
 */
export function mergeObjects<
  T extends Record<string, unknown> = Record<string, unknown>
>(...args: Array<T | null | undefined>): T | Record<string, never>;

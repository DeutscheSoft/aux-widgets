/**
 * Compares two plain objects (with null prototype) for equality.
 * Returns true if both objects have the same keys and values.
 *
 * @param a - First object to compare
 * @param b - Second object to compare
 * @returns True if the objects are equal, false otherwise
 *
 * @example
 *      compareObjects({ a: 1, b: 2 }, { a: 1, b: 2 }); // true
 *      compareObjects({ a: 1 }, { a: 1, b: 2 }); // false
 */
export function compareObjects(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean;

/**
 * Returns true if b shadows a, i.e. merging a and b results
 * in an object which is equal to b.
 * This means all keys in a must exist in b with the same values.
 *
 * @param a - The base object
 * @param b - The object that may shadow a
 * @returns True if b shadows a, false otherwise
 * @throws {TypeError} If either argument is not an object
 *
 * @example
 *      objectShadows({ a: 1 }, { a: 1, b: 2 }); // true
 *      objectShadows({ a: 1, b: 2 }, { a: 1 }); // false
 */
export function objectShadows(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean;

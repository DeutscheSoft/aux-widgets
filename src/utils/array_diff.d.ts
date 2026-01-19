/**
 * Calculates a diff between two arrays. Returns two arrays. The first
 * contains all items in the first array which are missing from the
 * second array. The second contains all items of the second array which
 * are not in the first.
 * @param a - The first array.
 * @param b - The second array.
 * @returns A tuple containing [items_in_a_not_in_b, items_in_b_not_in_a].
 */
export function arrayDiff<T>(a: T[] | null | undefined, b: T[] | null | undefined): [T[], T[]];

/**
 * Calculates the diff between two arrays. Then calls the function
 * removed for each item which is contained in a and not in b. Then
 * calls the function added for each item which is contained in b and
 * not in a.
 * @param a - The first array.
 * @param b - The second array.
 * @param removed - Callback function called for each item in a but not in b. Receives (item, index, array).
 * @param added - Callback function called for each item in b but not in a. Receives (item, index, array).
 */
export function forEachArrayDiff<T>(
  a: T[] | null | undefined,
  b: T[] | null | undefined,
  removed: (item: T, index: number, array: T[]) => void,
  added: (item: T, index: number, array: T[]) => void
): void;

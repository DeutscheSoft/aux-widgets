/**
 * Interval sets are represented as arrays of numbers where consecutive pairs
 * [a, b] represent closed intervals [a, b] (inclusive on both ends).
 * Intervals are stored in sorted order and are non-overlapping.
 *
 * For example, the array [10, 20, 30, 40] represents two intervals:
 * [10, 20] and [30, 40].
 *
 * These functions are useful for representing ranges, selections, or any
 * set of numeric intervals that need to be manipulated (merged, intersected,
 * inverted, etc.).
 */

/**
 * Interval mask constants used in iterateTwoIntervals to indicate which
 * intervals are present in a comparison.
 */
export const intervalMaskZero: 0;
export const intervalMaskFirst: 1;
export const intervalMaskSecond: 2;
export const intervalMaskBoth: 3;

/**
 * Type representing an interval set as an array of numbers.
 * Consecutive pairs [a, b] represent closed intervals [a, b].
 */
export type IntervalSet = number[];

/**
 * Returns an empty interval set.
 */
export function emptyIntervals(): IntervalSet;

/**
 * Checks if an interval set is empty.
 * @param intervals - The interval set to check
 * @returns True if the interval set is empty
 */
export function isEmptyIntervals(intervals: IntervalSet): boolean;

/**
 * Clears an interval set by setting its length to 0.
 * @param intervals - The interval set to clear (modified in place)
 */
export function clearIntervals(intervals: IntervalSet): void;

/**
 * Adds the closed interval [lhs, rhs] into intervals. Assumes that lhs <= rhs.
 * The intervals array is modified in place and merged with existing intervals
 * if they overlap or are adjacent.
 *
 * @param intervals - The interval set to add to (modified in place)
 * @param lhs - The left bound of the interval (must be <= rhs)
 * @param rhs - The right bound of the interval (must be >= lhs)
 * @returns The modified intervals array
 * @throws {TypeError} If intervals is not a valid interval set (odd length)
 * @throws {Error} If lhs > rhs
 *
 * @example
 *      const intervals = emptyIntervals();
 *      addInterval(intervals, 10, 20); // [10, 20]
 *      addInterval(intervals, 25, 30); // [10, 20, 25, 30]
 *      addInterval(intervals, 15, 27); // [10, 30] (merged)
 */
export function addInterval(
  intervals: IntervalSet,
  lhs: number,
  rhs: number
): IntervalSet;

/**
 * Adds all intervals from `other` into `intervals`. The first argument is
 * modified destructively.
 *
 * @param intervals - The interval set to add to (modified in place)
 * @param other - The interval set to add from
 * @returns The modified intervals array
 */
export function addIntervals(
  intervals: IntervalSet,
  other: IntervalSet
): IntervalSet;

/**
 * Inverts the intervals within the range [min, max].
 * The intervals array is modified in place.
 *
 * @param intervals - The interval set to invert (modified in place)
 * @param min - The minimum value of the range
 * @param max - The maximum value of the range
 * @returns The modified intervals array
 *
 * @example
 *      const intervals = [10, 20, 30, 40];
 *      invertIntervals(intervals, 0, 50);
 *      // Result: [0, 9, 21, 29, 41, 50]
 */
export function invertIntervals(
  intervals: IntervalSet,
  min: number,
  max: number
): IntervalSet;

/**
 * Computes the difference between two interval sets and calls callbacks
 * for intervals that are added or removed.
 *
 * @param prev - The previous interval set
 * @param current - The current interval set
 * @param add - Callback to call for each interval [a, b] which is in current but not in prev.
 *              The callback can return a truthy value to stop iteration.
 * @param remove - Callback to call for each interval [a, b] which is in prev but not in current.
 *                 The callback can return a truthy value to stop iteration.
 */
export function diffIntervals(
  prev: IntervalSet,
  current: IntervalSet,
  add: (a: number, b: number) => void | boolean,
  remove: (a: number, b: number) => void | boolean
): void;

/**
 * Iterates over two interval sets simultaneously, calling the callback for each
 * segment with a mask indicating which intervals are present.
 *
 * The mask values are:
 * - `intervalMaskZero` (0): Neither interval set covers this segment
 * - `intervalMaskFirst` (1): Only the first interval set covers this segment
 * - `intervalMaskSecond` (2): Only the second interval set covers this segment
 * - `intervalMaskBoth` (3): Both interval sets cover this segment
 *
 * @param a - The first interval set
 * @param b - The second interval set
 * @param callback - Function called for each segment with (lhs, rhs, mask).
 *                   Returning a truthy value stops iteration.
 * @param min - The minimum value to consider
 * @param max - The maximum value to consider
 */
export function iterateTwoIntervals(
  a: IntervalSet,
  b: IntervalSet,
  callback: (lhs: number, rhs: number, mask: 0 | 1 | 2 | 3) => void | boolean,
  min: number,
  max: number
): void;

/**
 * Calls the callback for each interval in the interval set.
 *
 * @param intervals - The interval set to iterate over
 * @param callback - Function called for each interval [a, b]
 * @param startIndex - Optional starting index (default: 0)
 */
export function forEachInterval(
  intervals: IntervalSet,
  callback: (a: number, b: number) => void,
  startIndex?: number
): void;

/**
 * Creates a copy of the interval set.
 *
 * @param intervals - The interval set to copy
 * @returns A new array containing the same intervals
 */
export function copyIntervals(intervals: IntervalSet): IntervalSet;

/**
 * Computes the intersection of two interval sets.
 * Returns a new interval set containing only intervals that exist in both sets.
 *
 * @param a - The first interval set
 * @param b - The second interval set
 * @returns A new interval set representing the intersection
 *
 * @example
 *      const a = [10, 20, 30, 40];
 *      const b = [15, 25, 35, 45];
 *      intersectIntervals(a, b); // [15, 20, 35, 40]
 */
export function intersectIntervals(a: IntervalSet, b: IntervalSet): IntervalSet;

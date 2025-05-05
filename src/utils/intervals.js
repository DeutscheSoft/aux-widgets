/**
 * @returns {number[]} The empty set.
 */
export function emptyIntervals() {
  return [];
}

/**
 *
 * @param {number[]} intervals
 * @returns
 */
export function isEmptyIntervals(intervals) {
  return intervals.length === 0;
}

/**
 *
 * @param {number[]} intervals
 */
export function clearIntervals(intervals) {
  intervals.length = 0;
}

/**
 * Adds the closed interval [lhs,rhs] into intervals. Assumes
 * that lhs <= rhs. Note that intervals is modified in place.
 *
 * @param {number[]} intervals
 * @param {number} lhs
 * @param {number} rhs
 * @returns {number[]} intervals
 */
export function addInterval(intervals, lhs, rhs) {
  if (intervals.length & 1)
    throw new TypeError('Argument is not an intervals set.');
  if (!(lhs <= rhs)) throw new Error('lhs <= rhs violated.');
  let i = 0;

  for (i = 0; i < intervals.length; i += 2) {
    const a = intervals[i];
    const b = intervals[i + 1];

    // lhs comes after this interval and there
    // is a least a gap of 1
    if (lhs > b + 1) continue;

    // rhs comes before this interval and there
    // is at least a gap of 1
    if (rhs + 1 < a) {
      intervals.splice(i, 0, lhs, rhs);
      return intervals;
    }

    intervals[i] = Math.min(lhs, a);

    if (rhs <= b) return intervals;

    intervals[i + 1] = rhs;

    // maybe absorb following intervals
    while (i + 2 < intervals.length) {
      const nextA = intervals[i + 2];
      const nextB = intervals[i + 3];

      // b comes before the next interval and
      // there is at least a gap of 1
      if (nextA > rhs + 1) return intervals;

      // absorb the next interval
      intervals.splice(i + 2, 2);

      if (rhs <= nextB) {
        intervals[i + 1] = nextB;
        return intervals;
      }
    }

    return intervals;
  }

  if (i >= intervals.length) {
    intervals.push(lhs, rhs);
  }

  return intervals;
}

/**
 * Adds the intervals in `other` to `intervals`. The first argument is
 * modified destructively.
 *
 * @param {number[]} intervals
 * @param {number[]} other
 */
export function addIntervals(intervals, other) {
  for (let i = 0; i < other.length; i += 2) {
    addInterval(intervals, other[i], other[i + 1]);
  }
  return intervals;
}

/**
 * Inverts the intervals.
 *
 * @param {number[]} intervals
 * @param {number} min
 * @param {number} max
 */
export function invertIntervals(intervals, min, max) {
  let prev = min - 1;
  //const result = [];

  for (let i = 0; i < intervals.length; i += 2) {
    const a = intervals[i];
    const b = intervals[i + 1];

    if (prev + 1 < a) {
      intervals[i] = prev + 1;
      intervals[i + 1] = a - 1;
      //result.push(prev+1,a-1);
    } else {
      intervals.splice(i, 2);
      i -= 2;
    }
    prev = b;
  }

  if (prev + 1 < max) {
    intervals.push(prev + 1, max);
    //result.push(prev+1,max);
  }

  //intervals.length = 0;
  //intervals.push(...result);
  return intervals;
}

/**
 *
 * @param {number[]} prev
 *  The previous intervals.
 * @param {number[]} current
 *  The current intervals.
 * @param {(a: number, b: number) => boolean|undefined} add
 *  Callback to call for each interval [a,b] which is in current and not in prev.
 * @param {(a: number, b: number) => boolean|undefined} remove
 *  Callback to call for each interval [a,b] which is in prev but not in current.
 */
export function diffIntervals(prev, current, add, remove) {
  if (isEmptyIntervals(prev)) {
    forEachInterval(current, add);
    return;
  } else if (isEmptyIntervals(current)) {
    forEachInterval(prev, remove);
    return;
  }

  const min = Math.min(current[0], prev[0]);
  const max = Math.max(current[current.length - 1], prev[prev.length - 1]);

  iterateTwoIntervals(
    prev,
    current,
    (lhs, rhs, mask) => {
      switch (mask) {
        case intervalMaskBoth:
        case intervalMaskZero:
          return;
        case intervalMaskFirst:
          return remove(lhs, rhs);
        case intervalMaskSecond:
          return add(lhs, rhs);
      }
    },
    min,
    max
  );
}

export const intervalMaskZero = 0;
export const intervalMaskFirst = 1;
export const intervalMaskSecond = 2;
export const intervalMaskBoth = 3;

/**
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {(lhs: number, rhs: number, mask: number) => boolean} callback
 */
export function iterateTwoIntervals(a, b, callback, min, max) {
  let aIndex = 0;
  let bIndex = 0;

  let prev = min - 1;

  let aLhs = a[aIndex];
  let aRhs = a[aIndex + 1];
  let bLhs = b[bIndex];
  let bRhs = b[bIndex + 1];

  while (aIndex < a.length && bIndex < b.length) {
    const minLhs = Math.min(aLhs, bLhs);

    if (minLhs > prev + 1) {
      if (callback(prev + 1, minLhs - 1, intervalMaskZero)) return;
    }

    if (aRhs < bLhs) {
      if (callback(aLhs, aRhs, intervalMaskFirst)) return;
      prev = aRhs;
    } else if (bRhs < aLhs) {
      if (callback(bLhs, bRhs, intervalMaskSecond)) return;
      prev = bRhs;
    } else {
      const maxLhs = Math.max(aLhs, bLhs);
      const minRhs = Math.min(aRhs, bRhs);

      if (aLhs < maxLhs) {
        if (callback(aLhs, maxLhs - 1, intervalMaskFirst)) return;
      } else if (bLhs < maxLhs) {
        if (callback(bLhs, maxLhs - 1, intervalMaskSecond)) return;
      }

      if (callback(maxLhs, minRhs, intervalMaskBoth)) return;
      prev = aLhs = bLhs = minRhs;
    }

    const stepB = aRhs >= bRhs;
    const stepA = aRhs <= bRhs;

    if (stepB) {
      bIndex += 2;
      bLhs = b[bIndex];
      bRhs = b[bIndex + 1];
    }

    if (stepA) {
      aIndex += 2;
      aLhs = a[aIndex];
      aRhs = a[aIndex + 1];
    }
  }

  while (aIndex < a.length) {
    if (aLhs > prev + 1) {
      if (callback(prev + 1, aLhs - 1, intervalMaskZero)) return;
    }
    if (callback(aLhs, aRhs, intervalMaskFirst)) return;
    aIndex += 2;
    aLhs = a[aIndex];
    aRhs = a[aIndex + 1];
    prev = aRhs;
  }

  while (bIndex < b.length) {
    if (bLhs > prev + 1) {
      if (callback(prev + 1, bLhs - 1, intervalMaskZero)) return;
    }
    if (callback(bLhs, bRhs, intervalMaskSecond)) return;
    bIndex += 2;
    bLhs = b[bIndex];
    bRhs = b[bIndex + 1];
    prev = bRhs;
  }

  if (prev < max) {
    if (callback(prev + 1, max, intervalMaskZero)) return;
  }
}

/**
 * Call callback for each interval in intervals.
 * @param {number[]} intervals
 * @param {(a: number, b: number) => void} callback
 * @param {number} [startIndex=0]
 */
export function forEachInterval(intervals, callback, startIndex = 0) {
  for (let i = startIndex; i < intervals.length; i += 2) {
    const lhs = intervals[i];
    const rhs = intervals[i + 1];

    callback(lhs, rhs);
  }
}

/**
 * @param {number[]} intervals
 * @returns
 *  A copy of the intervals.
 */
export function copyIntervals(intervals) {
  return intervals.slice(0);
}

/**
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns
 *  Returns the intersection of two intervals.
 */
export function intersectIntervals(a, b) {
  const intersection = emptyIntervals();

  if (!isEmptyIntervals(a) && !isEmptyIntervals(b)) {
    iterateTwoIntervals(a, b, (lhs, rhs, mask) => {
      if (mask === intervalMaskBoth) addInterval(intersection, lhs, rhs);
    });
  }

  return intersection;
}

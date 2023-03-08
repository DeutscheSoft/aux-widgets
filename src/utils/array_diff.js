/**
 * Calculates a diff between two arrays. Returns two arrays. The first
 * contains all items in the first array which are missing from the
 * second array. The second contains all items of the second array which
 * are not in the first.
 */
export function arrayDiff(a, b) {
  if (a === b) return [[], []];

  if (!a || !a.length) return [[], b];

  if (!b || !b.length) return [a, []];

  // Generic algorithm. This has O(n^2) complexity, however we usually
  // deal with small arrays where this is significantly faster than
  // creating two temporary Sets.
  return [
    a.filter((item, i) => b[i] !== item && !b.includes(item)),
    b.filter((item, i) => a[i] !== item && !a.includes(item)),
  ];
}

/**
 * Calculates the diff between two arrays. Then calls the function
 * removed for each item which is contained in a and not in b. Then
 * calls the function added for each item which is contained in b and
 * not in a.
 */
export function forEachArrayDiff(a, b, removed, added) {
  if (a === b) return;

  if (!a || !a.length) {
    if (b) b.forEach(added);
    return;
  }

  if (!b || !b.length) {
    if (a) a.forEach(removed);
    return;
  }

  for (let i = 0; i < a.length; i++) {
    const item = a[i];
    if (b[i] === item || b.includes(item)) continue;

    removed(item, i, a);
  }

  for (let i = 0; i < b.length; i++) {
    const item = b[i];
    if (a[i] === item || a.includes(item)) continue;

    added(item, i, b);
  }
}

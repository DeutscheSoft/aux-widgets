const nullPrototype = Object.getPrototypeOf({});

export function compareObjects(a, b) {
  if (a === b) return true;

  if (typeof a !== typeof b || typeof a !== 'object') return false;

  if (
    Object.getPrototypeOf(a) !== nullPrototype ||
    Object.getPrototypeOf(b) !== nullPrototype
  )
    return false;

  for (const key in a) {
    if (b[key] !== a[key]) return false;
  }

  for (const key in b) {
    if (b[key] !== a[key]) return false;
  }

  return true;
}

//! Returns true if b shadows a, i.e. merging a and b results
//! in an object which is equal to b.
export function objectShadows(a, b) {
  if (a === b) return true;

  if (typeof a !== typeof b || typeof a !== 'object')
    throw new TypeError('Expected object.');

  if (
    Object.getPrototypeOf(a) !== nullPrototype ||
    Object.getPrototypeOf(b) !== nullPrototype
  )
    return false;

  for (const key in a) {
    if (!(key in b)) return false;
  }

  return true;
}

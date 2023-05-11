/**
 * Returns the first value which is not undefined. It may be null
 * which is a way to signal that a certain aria attribute should
 * not be set.
 */
export function selectAriaAttribute(...values) {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value !== void 0) return value;
  }
}

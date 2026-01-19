/**
 * Returns a formatting function for numerical values for reducing
 * the amount of digits displayed by adding SI prefixes (k, M, G, T, P).
 *
 * The returned function formats numbers by:
 * - Limiting the number of digits displayed
 * - Adding SI prefixes (kilo, mega, giga, tera, peta) when needed
 * - Appending an optional suffix string
 *
 * @param limit - The amount of digits to display, excluding the SI prefix
 * @param add - An optional additional string to add at the end (e.g., 'B' for bytes). Defaults to empty string
 * @param base - The base for calculations. Defaults to 1000
 * @returns A formatting function that takes a numeric value and returns a formatted string
 *
 * @example
 *      const formatter = limitDigits(3, 'B');
 *      formatter(1024); // "1.02kB"
 *      formatter(1048576); // "1.05MB"
 */
export function limitDigits(
  limit: number,
  add?: string,
  base?: number
): (value: number | string) => string;

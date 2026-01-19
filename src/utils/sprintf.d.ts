/**
 * Module containing sprintf like formatting functions.
 */

/**
 * Generates formatting functions from sprintf-style format strings.
 * This is generally faster when the same format string is used many times.
 *
 * Supported format specifiers:
 * - `%d` - Integer (converts to integer)
 * - `%f` - Float (converts to number)
 * - `%.Nf` - Float with precision N (e.g., `%.2f` for 2 decimal places)
 * - `%s` - String
 * - `%o` or `%O` - Object (JSON.stringify)
 * - `%%` - Literal percent sign
 *
 * @param fmt - The format string
 * @returns A formatting function that takes arguments matching the format specifiers
 *
 * @example
 *      const f = FORMAT("%.2f Hz");
 *      const result = f(440.123); // "440.12 Hz"
 */
export function FORMAT(fmt: string): (...args: any[]) => string;

/**
 * Formats the arguments according to a given format string.
 *
 * Supported format specifiers:
 * - `%d` - Integer (converts to integer)
 * - `%f` - Float (converts to number)
 * - `%.Nf` - Float with precision N (e.g., `%.2f` for 2 decimal places)
 * - `%s` - String
 * - `%o` or `%O` - Object (JSON.stringify)
 * - `%%` - Literal percent sign
 *
 * @param fmt - The format string
 * @param args - The format arguments (variable number of arguments)
 * @returns The formatted string
 *
 * @example
 *      sprintf("%d Hz", 440); // "440 Hz"
 *      sprintf("%.1f", 1.45); // "1.5"
 *      sprintf("%s", "test"); // "test"
 */
export function sprintf(fmt: string, ...args: any[]): string;

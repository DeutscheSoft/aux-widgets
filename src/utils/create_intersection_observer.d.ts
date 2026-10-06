/**
 * Creates an IntersectionObserver, or a compatible stand-in when the
 * API is unavailable (e.g. jsdom).
 *
 * The stand-in reports every observed element as intersecting, so
 * callers can treat "no IntersectionObserver" as "everything visible"
 * without special-casing observe/unobserve/disconnect.
 *
 * @param callback - Called with intersection entries
 * @param options - Options passed to IntersectionObserver when available
 * @returns A real IntersectionObserver, or a duck-typed stand-in
 *
 * @example
 *      const observer = createIntersectionObserver((entries) => {
 *        for (const entry of entries) {
 *          console.log(entry.target, entry.isIntersecting);
 *        }
 *      }, { root: element });
 *      observer.observe(child);
 *      // Later...
 *      observer.disconnect();
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver;

/**
 * Tracks resizes of the given list of elements using a ResizeObserver.
 * The callback will be called whenever the resize observer triggers.
 * Returns an unsubscription callback which can be used to stop the
 * observation.
 *
 * @param elements - An iterable collection of elements to observe (e.g., array, NodeList)
 * @param callback - A function to call whenever any of the elements resize
 * @returns A function to disconnect the observer (or a no-op function if ResizeObserver is not available)
 *
 * @example
 *      const unsubscribe = observeResize([element1, element2], () => {
 *        console.log('Element resized');
 *      });
 *      // Later...
 *      unsubscribe();
 */
export function observeResize(
  elements: Iterable<Element>,
  callback: () => void
): () => void;

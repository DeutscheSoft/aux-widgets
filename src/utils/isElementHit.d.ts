/**
 * Returns true if the given element is "hit" by the viewport coordinates
 * clientX and clientY. This function correctly handles elements contained
 * inside of a shadow DOM.
 *
 * The function checks if the element at the given coordinates is the target
 * element itself or is contained within it, traversing shadow DOM boundaries
 * as needed.
 *
 * @param element - The element to check if it's hit
 * @param clientX - The X coordinate in viewport/client coordinates
 * @param clientY - The Y coordinate in viewport/client coordinates
 * @returns True if the element is hit by the coordinates, false otherwise
 *
 * @example
 *      const element = document.getElementById('my-element');
 *      if (isElementHit(element, event.clientX, event.clientY)) {
 *        // Element was hit by the mouse/pointer
 *      }
 */
export function isElementHit(
  element: Element,
  clientX: number,
  clientY: number
): boolean;

/**
 * Returns true if the given element is "hit" by the viewport coordinates
 * clientX and clientY. This function does handle elements contained
 * inside of a shadow dom correctly.
 * @param {Element} element
 * @param {number} clientX
 * @param {number} clientY
 */
export function isElementHit(element, clientX, clientY) {
  let target = document.elementFromPoint(clientX, clientY);

  do {
    if (target === element || element.contains(target)) return true;

    if (!target.shadowRoot) break;

    const tmp = target.shadowRoot.elementFromPoint(clientX, clientY);

    if (tmp === target) break;
    target = tmp;
  } while (true);

  return false;
}

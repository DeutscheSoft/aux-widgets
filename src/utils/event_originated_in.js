/**
 * Returns true if the event originated inside of the given element. This function
 * also handles composed events which will bubble across a shadow DOM boundary.
 *
 * @param {Event} event
 * @param {EventTarget} element
 */
export function eventOriginatedIn(event, element) {
  if (event.composed) {
    return event.composedPath().includes(element);
  } else {
    for (let target = event.target; target; target = target.parentElement) {
      if (target === element) return true;
    }
    return false;
  }
}

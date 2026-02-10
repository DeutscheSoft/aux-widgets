/**
 * Returns true if the event originated inside of the given element.
 * This function also handles composed events which will bubble across
 * a shadow DOM boundary.
 *
 * For composed events (events that cross shadow DOM boundaries), this
 * function uses the event's composedPath() to check if the element is
 * in the path. For non-composed events, it traverses the parent chain
 * from event.target.
 *
 * @param event - The event to check
 * @param element - The element to check if the event originated within
 * @returns True if the event originated inside the element, false otherwise
 *
 * @example
 *      element.addEventListener('click', (event) => {
 *        if (eventOriginatedIn(event, someChildElement)) {
 *          // Event originated in someChildElement
 *        }
 *      });
 */
export function eventOriginatedIn(event: Event, element: EventTarget): boolean;

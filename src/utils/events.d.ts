export function addEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
): void;
export function removeEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | boolean
): void;
export function addActiveEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject
): void;
export function removeActiveEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject
): void;
export function addPassiveEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject
): void;
export function removePassiveEventListener(
  e: EventTarget | EventTarget[],
  type: string,
  cb: EventListenerOrEventListenerObject
): void;
export function isDOMEvent(type: string): boolean;
export function subscribeDOMEvent(
  node: EventTarget,
  event_name: string,
  cb: EventListenerOrEventListenerObject
): void;
export function subscribeDOMEventOnce(
  node: EventTarget,
  event_name: string,
  cb: EventListenerOrEventListenerObject
): void;

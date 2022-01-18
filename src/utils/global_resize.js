import { EventMultiplexer } from '../utils/event_multiplexer.js';
import { subscribeDOMEvent } from '../utils/events.js';

export const GlobalResize = new EventMultiplexer((cb) => {
  const sub1 = subscribeDOMEvent(window, 'resize', () => cb());
  const sub2 = subscribeDOMEvent(window, 'load', () => cb());
  const sub3 = subscribeDOMEvent(document.fonts, 'loadingdone', () => cb());

  return () => {
    sub1();
    sub2();
    sub3();
  };
});

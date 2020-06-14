import { EventMultiplexer } from '../utils/event_multiplexer.js';
import { subscribeDOMEvent } from '../utils/events.js';

export const GlobalVisibilityChange = new EventMultiplexer((cb) => {
  return subscribeDOMEvent(document, 'visibilitychange', cb, false);
});

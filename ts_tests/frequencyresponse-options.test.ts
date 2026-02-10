import { FrequencyResponse, IFrequencyResponseOptions } from '../src/widgets/frequencyresponse.js';

// Valid FrequencyResponse options (extends Chart).
const fr: Partial<IFrequencyResponseOptions> = {
  label: 'FR',
  db_grid: 6,
  scale: 'log',
  depth: 1,
};

const frWidget = new FrequencyResponse(fr);
new FrequencyResponse({ scale: false });

// .set(key, value) API type-checking
frWidget.set('depth', 2);
// @ts-expect-error value for 'depth' must be number
frWidget.set('depth', '2');

// .get(key) API type-checking
const _frDepth: number | undefined = frWidget.get('depth');
// @ts-expect-error 'not_an_option_key' is not a valid option key
frWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
frWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
frWidget.on('not_an_event', () => {});

// Invalid depth type should be rejected.
const badFr: Partial<IFrequencyResponseOptions> = {
  // @ts-expect-error depth must be a number
  depth: '1',
};

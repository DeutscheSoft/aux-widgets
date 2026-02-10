import { FrequencyResponse, IFrequencyResponseOptions } from '../src/widgets/frequencyresponse.js';

// Valid FrequencyResponse options (extends Chart).
const fr: IFrequencyResponseOptions = {
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

// Invalid depth type should be rejected.
const badFr: IFrequencyResponseOptions = {
  // @ts-expect-error depth must be a number
  depth: '1',
};

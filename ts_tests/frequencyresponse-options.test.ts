import { FrequencyResponse, IFrequencyResponseOptions } from '../src/widgets/frequencyresponse.js';

// Valid FrequencyResponse options (extends Chart).
const fr: IFrequencyResponseOptions = {
  label: 'FR',
  db_grid: 6,
  scale: 'log',
  depth: 1,
};

new FrequencyResponse(fr);
new FrequencyResponse({ scale: false });

// Invalid depth type should be rejected.
const badFr: IFrequencyResponseOptions = {
  // @ts-expect-error depth must be a number
  depth: '1',
};

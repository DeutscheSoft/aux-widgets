import { Reverb, IReverbOptions } from '../src/widgets/reverb.js';

// Valid Reverb options (extends Chart).
const reverb: IReverbOptions = {
  label: 'Reverb',
  timeframe: 5000,
  delay: 0,
  gain: 1,
};

new Reverb(reverb);
new Reverb({ delay_min: 0, delay_max: 100 });

// Invalid timeframe type should be rejected.
const badReverb: IReverbOptions = {
  // @ts-expect-error timeframe must be a number
  timeframe: '5000',
};

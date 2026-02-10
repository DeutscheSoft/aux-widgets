import { Reverb, IReverbOptions } from '../src/widgets/reverb.js';

// Valid Reverb options (extends Chart).
const reverb: IReverbOptions = {
  label: 'Reverb',
  timeframe: 5000,
  delay: 0,
  gain: 1,
};

const reverbWidget = new Reverb(reverb);
new Reverb({ delay_min: 0, delay_max: 100 });

// .set(key, value) API type-checking
reverbWidget.set('timeframe', 3000);
// @ts-expect-error value for 'timeframe' must be number
reverbWidget.set('timeframe', '3000');

// Invalid timeframe type should be rejected.
const badReverb: IReverbOptions = {
  // @ts-expect-error timeframe must be a number
  timeframe: '5000',
};

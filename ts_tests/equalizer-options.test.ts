import { Equalizer, IEqualizerOptions } from '../src/widgets/equalizer.js';

// Valid Equalizer options (extends FrequencyResponse + EqualizerGraph).
const equalizer: IEqualizerOptions = {
  label: 'EQ',
  show_bands: true,
};

new Equalizer(equalizer);

// Invalid show_bands type should be rejected.
const badEqualizer: IEqualizerOptions = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

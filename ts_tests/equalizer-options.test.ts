import { Equalizer, IEqualizerOptions } from '../src/widgets/equalizer.js';

// Valid Equalizer options (extends FrequencyResponse + EqualizerGraph).
const equalizer: IEqualizerOptions = {
  label: 'EQ',
  show_bands: true,
};

const equalizerWidget = new Equalizer(equalizer);

// .set(key, value) API type-checking
equalizerWidget.set('show_bands', false);
// @ts-expect-error value for 'show_bands' must be boolean
equalizerWidget.set('show_bands', 1);

// Invalid show_bands type should be rejected.
const badEqualizer: IEqualizerOptions = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

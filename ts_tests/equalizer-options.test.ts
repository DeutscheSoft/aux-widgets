import { Equalizer, IEqualizerOptions } from '../src/index.js';

// Valid Equalizer options (extends FrequencyResponse + EqualizerGraph).
const equalizer: Partial<IEqualizerOptions> = {
  label: 'EQ',
  show_bands: true,
};

const equalizerWidget = new Equalizer(equalizer);

// .set(key, value) API type-checking
equalizerWidget.set('show_bands', false);
// @ts-expect-error value for 'show_bands' must be boolean
equalizerWidget.set('show_bands', 1);

// .get(key) API type-checking
const _equalizerShowBands: boolean | undefined = equalizerWidget.get(
  'show_bands'
);
// @ts-expect-error 'not_an_option_key' is not a valid option key
equalizerWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
equalizerWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
equalizerWidget.on('not_an_event', () => {});

// Invalid show_bands type should be rejected.
const badEqualizer: Partial<IEqualizerOptions> = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

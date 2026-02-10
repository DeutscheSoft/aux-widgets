import { Crossover, ICrossoverOptions } from '../src/index.js';

// Valid Crossover options (extends Equalizer).
const crossover: Partial<ICrossoverOptions> = {
  label: 'Crossover',
  show_bands: true,
};

const crossoverWidget = new Crossover(crossover);

// .set(key, value) API type-checking
crossoverWidget.set('show_bands', false);
// @ts-expect-error value for 'show_bands' must be boolean
crossoverWidget.set('show_bands', 1);

// .get(key) API type-checking
const _crossoverShowBands: boolean | undefined = crossoverWidget.get(
  'show_bands'
);
// @ts-expect-error 'not_an_option_key' is not a valid option key
crossoverWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
crossoverWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
crossoverWidget.on('not_an_event', () => {});

// Invalid show_bands type should be rejected.
const badCrossover: Partial<ICrossoverOptions> = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

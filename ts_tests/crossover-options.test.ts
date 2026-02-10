import { Crossover, ICrossoverOptions } from '../src/widgets/crossover.js';

// Valid Crossover options (extends Equalizer).
const crossover: ICrossoverOptions = {
  label: 'Crossover',
  show_bands: true,
};

const crossoverWidget = new Crossover(crossover);

// .set(key, value) API type-checking
crossoverWidget.set('show_bands', false);
// @ts-expect-error value for 'show_bands' must be boolean
crossoverWidget.set('show_bands', 1);

// Invalid show_bands type should be rejected.
const badCrossover: ICrossoverOptions = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

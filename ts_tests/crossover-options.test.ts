import { Crossover, ICrossoverOptions } from '../src/widgets/crossover.js';

// Valid Crossover options (extends Equalizer).
const crossover: ICrossoverOptions = {
  label: 'Crossover',
  show_bands: true,
};

new Crossover(crossover);

// Invalid show_bands type should be rejected.
const badCrossover: ICrossoverOptions = {
  // @ts-expect-error show_bands must be boolean
  show_bands: 1,
};

import { Spread, ISpreadOptions } from '../src/widgets/spread.js';

// Valid Spread options.
const spread: ISpreadOptions = {
  min: 0,
  max: 100,
  lower: 25,
  upper: 75,
  layout: 'right',
  bind_dblclick: true,
  reset_lower: 0,
  reset_upper: 100,
  show_scale: true,
};

new Spread(spread);
new Spread({ lower: 10, upper: 90 });

// Invalid layout should be rejected.
const badLayout: ISpreadOptions = {
  min: 0,
  max: 100,
  // @ts-expect-error layout must be 'left' | 'right' | 'top' | 'bottom'
  layout: 'center',
};

import { Fader, IFaderOptions } from '../src/widgets/fader.js';

// Valid Fader options should typecheck.
const faderOptions: IFaderOptions = {
  value: 0,
  layout: 'top',
  bind_click: true,
  bind_dblclick: true,
  reset: 0,
  show_scale: true,
  show_value: true,
  label: 'Volume',
  cursor: 'pointer',
  min: 0,
  max: 1,
};

const fader = new Fader(faderOptions);

// .set(key, value) API type-checking
fader.set('value', 0.5);
// @ts-expect-error value for 'value' must be number
fader.set('value', '0.5');

// Partial options via constructor are allowed.
new Fader({
  value: 0.5,
  layout: 'bottom',
});

// Invalid layout should be rejected.
const badLayout: IFaderOptions = {
  // @ts-expect-error layout must be 'top' | 'left' | 'right' | 'bottom'
  layout: 'middle',
};

// Invalid value type should be rejected.
new Fader({
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});


import { Fader, IFaderOptions } from '../src/index.js';

// Valid Fader options should typecheck.
const faderOptions: Partial<IFaderOptions> = {
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

// .get(key) API type-checking
const _faderValue: number | undefined = fader.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
fader.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
fader.on('set_value', (value: number) => { void value; });
// @ts-expect-error 'not_an_event' is not a valid event name
fader.on('not_an_event', () => {});

// Partial options via constructor are allowed.
new Fader({
  value: 0.5,
  layout: 'bottom',
});

// Invalid layout should be rejected.
const badLayout: Partial<IFaderOptions> = {
  // @ts-expect-error layout must be 'top' | 'left' | 'right' | 'bottom'
  layout: 'middle',
};

// Invalid value type should be rejected.
new Fader({
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});

